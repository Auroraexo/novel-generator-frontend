import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Novel Generator - 网文短篇生成器',
  description: '基于 AI 的网文短篇小说生成工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <header className="bg-ink sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center text-ink font-bold text-sm">
                N
              </span>
              <span className="text-lg font-semibold text-white font-serif">
                Novel Generator
              </span>
            </a>
            <span className="text-sm text-gray-400 hidden sm:block">
              AI 网文短篇创作
            </span>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
