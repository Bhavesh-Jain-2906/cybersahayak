/**
 * Educational Cyber Awareness Articles & Guides
 *
 * Covers 10 core cybercrime & digital safety domains:
 * 1. UPI Fraud
 * 2. Phishing
 * 3. Password Security
 * 4. Social Engineering
 * 5. Online Shopping Scams
 * 6. Identity Theft
 * 7. Account Security
 * 8. Malware & Spyware
 * 9. Social Media Safety
 * 10. Safe Browsing
 */

export const AWARENESS_ARTICLES = [
  {
    id: 'upi-fraud',
    title: 'UPI Payment Fraud & QR Code Scams',
    category: 'Financial Safety',
    readTime: '4 min read',
    icon: 'CreditCard',
    summary: 'Learn how scammers manipulate UPI collect requests, fake QR codes, and reverse-charge scams to steal money from bank accounts.',
    explanation: `Unified Payments Interface (UPI) is India's most popular instant payment system. However, fraudsters frequently exploit a fundamental misunderstanding: users entering their UPI PIN when expecting to receive money. 

In UPI architecture:
- Entering a UPI PIN is **ONLY required to DEBIT (send) money** from your account.
- You **NEVER enter your UPI PIN to RECEIVE or accept funds**.
- Scanning a QR code from a buyer or stranger always sends money out of your account; you cannot "receive" funds by scanning a QR code.`,
    examples: [
      'OLX / Quikr Army Officer Scam: Fraudster pretends to be an army official buying your furniture, sends a QR code claiming "Scan this to receive advance payment of ₹10,000", which actually initiates a ₹10,000 debit.',
      'Fake Cashback / Refund Notification: A pop-up or SMS congratulating you on winning a "Google Pay scratch card" with a button that redirects to a UPI app prefilled with a payment request.',
      'Wrong Transfer Call: Fraudster calls claiming they accidentally transferred ₹5,000 to your account and begs for it back, while simultaneously sending a fake bank SMS alert without any real credit.'
    ],
    preventionTips: [
      'NEVER enter your UPI PIN to receive money or lottery rewards.',
      'Check your bank statement inside your official banking app—do not trust incoming SMS notifications alone.',
      'Reject unexpected "Collect" requests in PhonePe, Google Pay, or Paytm immediately.',
      'Set daily UPI transaction limits within your banking application.',
      'If scammed, dial 1930 immediately within the golden hour to freeze the beneficiary account.'
    ],
    legalSection: 'Section 66C & 66D, Information Technology Act, 2000 (Identity theft & cheating by personation).'
  },
  {
    id: 'phishing',
    title: 'Phishing Attacks, Fake SMS & Deceptive Links',
    category: 'Threat Awareness',
    readTime: '5 min read',
    icon: 'MailWarning',
    summary: 'Recognize deceptive text messages, fake bank alerts, and urgent utility bill disconnection threats designed to harvest credentials.',
    explanation: `Phishing is a social engineering technique where attackers impersonate trustworthy entities—such as electricity boards, banks, courier companies, or government bodies—to deceive victims into clicking malicious links, entering passwords, or downloading malicious APKs.

Attackers rely on emotional manipulation, creating artificial urgency, panic, or excitement (e.g. "Your power will be disconnected at 9:30 PM", "Your SBI YONO account is suspended", "Income tax refund approved").`,
    examples: [
      'Electricity Bill Disconnection SMS: "Dear consumer, your electricity power will be disconnected at 9:30 PM tonight from electricity office because your previous month bill was not updated. Please contact our officer at 98xxxxxx immediately."',
      'Bank KYC Suspension: SMS appearing with sender header like "VM-SBIACC" claiming: "Your account is blocked. Update PAN card here: bit.ly/sbi-update-kyc". The link loads an exact clone of the SBI netbanking portal.',
      'Courier Delivery Address Failure: SMS claiming India Post or BlueDart could not deliver your parcel due to missing street address, asking for a ₹5 re-delivery fee to steal card credentials.'
    ],
    preventionTips: [
      'Inspect the sender ID and full URL carefully. Banks and utilities do not send 10-digit mobile numbers for official correspondence.',
      'Government and bank websites in India use standard domains ending in .gov.in, .nic.in, or official registered bank domains.',
      'Never download APK files sent via WhatsApp or SMS.',
      'Report suspicious SMS to 1909 or via the TRAI Chakshu portal (sancharsaathi.gov.in).'
    ],
    legalSection: 'Section 66D of the IT Act, 2000 & Section 420 of the Indian Penal Code.'
  },
  {
    id: 'password-security',
    title: 'Password Security & Credential Protection',
    category: 'Account Defense',
    readTime: '4 min read',
    icon: 'KeyRound',
    summary: 'Master robust password generation, passphrases, password managers, and defense against credential stuffing and brute force attacks.',
    explanation: `Passwords are the first line of defense for your digital identity. Most account takeovers occur not because an attacker cracked complex encryption, but because the victim reused the same password across multiple sites or chose predictable patterns (birthdays, names, phone numbers).

When a minor website suffers a data breach, cybercriminals use automated tools to test those email/password combinations across high-value services like Gmail, Amazon, and banking (known as Credential Stuffing).`,
    examples: [
      'Credential Stuffing: A gaming forum database is leaked online. Attackers automatically script logins with those passwords on Gmail, successfully compromising users who reused the password.',
      'Dictionary Attack: Cracking passwords like "Password@123" or "Rahul#1998" within milliseconds using automated wordlists.'
    ],
    preventionTips: [
      'Use passphrases of 4-5 unrelated words (e.g., "mango-guitar-purple-cloud-river") instead of short complex passwords.',
      'NEVER reuse passwords between email/banking and casual websites.',
      'Use an encrypted password manager (Bitwarden, 1Password, or Apple Keychain) to generate and store unique credentials.',
      'Always activate Two-Factor Authentication (2FA) with an authenticator app (Google Authenticator, Microsoft Authenticator) instead of SMS.'
    ],
    legalSection: 'Section 43 & Section 66, IT Act, 2000 (Unauthorized access and password tampering).'
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering & Psychological Manipulation',
    category: 'Threat Awareness',
    readTime: '5 min read',
    icon: 'UserX',
    summary: 'Understand how fraudsters manipulate human emotions—fear, trust, greed, and urgency—to bypass technical defenses.',
    explanation: `Social engineering targets the human element rather than software vulnerabilities. Hackers understand that human emotions like fear of authority, sympathy, panic, and excitement can bypass logical reasoning.

Rather than breaking encryption, fraudsters pose as authority figures (police, customs officers, CBI, bank managers) to convince victims to willingly transfer money or reveal secret codes.`,
    examples: [
      'Digital Arrest / Police Impersonation: Fraudsters on video calls wearing police uniforms claim your Aadhaar was found on an illegal package containing contraband, threatening "digital arrest" unless you deposit money into a "police verification account".',
      'Remote Support Desk: Fraudster claims to be from Microsoft or bank tech support, convincing you to install AnyDesk or TeamViewer to "fix a security glitch", which gives them complete remote control of your phone.'
    ],
    preventionTips: [
      'Real police and government agencies in India NEVER conduct "digital arrests" or ask for money over Skype/WhatsApp video calls.',
      'Take a deep breath and pause whenever an unexpected caller demands urgent action.',
      'Never install remote screen-sharing software (AnyDesk, TeamViewer, RustDesk) at the request of an unknown caller.',
      'Verify claims independently through official helplines before acting.'
    ],
    legalSection: 'Section 66D IT Act, 2000 & Sections 170, 419, 420 IPC (Personating a public servant & cheating).'
  },
  {
    id: 'online-shopping-scams',
    title: 'Fake Ecommerce & Online Shopping Scams',
    category: 'Consumer Safety',
    readTime: '4 min read',
    icon: 'ShoppingBag',
    summary: 'Spot rogue online storefronts, deep-discount traps, social media shopping fraud, and non-delivery scams.',
    explanation: `Fraudulent shopping websites lure buyers through heavily subsidized ads on Instagram, Facebook, and Telegram offering premium smartphones, branded clothes, or electronics at 70-90% discounts. 

Once the customer pays via UPI or card, either no goods are ever shipped, or cheap counterfeit items are sent. In worse cases, the payment page is a phishing clone that steals payment card CVVs and OTPs.`,
    examples: [
      'Fake Instagram Brand Stores: An ad promoting "iPhone 15 for ₹18,999 due to clearance sale". The checkout only accepts direct UPI transfer to an individual VPA, and the seller deletes the page once payment is made.',
      'Fake Courier Rescheduling: A call stating that your package cannot be delivered unless you click a link and pay a ₹2 delivery fee, which actually signs you up for an unauthorized recurring payment.'
    ],
    preventionTips: [
      'If an offer looks too good to be true, it is almost certainly a scam.',
      'Check website creation age on whois.domaintools.com—scam stores are usually registered only days or weeks ago.',
      'Prefer Cash on Delivery (COD) when buying from unfamiliar websites.',
      'Check for authentic customer reviews, physical address, and working customer support numbers before paying.'
    ],
    legalSection: 'Section 420 IPC & Consumer Protection (E-Commerce) Rules, 2020.'
  },
  {
    id: 'identity-theft',
    title: 'Identity Theft & Aadhaar/PAN Misuse',
    category: 'Identity Defense',
    readTime: '5 min read',
    icon: 'Fingerprint',
    summary: 'Protect your Aadhaar, PAN card, and biometric data from fraudulent loans, shell accounts, and SIM card duplication.',
    explanation: `Identity theft occurs when an unauthorized person acquires your personally identifiable information (Aadhaar number, PAN card, date of birth, biometric records, signature) to open unauthorized bank accounts, obtain fraudulent instant loans, or register mobile SIM cards in your name without your knowledge.`,
    examples: [
      'Instant Loan App Fraud: Scammers use photocopies of your PAN and Aadhaar submitted to unsecured lending apps to take out loans in your name, resulting in recovery agents harassing you for debts you never incurred.',
      'SIM Card Fraud: Scammers use duplicate identity proofs to obtain multiple prepaid SIM cards in your name, which are subsequently used in criminal scam operations.'
    ],
    preventionTips: [
      'Lock your Aadhaar biometrics using the official mAadhaar app or resident.uidai.gov.in when not in active use.',
      'Use "Masked Aadhaar" (which hides the first 8 digits) for identity verification.',
      'Check active SIM connections registered against your Aadhaar using the Government TAFCOP portal (tafcop.sancharsaathi.gov.in).',
      'Periodically monitor your CIBIL/credit score to detect unauthorized loan accounts.'
    ],
    legalSection: 'Section 66C IT Act, 2000 (Identity theft) & Aadhaar Act, 2016 penalties.'
  },
  {
    id: 'account-security',
    title: 'Account Takeover & Social Media Security',
    category: 'Account Defense',
    readTime: '4 min read',
    icon: 'ShieldCheck',
    summary: 'Step-by-step procedures to harden Instagram, WhatsApp, Gmail, and banking accounts against hijacking and session theft.',
    explanation: `Account Takeover (ATO) involves an unauthorized actor gaining full control of an online account. Attackers typically change the account recovery email, telephone number, and password, locking the legitimate user out. They then proceed to message friends asking for urgent money or post cryptocurrency investment scams.`,
    examples: [
      'Instagram Ambassador Scam: A friend\'s hacked account messages you saying "I am entering an influencer contest, can you vote for me by sending the link you get via SMS?" The link is actually Instagram\'s official password reset link.',
      'WhatsApp 6-digit Code Scam: A contact messages asking "I accidentally sent you my 6-digit code via SMS, can you read it back to me?" Sharing that code transfers your WhatsApp account to the attacker\'s phone.'
    ],
    preventionTips: [
      'Never forward verification SMS codes or links to anyone—even friends or family.',
      'Enable Two-Step Verification in WhatsApp (Settings > Account > Two-step verification).',
      'Regularly review "Active Sessions / Logged in Devices" in your security settings and remove unrecognized devices.',
      'Ensure your recovery email account itself is secured with strong 2FA.'
    ],
    legalSection: 'Section 66 IT Act, 2000 (Hacking and system compromise).'
  },
  {
    id: 'malware',
    title: 'Mobile Malware, Spyware & Malicious APKs',
    category: 'Device Defense',
    readTime: '4 min read',
    icon: 'Cpu',
    summary: 'Defend against stealthy Android trojans, malicious sideloaded APKs, and fake banking apps that intercept SMS and screen content.',
    explanation: `Mobile malware in India heavily targets Android users through sideloaded APK packages distributed via WhatsApp, Telegram, or fraudulent websites. These trojans often disguise themselves as utility apps (e.g. "PM-Yojana.apk", "EPFO-Update.apk", "SBI-Rewards.apk"). Once installed, they request Accessibility Permissions to read incoming SMS messages, steal OTPs, and control screen taps silently.`,
    examples: [
      'Fake PM Kisan / Yojana APK: A message on WhatsApp prompts users to install an APK to claim ₹2,000 government subsidy. The APK captures all SMS OTPs and forwards them to a remote command server.',
      'AnyDesk / Screen Share Fraud: Scammers convince users to install remote management software, instructing them to open their banking app, allowing the scammer to record login credentials in real time.'
    ],
    preventionTips: [
      'NEVER install APK files from outside the official Google Play Store or Apple App Store.',
      'Disable "Install from Unknown Sources" in your Android device settings.',
      'Never grant Accessibility Services permission to any app unless you explicitly understand why it is necessary.',
      'Keep your device operating system updated with the latest security patches.'
    ],
    legalSection: 'Section 43 & Section 66, IT Act, 2000 (Introducing computer contaminants & malware).'
  },
  {
    id: 'social-media-safety',
    title: 'Social Media Privacy, Cyberbullying & Sextortion',
    category: 'Privacy & Personal Safety',
    readTime: '5 min read',
    icon: 'Users',
    summary: 'Recognize video call blackmail, impersonation harassment, cyber stalking, and procedures for taking down non-consensual content.',
    explanation: `Social media platforms can become vectors for harassment, non-consensual image sharing, cyber stalking, and extortion. One widespread threat is video-call sextortion, where victims are lured into a brief intimate video call that is secretly recorded, followed by immediate extortion demands threatening to send the video to family and contacts.`,
    examples: [
      'Video Call Extortion (Sextortion): An attractive unknown profile calls you on WhatsApp video call, flashes explicit content for 5 seconds while recording your face, and immediately demands ₹20,000 to prevent publishing the video on YouTube/Facebook.',
      'Fake Profile Harassment: Creation of an imposter account on Instagram using your photos and contact details to post defamatory remarks.'
    ],
    preventionTips: [
      'NEVER answer WhatsApp video calls from unknown foreign or unknown domestic numbers.',
      'If targeted by sextortion, DO NOT PAY—paying never stops extortion; it only encourages larger demands.',
      'Preserve screenshots of the extortion messages, phone numbers, and UPI handles.',
      'Report immediately to the 1930 helpline and lodge a report on the National Cybercrime Portal under the specialized Women & Child category.',
      'Use StopNCII.org to create digital hashes that prevent intimate images from being uploaded across major platforms.'
    ],
    legalSection: 'Section 66E (Privacy violation), Section 67 & 67A (Obscene content) IT Act, 2000 & Section 384 IPC (Extortion).'
  },
  {
    id: 'safe-browsing',
    title: 'Safe Web Browsing & Public Wi-Fi Hygiene',
    category: 'Network Safety',
    readTime: '4 min read',
    icon: 'Globe',
    summary: 'Essential hygiene for navigating the web, identifying insecure connections, avoiding drive-by downloads, and securing public Wi-Fi.',
    explanation: `Everyday web browsing exposes devices to risks like eavesdropping on unsecured public Wi-Fi, malicious redirects, fake download buttons on piracy sites, and rogue browser extensions that inject advertisements or log keystrokes. Understanding network fundamentals keeps your data safe wherever you connect.`,
    examples: [
      'Evil Twin Public Wi-Fi: An attacker at a railway station sets up a free Wi-Fi hotspot named "Free_Station_WiFi". When connected, the attacker intercepts unencrypted traffic and prompts you to install a rogue security certificate.',
      'Deceptive Download Buttons: Visiting a file-sharing site where 4 fake "Download" buttons are displayed, leading to malicious browser notification permissions or adware downloads.'
    ],
    preventionTips: [
      'Verify that sites display HTTPS (padlock icon) before entering passwords or payment details.',
      'Avoid conducting sensitive financial transactions or logging into banking on public, unencrypted Wi-Fi hotspots.',
      'Use a reputable DNS provider with malware filtering (e.g., Cloudflare 1.1.1.2 or NextDNS).',
      'Regularly audit and remove unnecessary browser extensions from Chrome, Edge, or Firefox.'
    ],
    legalSection: 'Section 43 & Section 66 IT Act, 2000 (Computer data interception and tampering).'
  }
];
