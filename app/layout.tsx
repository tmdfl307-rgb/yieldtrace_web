import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YieldTrace Web | 반도체 공정 Defect & 수율 모니터링 시스템',
  description: 'Next.js + Tailwind CSS + Supabase 기반 반도체 Fab 수율 및 결함 실시간 분석 모니터링 시스템',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'YieldTrace',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js')); }`,
          }}
        />
      </body>
    </html>
  );
}