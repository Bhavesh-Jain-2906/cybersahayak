const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * Inspects and extracts text page-by-page from the cyber law PDF.
 */
async function loadCyberLawPdf(filePath) {
  const targetPath = filePath || path.join(process.cwd(), 'cyber-law.pdf');

  if (!fs.existsSync(targetPath)) {
    throw new Error(
      `Knowledge base PDF not found at "${targetPath}". Please ensure cyber-law.pdf is present in the workspace root or pass a valid path.`
    );
  }

  const buffer = fs.readFileSync(targetPath);
  const pages = [];

  const options = {
    pagerender: function (pageData) {
      return pageData.getTextContent().then(function (textContent) {
        let lastY;
        let text = '';
        for (const item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        pages.push({
          pageNumber: pageData.pageNumber,
          text: text.trim(),
          source: path.basename(targetPath),
        });
        return text;
      });
    },
  };

  const parsed = await pdf(buffer, options);

  return {
    numPages: parsed.numpages,
    info: parsed.info,
    pages: pages,
    totalCharacters: parsed.text.length,
    source: path.basename(targetPath),
  };
}

/**
 * Parses raw text lines from cyber-law.pdf into structured legal offence entries.
 * Handles wrapped lines, section classifications, and statutory acts.
 */
function parseLegalEntries(pages) {
  const entries = [];

  // Match pattern: "1. Tampering with computer source Documents Sec.65"
  // or "31. Bogus websites , Cyber Frauds Sec .420 IPC"
  // or "50. Online Sale of Drugs NDPS Act"
  const entryPattern = /^(\d+)\.\s+(.+?)\s+(Sec\s*\.?\s*[\w\d\.]+(?:\s+[A-Za-z]+)?|NDPS Act|Arms Act\.?)$/i;

  for (const page of pages) {
    const rawLines = page.text.split('\n').map((l) => l.trim()).filter(Boolean);
    const mergedLines = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (/^\d+\./.test(line) || /^Note/i.test(line)) {
        let current = line;
        while (
          i + 1 < rawLines.length &&
          !/^\d+\./.test(rawLines[i + 1]) &&
          !/^Note/i.test(rawLines[i + 1]) &&
          !/^Sl\.No/i.test(rawLines[i + 1]) &&
          !/^Cyber Law/i.test(rawLines[i + 1])
        ) {
          current += ' ' + rawLines[i + 1];
          i++;
        }
        mergedLines.push(current);
      }
    }

    for (const merged of mergedLines) {
      // Check for standalone statutory note
      if (/^Note/i.test(merged) && merged.toLowerCase().includes('empowers police inspector')) {
        entries.push({
          slNo: 'Note-78',
          offence: 'Investigation powers of Police Inspector for cases under IT Act',
          legalSection: 'Sec.78 IT Act',
          act: 'Information Technology Act, 2000 (IT Act)',
          pageNumber: page.pageNumber,
          source: page.source,
          raw: merged,
        });
        continue;
      }

      const match = merged.match(entryPattern);
      if (match) {
        const slNo = parseInt(match[1], 10);
        let offence = match[2].trim().replace(/\s+,/g, ',');
        let legalSection = match[3].trim().replace(/\s*\.\s*/g, '.');

        // Determine governing statutory Act
        let act = 'Information Technology Act, 2000 (IT Act)';
        if (/ipc/i.test(legalSection) || /ipc/i.test(merged)) {
          act = 'Indian Penal Code (IPC)';
        } else if (/copyright/i.test(offence) || /copyright/i.test(merged) || (slNo >= 40 && slNo <= 43)) {
          act = 'Copyright Act, 1957';
        } else if (/ndps/i.test(legalSection) || /drugs/i.test(offence)) {
          act = 'Narcotic Drugs and Psychotropic Substances (NDPS) Act';
        } else if (/arms/i.test(legalSection) || /arms/i.test(offence)) {
          act = 'Arms Act, 1959';
        }

        entries.push({
          slNo,
          offence,
          legalSection,
          act,
          pageNumber: page.pageNumber,
          source: page.source,
          raw: merged,
        });
      }
    }
  }

  return entries;
}

module.exports = {
  loadCyberLawPdf,
  parseLegalEntries,
};
