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
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-gray-900">
              Novel Generator
            </a>
            <span className="text-sm text-gray-500">网文短篇生成器</span>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
