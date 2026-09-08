import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Time Capsule — Your current era',
  description:
    'Your people, your obsessions, your life lately. Capture your current era.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

