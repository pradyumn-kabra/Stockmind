import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StockMind',
  description: 'Manage products, track stock movements, monitor replenishment needs, and spot unusual inventory activity from one intuitive workspace.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#F8F6F2] text-[#171512]">
        {children}
      </body>
    </html>
  );
}
