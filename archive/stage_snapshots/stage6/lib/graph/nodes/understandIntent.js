/**
 * Node 1: understand_intent
 *
 * Analyzes the user's message and conversation context to:
 * 1. Categorize intent (financial_fraud, phishing, account_compromise, evidence, security, legal, general, out_of_scope)
 * 2. Assess urgency (high, medium, low)
 * 3. Make an explicit, sensible decision on whether knowledge retrieval (RAG) is needed
 * 4. Generate an optimized retrieval query if RAG is triggered
 */

const LEGAL_PATTERNS = [
  /\b(section|sec\.?|it\s*act|information\s*technology\s*act|indian\s*penal\s*code|ipc)\b/i,
  /\b(punishment|penalty|fine|imprisonment|jail|bailable|non-bailable|cognizable|non-cognizable)\b/i,
  /\b(legal\s*(provision|action|consequence|section|remedy)|statute|charge|prosecut)\b/i,
  /\b(cheating\s*by\s*personation|identity\s*theft|tampering\s*(with|source)|hacking\s*section)\b/i,
  /\b(which\s*section|what\s*section|under\s*what\s*section|legal\s*status)\b/i,
];

const FINANCIAL_FRAUD_PATTERNS = [
  /\b(upi|gpay|google\s*pay|phonepe|paytm|bank|money|deducted|stolen|transferred|qr\s*code|lottery\s*prize|cashback)\b/i,
  /\b(pin|otp|unauthorized\s*(transaction|debit)|account\s*debited|lost\s*money|scammed)\b/i,
];

const PHISHING_PATTERNS = [
  /\b(phish|sms|link|message|electricity\s*bill|bill\s*disconnection|kyc|apk|fake\s*email|suspicious\s*link)\b/i,
  /\b(click\s*(the\s*)?link|lottery\s*winner|fake\s*call|fake\s*sms|lottery\s*ticket)\b/i,
];

const ACCOUNT_COMPROMISE_PATTERNS = [
  /\b(hacked|instagram|whatsapp|facebook|account\s*(taken|compromised|stolen)|password\s*changed)\b/i,
  /\b(locked\s*out|unrecognized\s*device|session\s*hijack|someone\s*logged\s*in)\b/i,
];

const EVIDENCE_PATTERNS = [
  /\b(preserve\s*evidence|save\s*evidence|digital\s*evidence|screenshot|proof|transaction\s*id|utr|call\s*recording)\b/i,
  /\b(how\s*to\s*(save|keep|collect)\s*evidence|preserve\s*chat|don'?t\s*delete)\b/i,
];

const SECURITY_PATTERNS = [
  /\b(password\s*(safety|strength|manager|tips)|two[- ]factor|2fa|mfa|authenticator|secure\s*(my)?\s*account)\b/i,
  /\b(protect\s*(my)?\s*(phone|device|account)|safe\s*browsing)\b/i,
];

const OUT_OF_SCOPE_PATTERNS = [
  /\b(recipe|weather|capital\s*of|code\s*in\s*python|write\s*a\s*poem|football|cricket|who\s*won|movie|song)\b/i,
  /\b(bubble\s*sort|homework|algebra|translate\s*to\s*french|solve\s*equation)\b/i,
];

async function understandIntentNode(state) {
  const userMessage = state.userMessage || '';
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();

  let category = 'general_cyber';
  let urgency = 'low';
  let needsRetrieval = false;
  let rationale = '';
  let retrievalQuery = '';

  // 1. Check if user question is explicitly out of scope (unrelated to cybercrime/safety)
  const isOutOfScope = OUT_OF_SCOPE_PATTERNS.some((p) => p.test(lower)) &&
    !FINANCIAL_FRAUD_PATTERNS.some((p) => p.test(lower)) &&
    !ACCOUNT_COMPROMISE_PATTERNS.some((p) => p.test(lower)) &&
    !LEGAL_PATTERNS.some((p) => p.test(lower));

  if (isOutOfScope) {
    category = 'out_of_scope';
    urgency = 'low';
    needsRetrieval = false;
    rationale = 'Query is unrelated to cybercrime, cybersecurity, or digital safety.';
  }
  // 2. Check for explicit legal statutory inquiries (Target for PDF RAG)
  else if (LEGAL_PATTERNS.some((p) => p.test(lower))) {
    category = 'legal_statutory';
    urgency = 'low';
    needsRetrieval = true;
    rationale = 'User asks specifically about cyber laws, legal sections, penalties, or statutory provisions under IT Act/IPC.';
    retrievalQuery = trimmed;
  }
  // 3. Check for active financial fraud / UPI scam
  else if (FINANCIAL_FRAUD_PATTERNS.some((p) => p.test(lower))) {
    category = 'financial_fraud';
    urgency = 'high';
    needsRetrieval = false;
    rationale = 'Active financial scam reported; requires immediate banking triage, 1930 escalation, and containment rather than statutory citations.';
  }
  // 4. Check for account hacking / takeover
  else if (ACCOUNT_COMPROMISE_PATTERNS.some((p) => p.test(lower))) {
    category = 'account_compromise';
    urgency = 'high';
    needsRetrieval = false;
    rationale = 'Account compromise reported; requires account recovery steps, session termination, and 2FA activation.';
  }
  // 5. Check for phishing / fraudulent communications
  else if (PHISHING_PATTERNS.some((p) => p.test(lower))) {
    category = 'phishing';
    urgency = 'medium';
    needsRetrieval = false;
    rationale = 'Phishing or deceptive message inquiry; requires verification tips, warning against clicking, and reporting steps.';
  }
  // 6. Check for evidence preservation
  else if (EVIDENCE_PATTERNS.some((p) => p.test(lower))) {
    category = 'evidence_preservation';
    urgency = 'medium';
    needsRetrieval = false;
    rationale = 'User seeks instructions on preserving digital forensic evidence.';
  }
  // 7. Check for password / account security best practices
  else if (SECURITY_PATTERNS.some((p) => p.test(lower))) {
    category = 'security_best_practices';
    urgency = 'low';
    needsRetrieval = false;
    rationale = 'General cybersecurity and account hardening advice.';
  }
  // 8. Default to general cybersecurity guidance
  else {
    category = 'general_cyber';
    urgency = 'low';
    needsRetrieval = false;
    rationale = 'General informational or introductory cyber query.';
  }

  const nodes = [...(state.metadata?.executionNodes || []), 'understand_intent'];

  return {
    intent: {
      category,
      urgency,
      needsRetrieval,
      confidence: 0.95,
      rationale,
    },
    retrievalQuery,
    metadata: {
      ...state.metadata,
      executionNodes: nodes,
    },
  };
}

module.exports = {
  understandIntentNode,
};
