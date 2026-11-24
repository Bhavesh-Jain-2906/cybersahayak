/**
 * Domain-specific semantic expansion keywords mapping Indian cyber law provisions
 * to everyday citizen queries (UPI scams, fake profiles, hacking, phishing).
 */
const SEMANTIC_KEYWORD_MAP = {
  1: 'tampering source code, developer files, system code alteration, modifying computer source documents',
  2: 'computer hacking, unauthorized system penetration, data alteration, deleting database, virus attack',
  3: 'offensive messages, social media harassment, abusive electronic messages',
  4: 'receiving stolen phone, stolen laptop, stolen computer hardware, purchasing stolen devices',
  5: 'identity theft, fake profile, impersonating another person, stealing Aadhaar, using another person photos and name',
  6: 'cheating by personation, UPI scam, payment fraud, pretending to be bank official, OTP fraud, online cheating',
  7: 'violation of privacy, capturing private photos, sharing private pictures without consent, hidden camera',
  8: 'cyber terrorism, attacking national infrastructure, threatening sovereignty of India, critical information infrastructure',
  9: 'obscene content, publishing pornographic materials electronically, adult MMS sharing',
  10: 'sexually explicit material, transmitting non-consensual explicit acts electronically',
  11: 'child sexual abuse material, CSAM, transmitting material depicting children in explicit acts',
  12: 'lawful interception, government surveillance, decryption orders, monitoring computer resource',
  13: 'website blocking, blocking public access to URLs, IT Act blocking orders',
  14: 'traffic data collection, CERT-In cybersecurity monitoring, packet inspection',
  15: 'unauthorized access to protected systems, government servers, defense networks, critical systems',
  16: 'misrepresentation, false statements to Certifying Authority, fake digital certificates',
  17: 'breach of confidentiality, leaking customer data, privacy disclosure by service provider',
  18: 'false digital signature, fraudulent certificate publishing',
  19: 'publishing for fraudulent purpose, scam certificates',
  20: 'extra-territorial jurisdiction, cybercrimes committed outside India targeting Indian computers',
  24: 'intermediary liability, social media platform safe harbor, section 79 exemption, takedown notice',
  27: 'corporate liability, company cyber offences, director responsibility',
  28: 'threatening email, extortion via email, criminal intimidation by email, blackmail',
  29: 'insulting modesty of woman, cyberstalking, online harassment of females, vulgar comments',
  30: 'defamatory email, online character assassination, damaging reputation electronically',
  31: 'bogus websites, fake online shopping, cyber frauds, e-commerce scam, counterfeit web portals, cheating',
  32: 'email spoofing, fake sender ID, forged email headers, pretending to be company domain',
  33: 'making false electronic document, forging digital records, fake receipts',
  34: 'forgery for cheating, counterfeit documents created for financial cheating',
  35: 'forgery for harming reputation, deepfake, morphing pictures to ruin image',
  36: 'web jacking, hijacking website domain, defacing website, DNS redirection',
  37: 'email abuse, inbox bombing, abusive electronic mail',
  38: 'criminal intimidation, extortion threats, physical harm threats electronically',
  39: 'anonymous communication, intimidation from hidden identity, burner email threats',
  40: 'copyright infringement, illegal distribution of copyrighted digital works',
  41: 'abetting copyright piracy, knowingly distributing copyrighted files',
  42: 'repeat copyright conviction, enhanced penalty for software piracy',
  43: 'pirated software, crack software, unlicensed copy of computer programme, torrent software download',
  44: 'obscenity under IPC, distributing vulgar electronic files',
  45: 'blackmail, scurrilous electronic matter, extortion via indecent content',
  48: 'theft of computer hardware, stolen hard drive, stolen server, physical IT hardware theft',
  49: 'punishment for physical computer hardware theft',
  50: 'online drug sales, illegal pharmaceutical portals, NDPS contraband on internet, dark web narcotics',
  51: 'online sale of arms, illegal weapons on web, firearms trade on internet, arms act violation',
};

/**
 * Categorizes an offence based on keywords to enhance retrieval semantics.
 */
function getOffenceCategory(offence, legalSection, act) {
  const text = `${offence} ${legalSection} ${act}`.toLowerCase();

  if (/identity|impersonat|cheat|personation|bogus|fraud|forgery/i.test(text)) {
    return 'Identity Theft, Impersonation & Online Fraud';
  }
  if (/hack|tamper|alter|source document|protected system|damage|stolen/i.test(text)) {
    return 'Hacking, Unauthorized Access & Data Tampering';
  }
  if (/offensive|intimidation|threat|defamat|insult|modesty|abuse|stalking/i.test(text)) {
    return 'Cyber Harassment, Defamation & Intimidation';
  }
  if (/obscene|sexually explicit|children|child|pornography/i.test(text)) {
    return 'Obscenity & Explicit Content Violations';
  }
  if (/privacy|confidentiality|traffic data|intercept|monitoring|blocking|intermediary/i.test(text)) {
    return 'Privacy, Surveillance & Intermediary Regulation';
  }
  if (/copyright|infring|computer programme|piracy/i.test(text)) {
    return 'Software Copyright & Intellectual Property';
  }
  if (/terror|terrorism/i.test(text)) {
    return 'Cyber Terrorism & National Security';
  }
  if (/drug|arms/i.test(text)) {
    return 'Contraband & Illegal Online Trade';
  }
  return 'General Cyber Law & Offences';
}

/**
 * Creates rich, meaningful chunks from the parsed legal entries.
 * Each chunk preserves statutory references, legal act, page number, and semantic summary.
 */
function createSemanticChunks(entries) {
  const chunks = [];

  for (const entry of entries) {
    const category = getOffenceCategory(entry.offence, entry.legalSection, entry.act);
    const domainKeywords = SEMANTIC_KEYWORD_MAP[entry.slNo] || '';

    // Formulate a clean, semantically rich chunk text
    const content = `Offence: ${entry.offence}
Legal Section: ${entry.legalSection}
Governing Act: ${entry.act}
Legal Category: ${category}
Related Concepts & Scenarios: ${domainKeywords}
Official Reference: Sl.No ${entry.slNo}, ${entry.source} (Page ${entry.pageNumber})
Summary: Under Indian Cyber Law (${entry.act}), the offence of "${entry.offence}" is prosecuted under ${entry.legalSection}.`;

    chunks.push({
      id: `chunk-sec-${entry.slNo}-${entry.pageNumber}`,
      content: content.trim(),
      metadata: {
        slNo: entry.slNo,
        offence: entry.offence,
        legalSection: entry.legalSection,
        act: entry.act,
        category: category,
        pageNumber: entry.pageNumber,
        source: entry.source,
      },
    });
  }

  return chunks;
}

module.exports = {
  createSemanticChunks,
  getOffenceCategory,
};
