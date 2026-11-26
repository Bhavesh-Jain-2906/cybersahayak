/**
 * Reusable LLM Model Factory for Connor
 *
 * Supports multi-provider configuration via environment variables:
 * - Groq (ChatGroq with openai/gpt-oss-120b, openai/gpt-oss-20b, or qwen/qwen3.8-27b)
 * - Google Gemini (ChatGoogleGenerativeAI with gemini-flash-latest)
 * - Intelligent Demo Fallback when credentials are not configured or in test mode
 *
 * All credentials are strictly kept server-side.
 */

const GROQ_CANDIDATE_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
];

/**
 * Creates an intelligent demo model implementing LangChain's .invoke interface
 * when no LLM API keys are provided or when demo mode is requested.
 */
function createDemoModel() {
  return {
    isDemo: true,
    provider: 'demo',
    modelName: 'connor-demo-mode',
    async invoke(messages) {
      const lastMessage = Array.isArray(messages) ? messages[messages.length - 1] : messages;
      const content = typeof lastMessage === 'string' ? lastMessage : (lastMessage.content || '');
      const lower = content.toLowerCase();

      let guidance = '';
      if (lower.includes('upi') || lower.includes('money') || lower.includes('fraud') || lower.includes('deducted') || lower.includes('bank')) {
        guidance = `**Immediate Action Required:**
1. **Block/Freeze:** Call your bank's 24/7 emergency fraud helpline immediately to block your card, account, or UPI service to prevent further unauthorized debits.
2. **Dial 1930:** Contact the National Cybercrime Reporting Helpline **1930** immediately. In the initial golden hours, authorities can place a temporary freeze on the fraudster's beneficiary account.
3. **Official Reporting:** Lodge a formal cyber incident report at the national portal: [cybercrime.gov.in](https://cybercrime.gov.in).
4. **Preserve Evidence:** Save full screenshots of the transaction message, UPI reference/UTR number, and caller details. Do not delete any conversation.

*Have you already contacted your bank to freeze the affected account?*`;
      } else if (lower.includes('phish') || lower.includes('sms') || lower.includes('link') || lower.includes('message')) {
        guidance = `**Phishing Safety Guidance:**
1. **Do Not Click:** Avoid clicking on any suspicious links or downloading attached APKs/files.
2. **Never Share OTPs:** Legitimate banks and government agencies will never ask for your passwords, OTPs, or PINs via SMS or phone calls.
3. **If Clicked Already:** Disconnect your device from the internet, run a security scan, and immediately change passwords from a separate trusted device.
4. **Report:** Forward the fraudulent SMS to 1909 (TRAI DND) or report the incident at [cybercrime.gov.in](https://cybercrime.gov.in).

*Did you enter any banking or account details after opening the link?*`;
      } else if (lower.includes('hack') || lower.includes('password') || lower.includes('instagram') || lower.includes('account')) {
        guidance = `**Account Recovery & Security Steps:**
1. **Initiate Official Recovery:** Use the platform's official "Forgot Password" or "Need more help?" account recovery flow immediately.
2. **Terminate Sessions:** If you still have partial access, go to Account Settings > Security and log out of all unrecognized devices and sessions.
3. **Enable 2FA:** Set up Two-Factor Authentication using a dedicated authenticator app rather than SMS whenever possible.
4. **Check Linked Details:** Review linked recovery emails and phone numbers to ensure the attacker has not changed them.

*Do you still have access to the recovery email or phone number registered with the account?*`;
      } else {
        guidance = `I am **Connor**, your AI cybercrime guidance assistant, here to guide you through any cybercrime incident, online threat, or digital security concern.

**How Connor can assist you:**
- **Emergency Incident Triage:** Immediate steps if money was stolen, accounts were hacked, or suspicious links were clicked.
- **Evidence Preservation:** How to safely capture and preserve digital logs, transaction IDs, and communication trails.
- **Official Guidance:** Connecting you with authorized portals like [cybercrime.gov.in](https://cybercrime.gov.in) and the national helpline **1930**.
- **Awareness & Prevention:** Learning safe digital practices to secure your devices and accounts.

*Could you briefly describe the specific situation or concern you would like guidance on?*`;
      }

      const responseText = `[DEMO MODE: Running in local sandbox without an external LLM key. To enable live AI models, configure GROQ_API_KEY or GOOGLE_API_KEY in .env.local]

${guidance}`;

      return {
        content: responseText,
      };
    },
  };
}

/**
 * Resolves and initializes the active chat model.
 *
 * @param {Object} options - Optional configuration overrides
 * @returns {Promise<{ model: Object, provider: string, modelName: string, isDemo: boolean }>}
 */
async function getChatModel(options = {}) {
  const provider = (options.provider || process.env.LLM_PROVIDER || '').toLowerCase();
  const groqKey = options.groqApiKey || process.env.GROQ_API_KEY;
  const googleKey = options.googleApiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  // 1. Try Groq (Primary recommended provider: high throughput, low latency)
  if ((provider === 'groq' || (!provider && groqKey)) && groqKey) {
    try {
      const { ChatGroq } = require('@langchain/groq');
      const preferredModel = options.modelName || process.env.GROQ_MODEL || GROQ_CANDIDATE_MODELS[0];

      const model = new ChatGroq({
        apiKey: groqKey,
        model: preferredModel,
        temperature: options.temperature !== undefined ? options.temperature : 0.3,
        maxRetries: 2,
      });

      return {
        model,
        provider: 'groq',
        modelName: preferredModel,
        isDemo: false,
      };
    } catch (err) {
      console.warn('[Model Factory] Failed to initialize ChatGroq, trying fallback:', err.message);
    }
  }

  // 2. Try Google Gemini
  if ((provider === 'google' || provider === 'gemini' || (!provider && googleKey)) && googleKey) {
    try {
      const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
      const modelName = options.modelName || process.env.GOOGLE_MODEL || 'gemini-flash-latest';
      const model = new ChatGoogleGenerativeAI({
        apiKey: googleKey,
        model: modelName,
        temperature: options.temperature !== undefined ? options.temperature : 0.3,
        maxRetries: 2,
      });

      return {
        model,
        provider: 'google',
        modelName,
        isDemo: false,
      };
    } catch (err) {
      console.warn('[Model Factory] Failed to initialize Google Generative AI, trying fallback:', err.message);
    }
  }

  // 3. Graceful fallback: Demo Mode
  return {
    model: createDemoModel(),
    provider: 'demo',
    modelName: 'connor-demo-mode',
    isDemo: true,
  };
}

/**
 * Checks provider credential status.
 */
function getAvailableProviders() {
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasGoogle = Boolean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);
  return {
    groq: hasGroq,
    google: hasGoogle,
    preferred: process.env.LLM_PROVIDER || (hasGroq ? 'groq' : (hasGoogle ? 'google' : 'demo')),
  };
}

module.exports = {
  getChatModel,
  getAvailableProviders,
  createDemoModel,
  GROQ_CANDIDATE_MODELS,
};
