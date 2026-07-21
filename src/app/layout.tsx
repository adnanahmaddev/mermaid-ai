import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MermaidAI - AI Powered Diagram Studio',
  description: 'Generate, edit, and visualize dynamic Mermaid diagrams with AI assistant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
