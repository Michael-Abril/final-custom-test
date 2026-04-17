import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Final Custom Test App',
  description: 'Custom app deployed via Varity orchestration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
