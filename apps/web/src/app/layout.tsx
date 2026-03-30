import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';

export const metadata: Metadata = {
  title: 'Campus - 캠핑준비 체크리스트',
  description: '캠핑에 필요한 모든 준비물을 체크하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
