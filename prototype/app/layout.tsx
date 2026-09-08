import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Time Capsule — Your life, in pages',
  description:
    'A personal scrapbook for the little things that make this chapter yours.',
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
