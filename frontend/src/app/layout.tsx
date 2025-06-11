'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <AuthProvider>
          <ChatProvider>{children}</ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}