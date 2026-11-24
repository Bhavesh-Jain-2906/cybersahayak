/**
 * Node 4: validate_response
 *
 * Evaluates the draft response against core safety rules:
 * - Checks for forbidden FIR or complaint drafting
 * - Checks for forbidden credential solicitation
 * - Enforces the "at most one clarification question" rule
 * - Verifies presence of national helpline numbers for emergency scams
 */

const FIR_COMPLAINT_PATTERNS = [
  /\bto\s*,?\s*the\s*station\s*house\s*officer\b/i,
  /\bto\s*,?\s*the\s*(police\s*inspector|sub-inspector|sho)\b/i,
  /\bsubject\s*:\s*(formal\s*)?(complaint|fir|police\s*report)\b/i,
  /\brespected\s*sir\s*\/s*madam\s*,?\s*i\s*(hereby|wish\s*to\s*lodge|am\s*writing\s*to\s*report)\b/i,
  /\bhere\s*is\s*a\s*(draft|template)\s*(for\s*your\s*fir|for\s*the\s*police\s*complaint)\b/i,
];

const CREDENTIAL_HARVESTING_PATTERNS = [
  /\b(please\s*)?(share|provide|tell\s*me|enter)\s*(your)?\s*(password|otp|one-time\s*password|upi\s*pin|atm\s*pin|cvv)\b/i,
  /\bwhat\s*is\s*your\s*(password|otp|upi\s*pin|atm\s*pin|cvv)\b/i,
];

async function validateResponseNode(state) {
  const draft = state.draftResponse || '';
  const intent = state.intent || {};
  const issues = [];

  // 1. Guardrail Check: FIR / Complaint drafting
  const hasFIRViolation = FIR_COMPLAINT_PATTERNS.some((p) => p.test(draft));
  if (hasFIRViolation) {
    issues.push('Response contains a formal police complaint or FIR drafting template.');
  }

  // 2. Guardrail Check: Credential solicitation
  const hasCredentialViolation = CREDENTIAL_HARVESTING_PATTERNS.some((p) => p.test(draft));
  if (hasCredentialViolation) {
    issues.push('Response solicits sensitive user credentials (passwords, PINs, or OTPs).');
  }

  // 3. Question / Clarification count analysis
  // Extract sentences ending in '?'
  const questionMatches = draft.match(/([^.!?\n]+(?:\?))/g) || [];
  const clarificationCount = questionMatches.length;
  let extractedQuestion = null;

  if (clarificationCount > 0) {
    // Pick the most targeted question, typically at the end of the response
    extractedQuestion = questionMatches[questionMatches.length - 1].trim();
  }

  // 4. Helpline check for emergency incidents
  let hasHelplineMention = true;
  if (intent.category === 'financial_fraud' || intent.urgency === 'high') {
    hasHelplineMention = draft.includes('1930') || draft.toLowerCase().includes('cybercrime.gov.in');
    if (!hasHelplineMention) {
      issues.push('High-urgency incident response is missing emergency 1930 helpline / portal citation.');
    }
  }

  const isValid = !hasFIRViolation && !hasCredentialViolation && (clarificationCount <= 1);
  const nodes = [...(state.metadata?.executionNodes || []), 'validate_response'];

  return {
    validation: {
      isValid,
      hasFIRViolation,
      hasCredentialViolation,
      hasHelplineMention,
      clarificationCount,
      extractedQuestion,
      sanitized: false,
      issues,
    },
    metadata: {
      ...state.metadata,
      executionNodes: nodes,
    },
  };
}

module.exports = {
  validateResponseNode,
};
