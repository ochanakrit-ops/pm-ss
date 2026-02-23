import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PM-SS MobilePro',
  description: 'PM-SS Production MVP (Multi-company) on Render + Supabase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
