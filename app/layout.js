import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'IELTS Prep AI',
  description: 'Your personal IELTS preparation assistant powered by Google Gemini',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
