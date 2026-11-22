import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';

export const metadata = {
  title: 'CyberSahayak — AI-Powered Cybercrime Assistance Platform',
  description:
    'Conversational AI assistant providing immediate guidance, incident awareness, account recovery steps, and digital evidence preservation for cyber threats.',
  keywords: [
    'CyberSahayak',
    'cybercrime guidance',
    'UPI fraud assistance',
    'phishing awareness',
    'account recovery',
    'digital forensics',
    '1930 helpline',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-shield-950 font-sans antialiased text-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <AuthProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
