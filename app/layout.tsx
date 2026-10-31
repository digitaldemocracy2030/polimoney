import '@mantine/core/styles.css';
import { ColorSchemeScript, Container, MantineProvider } from '@mantine/core';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: 'Polimoney (ポリマネー)',
  description:
    'Polimoney (ポリマネー) は、デジタル民主主義2030プロジェクトの一環として、政治資金の透明性を高めるために開発されたオープンソースのプロジェクトです。',
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://polimoney.dd2030.org'
      : 'http://localhost:3000',
  ),
  openGraph: {
    images: ['/ogp/polimoney.png'],
  },
  other: {
    thumbnail: 'https://polimoney.dd2030.org/ogp/polimoney.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const structuredWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://polimoney.dd2030.org/',
    name: 'Polimoney (ポリマネー)',
    description:
      '政治資金の流れを見える化するプラットフォームです。透明性の高い政治実現を目指して、オープンソースで開発されています。',
    image: {
      '@type': 'ImageObject',
      url: 'https://polimoney.dd2030.org/ogp/polimoney.png',
    },
    author: {
      '@type': 'Organization',
      name: 'デジタル民主主義2030プロジェクト',
    },
  };

  const structuredDataOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    url: 'https://dd2030.org/',
    logo: 'https://polimoney.dd2030.org/dd2030_logo.png',
    name: 'デジタル民主主義2030プロジェクト',
    description:
      '「デジタル民主主義2030」は、技術の力で市民の声を活かし、政治をより良い形に進化させることを目指したプロジェクトです。透明性と信頼を重視し、多くの人々が政策に参加できる未来を目指しています。',
  };

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: ハードコードのため問題なし
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredWebSite),
          }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: ハードコードのため問題なし
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataOrganization),
          }}
        />
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <NextTopLoader showSpinner={false} />
        <MantineProvider defaultColorScheme="auto">
          <Container size="lg" py="md">
            {children}
          </Container>
        </MantineProvider>
      </body>
    </html>
  );
}
