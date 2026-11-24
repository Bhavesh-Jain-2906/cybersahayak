export const APP_CONFIG = {
  name: 'CyberSahayak',
  tagline: 'AI-Powered Cybercrime Assistance & Awareness',
  version: '1.0.0 (Stage 1 Prototype)',
  nationalHelpline: '1930',
  officialPortal: 'https://cybercrime.gov.in',
  rbiSachetPortal: 'https://sachet.rbi.org.in',
  chakshuPortal: 'https://sancharsaathi.gov.in/sfc/',
};

export const SUGGESTED_QUESTIONS = [
  {
    category: 'UPI & Payment Scams',
    icon: 'CreditCard',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    title: 'Wrong UPI Transfer / Reversal Request',
    prompt: 'Someone sent money to my UPI by mistake and is calling me urgently asking to transfer it back. Is this a scam, and how should I handle it?',
  },
  {
    category: 'Phishing & Fake SMS',
    icon: 'MailWarning',
    color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400',
    title: 'Suspicious Bank Account Blocked SMS',
    prompt: 'I received an urgent SMS saying "Your bank account will be blocked today. Update your KYC immediately by clicking this link." What should I do?',
  },
  {
    category: 'Account Recovery',
    icon: 'ShieldAlert',
    color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30 text-teal-600 dark:text-teal-400',
    title: 'Compromised Social Media Account',
    prompt: 'My Instagram account was hacked, and the attacker changed the recovery email and phone number. What immediate steps can I take to regain access?',
  },
  {
    category: 'Evidence Preservation',
    icon: 'FileCheck2',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
    title: 'Preserving Digital Evidence',
    prompt: 'I was scammed by an online shopping seller on Telegram. What digital evidence (screenshots, transaction IDs, headers) should I preserve before reporting?',
  },
  {
    category: 'Device Security',
    icon: 'SmartphoneNfc',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    title: 'SIM Swap & Suspicious OTPs',
    prompt: 'My phone suddenly lost network connection, and I noticed login attempts on my email from an unknown city. Could this be a SIM swap attack?',
  },
  {
    category: 'Online Identity Theft',
    icon: 'UserX',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400',
    title: 'Fake Profile Using My Photos',
    prompt: 'Someone created a fake profile with my name and photos to solicit money from my friends and contacts. How can I get it taken down quickly?',
  },
];

export const SAFETY_REMINDERS = [
  'Never share your UPI PIN, ATM PIN, or One-Time Passwords (OTPs) with anyone, even if they claim to be bank officials.',
  'CyberSahayak will never ask for your passwords, complete credit card numbers, or banking credentials.',
  'If you have suffered a financial loss, call the National Cyber Crime Helpline at 1930 immediately to freeze fraudulent transactions.',
];
