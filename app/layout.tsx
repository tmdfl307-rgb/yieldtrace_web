import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YieldTrace | 반도체 공정 Defect & 수율 모니터링",
  description: "반도체 제조 라인 Defect/Particle 검사 데이터 및 SPC p-관리도 수율 모니터링 시스템",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "YieldTrace",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
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