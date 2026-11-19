/**
 * Verified Official Indian Cybercrime Reporting & Digital Safety Resources
 *
 * All URLs are official government and regulatory resources.
 * No imaginary or unverified domains.
 */

export const OFFICIAL_RESOURCES = [
  {
    id: 'ncrp',
    name: 'National Cyber Crime Reporting Portal (NCRP)',
    authority: 'Ministry of Home Affairs (MHA), Government of India',
    url: 'https://cybercrime.gov.in',
    type: 'Official Incident Reporting Portal',
    badge: 'Central Portal',
    description: 'The primary central government portal for reporting all types of cybercrimes in India, including financial cyber fraud, online crimes against women and children, hacking, and cyber terrorism.',
    actionText: 'Report an Incident',
    helpline: '1930'
  },
  {
    id: 'helpline-1930',
    name: 'National Cybercrime Helpline — 1930',
    authority: 'Indian Cyber Crime Coordination Centre (I4C), MHA',
    url: 'https://cybercrime.gov.in',
    type: 'Emergency Toll-Free Helpline',
    badge: '24/7 Emergency',
    description: 'Direct national helpline for emergency reporting of online financial fraud (Citizen Financial Cyber Fraud Reporting and Management System). Calling within the "Golden Hour" enables authorities to freeze beneficiary accounts before funds are withdrawn.',
    actionText: 'Call 1930',
    helpline: '1930'
  },
  {
    id: 'cert-in',
    name: 'CERT-In (Indian Computer Emergency Response Team)',
    authority: 'Ministry of Electronics and Information Technology (MeitY)',
    url: 'https://www.cert-in.org.in',
    type: 'National Incident Response & Advisories',
    badge: 'Technical Authority',
    description: 'The national nodal agency for responding to computer security incidents. Publishes vulnerability alerts, security bulletins, advisories on zero-days, and guides on incident reporting for organizations and citizens.',
    actionText: 'Visit CERT-In',
    helpline: '1800-11-4949'
  },
  {
    id: 'rbi-sachet',
    name: 'RBI Sachet Portal',
    authority: 'Reserve Bank of India (RBI)',
    url: 'https://sachet.rbi.org.in',
    type: 'Financial Fraud & Unauthorized Lending',
    badge: 'Banking Regulator',
    description: 'Official Reserve Bank of India portal for reporting illegal deposit-taking schemes, unauthorized digital lending apps, and unregistered financial entities.',
    actionText: 'Report to RBI Sachet',
    helpline: '14440'
  },
  {
    id: 'sanchar-saathi',
    name: 'Sanchar Saathi & Chakshu Portal',
    authority: 'Department of Telecommunications (DoT), Ministry of Communications',
    url: 'https://sancharsaathi.gov.in',
    type: 'Telecom Fraud & Lost Mobile Tracking',
    badge: 'Telecom Authority',
    description: 'Comprehensive portal to report suspected fraud communications (Chakshu), block lost or stolen mobile handsets across India (CEIR), and check the number of mobile connections issued in your name (TAFCOP).',
    actionText: 'Visit Sanchar Saathi',
    helpline: '1909 (Spam/DND)'
  },
  {
    id: 'ceir-portal',
    name: 'CEIR (Central Equipment Identity Register)',
    authority: 'Department of Telecommunications (DoT)',
    url: 'https://www.ceir.gov.in',
    type: 'Handset Blocking & IMEI Verification',
    badge: 'IMEI Defense',
    description: 'Enables citizens whose mobile phones have been lost or stolen to block the IMEI number nationally, rendering the device completely unusable across all Indian telecom network operators.',
    actionText: 'Block Lost Mobile IMEI',
    helpline: '14422'
  },
  {
    id: 'tafcop-portal',
    name: 'TAFCOP (Telecom Analytics for Fraud management)',
    authority: 'Department of Telecommunications (DoT)',
    url: 'https://tafcop.sancharsaathi.gov.in',
    type: 'SIM Connection Audit',
    badge: 'Identity Audit',
    description: 'Enter your mobile number to discover all active cellular SIM connections registered under your identity documents across India, and report any connections you did not authorize.',
    actionText: 'Check Active SIMs',
    helpline: null
  },
  {
    id: 'stop-ncii',
    name: 'StopNCII.org (Non-Consensual Intimate Image Hash Service)',
    authority: 'Global Anti-Harassment Alliance (SWGfL & Technology Partners)',
    url: 'https://stopncii.org',
    type: 'Intimate Image Abuse Prevention',
    badge: 'Privacy Tool',
    description: 'Generates non-reversible cryptographic hashes from your device to proactively prevent intimate images or sextortion material from ever being uploaded or shared across participating global tech platforms.',
    actionText: 'Create Image Hash',
    helpline: null
  }
];

export const GOLDEN_HOUR_STEPS = [
  {
    step: 1,
    title: 'Call 1930 Immediately',
    desc: 'The National Cybercrime Helpline connects directly to the Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS). Dial 1930 within 2 to 3 hours of the debit.'
  },
  {
    step: 2,
    title: 'Provide Transaction Identifiers',
    desc: 'Have your bank account number, debit card number, transaction UTR/reference number, and fraudster UPI ID/mobile number ready for the operator.'
  },
  {
    step: 3,
    title: 'Automated Inter-Bank Freeze Triggered',
    desc: 'The 1930 system immediately issues automated electronic holds to the recipient banks, freezing the fraudulent money trail before it can be cashed out.'
  },
  {
    step: 4,
    title: 'Receive Acknowledgement SMS & Complete NCRP Filing',
    desc: 'Within 24 hours, use the acknowledgement SMS ticket number to submit the formal incident report at cybercrime.gov.in.'
  }
];
