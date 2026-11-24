/**
 * Cyber Safety Quiz Questions Dataset
 *
 * Designed to test and reinforce practical digital security knowledge:
 * - Immediate feedback
 * - Comprehensive explanations
 * - Scenario-based decision making
 */

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'UPI & Banking',
    question: 'A buyer on OLX wants to purchase your bicycle. They send you a Google Pay QR code and tell you to "Scan this code and enter your UPI PIN to receive the advance payment." What will happen if you do this?',
    options: [
      'You will receive the money in your bank account immediately.',
      'Money will be deducted from your bank account and sent to the scammer.',
      'Nothing will happen until you approve the transaction via SMS.',
      'The bank will hold the funds for 24 hours as escrow.'
    ],
    correctIndex: 1,
    explanation: 'Entering your UPI PIN ALWAYS authorises money to be deducted from your account. You NEVER need to enter your UPI PIN or scan a QR code to receive money in any UPI app in India.'
  },
  {
    id: 2,
    category: 'Phishing Awareness',
    question: 'You receive an urgent SMS: "Dear Customer, your electricity connection will be cut off tonight at 9:30 PM due to an unpaid bill. Call officer at 9876543210 or update via bit.ly/power-bill." What is the safest response?',
    options: [
      'Call the phone number immediately to explain you already paid.',
      'Click the link to verify if your consumer number shows any dues.',
      'Ignore the SMS and check your billing status directly inside your state electricity board\'s official app or consumer portal.',
      'Forward the message to your family WhatsApp group to warn them.'
    ],
    correctIndex: 2,
    explanation: 'Electricity distribution companies in India do not send disconnection threats from personal 10-digit mobile numbers with shortened links. Always check billing status through official utility portals or registered billing apps.'
  },
  {
    id: 3,
    category: 'Emergency Reporting',
    question: 'If you realize that ₹25,000 was fraudulently debited from your bank account via an online scam 30 minutes ago, what is the single most critical step to take immediately?',
    options: [
      'Write a physical letter to the bank branch manager and visit tomorrow morning.',
      'Call the National Cybercrime Helpline 1930 immediately to trigger the Citizen Financial Cyber Fraud Reporting protocol.',
      'Post on social media tagging your bank to demand a refund.',
      'Change your email password and factory-reset your mobile phone.'
    ],
    correctIndex: 1,
    explanation: 'The first 2 to 3 hours after a financial fraud are the "Golden Hours". Dialing 1930 immediately allows authorities to alert the beneficiary bank and freeze the stolen funds before the fraudster withdraws them from an ATM or transfers them to a mule account.'
  },
  {
    id: 4,
    category: 'Social Engineering',
    question: 'You receive a Skype video call from someone in a police uniform claiming an illegal courier containing contraband was found in your name, and that you are under "digital arrest" unless you transfer funds for verification. What is true about this scenario?',
    options: [
      'Indian law enforcement has an official "digital arrest" procedure via video call.',
      'You must comply and transfer money to the "police account" to avoid physical arrest.',
      'There is no such thing as "digital arrest" in Indian law; this is a widespread extortion scam.',
      'You should share your Aadhaar number and OTP to prove your innocence.'
    ],
    correctIndex: 2,
    explanation: 'The Ministry of Home Affairs (MHA) and state police departments have repeatedly clarified that no law enforcement agency in India conducts arrests or trials over video calls, nor do they demand money transfers. Hang up immediately and report to 1930.'
  },
  {
    id: 5,
    category: 'Password Security',
    question: 'Which of the following creates the most secure, crack-resistant password for your primary email account?',
    options: [
      'Password@2024 (Capital letter, word, symbol, and current year)',
      'Your child\'s name followed by their birthdate (e.g. Aarav#15082015)',
      'A memorable 5-word passphrase like "mango-guitar-purple-cloud-river" paired with an authenticator app for 2FA',
      'The same 12-character complex password reused across your 5 most important websites'
    ],
    correctIndex: 2,
    explanation: 'Length and entropy beat complex substitutions that automated dictionary tools easily predict. Multi-word passphrases are extremely difficult to brute-force and easy to remember. Using an authenticator app adds vital multi-factor defense.'
  },
  {
    id: 6,
    category: 'Identity Protection',
    question: 'Your mobile phone suddenly displays "No Service" or "Emergency Calls Only", and you did not request any SIM upgrade or network change. What threat might be occurring?',
    options: [
      'Normal network congestion that will resolve by itself in 48 hours.',
      'A SIM Swap attack, where an attacker has duplicated your SIM card to intercept your banking OTPs.',
      'Your phone battery has degraded and cannot power the cellular antenna.',
      'Your WhatsApp account has expired.'
    ],
    correctIndex: 1,
    explanation: 'Sudden unexplained loss of cellular network accompanied by unexpected password reset emails is a hallmark of a SIM Swap attack. Contact your mobile carrier immediately from another phone to block the hijacked SIM and notify your bank.'
  },
  {
    id: 7,
    category: 'Device Security',
    question: 'A caller claiming to be from "Bank Technical Support" asks you to download "AnyDesk" or "TeamViewer QuickSupport" on your phone to resolve a pending cashback. Why is this dangerous?',
    options: [
      'It will consume too much mobile data.',
      'These are remote screen-sharing tools that allow the caller to view your screen in real time and steal your passwords and OTPs.',
      'These apps will permanently uninstall your banking applications.',
      'The app will automatically format your SD card.'
    ],
    correctIndex: 1,
    explanation: 'AnyDesk, TeamViewer, and RustDesk are legitimate remote administration tools, but scammers use them to view victims\' screens live. As soon as you open your bank or UPI app, the fraudster sees your credentials and OTPs directly.'
  },
  {
    id: 8,
    category: 'Public Wi-Fi Hygiene',
    question: 'You are at a railway station and connect to an open, unencrypted Wi-Fi hotspot named "Free_Public_WiFi". Which of the following activities should you strictly AVOID?',
    options: [
      'Checking the train timetable on an official railway portal.',
      'Reading a public news website.',
      'Logging into your netbanking or entering credit card details on an unverified site without a VPN.',
      'Checking the local weather forecast.'
    ],
    correctIndex: 2,
    explanation: 'Unencrypted public Wi-Fi hotspots are vulnerable to "Man-in-the-Middle" (MitM) eavesdropping and rogue access points ("Evil Twin"). Avoid banking or entering sensitive passwords on open networks unless using a trusted VPN.'
  }
];
