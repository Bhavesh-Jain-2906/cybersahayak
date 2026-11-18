/**
 * Node 5: sanitize_and_fix
 *
 * Corrects and sanitizes the draft response if any guardrail
 * or formatting issues were flagged by the validator node.
 */

async function sanitizeAndFixNode(state) {
  let text = state.draftResponse || '';
  const validation = state.validation || {};
  const intent = state.intent || {};

  // 1. Remove any drafted formal FIR or complaint letter
  if (validation.hasFIRViolation) {
    text = text.replace(
      /(To\s*,?\s*The Station House Officer[\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
      '*(Note: CyberSahayak provides guidance and safety education. To lodge an official complaint, please report directly to your local police or via the official portal at [cybercrime.gov.in](https://cybercrime.gov.in) / helpline 1930).*'
    );
  }

  // 2. Remove any accidental credential request
  if (validation.hasCredentialViolation) {
    text = text.replace(
      /(please\s*(share|provide|tell\s*me|enter)\s*(your)?\s*(password|otp|upi\s*pin|atm\s*pin)[\s\S]*?\?)/gi,
      '*(Reminder: Never share your passwords, OTPs, or UPI PINs with anyone, including this assistant).*'
    );
  }

  // 3. Ensure emergency helpline is present for financial fraud
  if (!validation.hasHelplineMention && (intent.category === 'financial_fraud' || intent.urgency === 'high')) {
    text += `\n\n**Emergency Reporting Contacts:**\n- National Cybercrime Helpline: **1930** (Citizen Financial Cyber Fraud Reporting)\n- Official Portal: [cybercrime.gov.in](https://cybercrime.gov.in)`;
  }

  const nodes = [...(state.metadata?.executionNodes || []), 'sanitize_and_fix'];

  return {
    draftResponse: text,
    validation: {
      ...validation,
      isValid: true,
      sanitized: true,
    },
    metadata: {
      ...state.metadata,
      executionNodes: nodes,
    },
  };
}

module.exports = {
  sanitizeAndFixNode,
};
