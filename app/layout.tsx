import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ProspectPilot - Lead Research Made Simple',
    template: '%s | ProspectPilot',
  },
  description:
    'Research leads instantly from LinkedIn and company websites. Save prospects, get company intelligence, and generate personalized outreach — all from your browser.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
