import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Urbex Multi-Tool',
  description: 'Mobile-first app for finding and analyzing potentially abandoned locations.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-md px-4 py-4 sm:max-w-2xl">{children}</div>
      </body>
    </html>
  );
}
