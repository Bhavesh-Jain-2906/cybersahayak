'use client';

import React from 'react';

/**
 * A lightweight, safe, zero-dependency Markdown renderer for CyberSahayak chat bubbles.
 * Handles headings, bold, italics, code blocks, lists, blockquotes, links, and line breaks.
 */
export default function MarkdownRenderer({ content = '' }) {
  if (!content) return null;

  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Code block
          const lines = part.slice(3, -3).trim().split('\n');
          const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
          const code = (language ? lines.slice(1) : lines).join('\n');

          return (
            <div key={index} className="my-2.5 overflow-hidden rounded-xl border border-slate-700/60 dark:border-blue-900/50 bg-slate-900 dark:bg-[#02050f] text-slate-100 dark:shadow-[0_4px_20px_rgba(0,0,0,0.9),0_0_15px_rgba(37,99,235,0.15)]">
              {language && (
                <div className="flex items-center justify-between border-b border-slate-800 dark:border-blue-950/80 px-3.5 py-1.5 text-xs font-mono text-slate-400 dark:text-blue-400 bg-slate-800/50 dark:bg-black/60">
                  <span>{language}</span>
                </div>
              )}
              <pre className="overflow-x-auto p-3.5 text-xs font-mono leading-normal text-blue-100">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Regular markdown text
        return <FormattedBlock key={index} text={part} />;
      })}
    </div>
  );
}

function FormattedBlock({ text }) {
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Headings
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={pIdx} className="text-base font-semibold text-slate-900 dark:text-blue-100 mt-3.5 mb-1.5 flex items-center gap-1.5">
              {renderInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={pIdx} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">
              {renderInline(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={pIdx} className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
              {renderInline(trimmed.replace(/^#\s+/, ''))}
            </h2>
          );
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={pIdx} className="my-3 border-slate-200 dark:border-blue-950/70" />;
        }

        // Blockquotes
        if (trimmed.startsWith('>')) {
          const quoteLines = trimmed
            .split('\n')
            .map((l) => l.replace(/^>\s?/, ''))
            .join(' ');
          return (
            <blockquote
              key={pIdx}
              className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/25 px-3.5 py-2 text-xs md:text-sm italic text-slate-700 dark:text-blue-200 rounded-r-lg dark:shadow-cool-blue-xs"
            >
              {renderInline(quoteLines)}
            </blockquote>
          );
        }

        // Unordered or Ordered lists
        const lines = trimmed.split('\n');
        const isList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim()));

        if (isList) {
          const isOrdered = /^\d+\.\s/.test(lines[0].trim());
          if (isOrdered) {
            return (
              <ol key={pIdx} className="list-decimal list-inside space-y-1.5 my-1.5 pl-1 text-slate-800 dark:text-slate-200">
                {lines.map((item, i) => (
                  <li key={i}>
                    {renderInline(item.replace(/^\d+\.\s+/, ''))}
                  </li>
                ))}
              </ol>
            );
          } else {
            return (
              <ul key={pIdx} className="list-disc list-inside space-y-1.5 my-1.5 pl-1 text-slate-800 dark:text-slate-200">
                {lines.map((item, i) => (
                  <li key={i}>
                    {renderInline(item.replace(/^[-*]\s+/, ''))}
                  </li>
                ))}
              </ul>
            );
          }
        }

        // Standard Paragraph with inline formatting
        return (
          <p key={pIdx} className="leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </>
  );
}

function renderInline(text) {
  // Regex to match bold, italic, inline-code, and links
  const tokens = [];
  let remaining = text;

  // Simple token parser for inline elements
  const pattern = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  let match;
  let lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', val: text.substring(lastIndex, match.index) });
    }

    const m = match[0];
    if (m.startsWith('**') && m.endsWith('**')) {
      tokens.push({ type: 'bold', val: m.slice(2, -2) });
    } else if (m.startsWith('*') && m.endsWith('*')) {
      tokens.push({ type: 'italic', val: m.slice(1, -1) });
    } else if (m.startsWith('`') && m.endsWith('`')) {
      tokens.push({ type: 'code', val: m.slice(1, -1) });
    } else if (m.startsWith('[') && m.includes('](') && m.endsWith(')')) {
      const parts = m.slice(1, -1).split('](');
      tokens.push({ type: 'link', text: parts[0], url: parts[1] });
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', val: text.substring(lastIndex) });
  }

  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'bold':
        return <strong key={idx} className="font-semibold text-slate-900 dark:text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{token.val}</strong>;
      case 'italic':
        return <em key={idx} className="italic text-slate-700 dark:text-blue-200">{token.val}</em>;
      case 'code':
        return (
          <code key={idx} className="rounded bg-slate-100 dark:bg-[#070d1d] px-1.5 py-0.5 font-mono text-xs text-blue-600 dark:text-blue-300 border border-slate-200 dark:border-blue-500/30 dark:shadow-cool-blue-xs">
            {token.val}
          </code>
        );
      case 'link': {
        const rawUrl = (token.url || '').trim();
        // Prevent javascript:, data:, and other malicious URL protocols
        const isSafeProtocol = /^(https?:\/\/|tel:|mailto:|\/|#)/i.test(rawUrl);
        const safeHref = isSafeProtocol ? rawUrl : '#';

        return (
          <a
            key={idx}
            href={safeHref}
            target={safeHref.startsWith('http') ? '_blank' : undefined}
            rel={safeHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 font-medium drop-shadow-[0_0_6px_rgba(59,130,246,0.3)] transition-colors"
          >
            {token.text}
          </a>
        );
      }
      default:
        return <span key={idx}>{token.val}</span>;
    }
  });
}
