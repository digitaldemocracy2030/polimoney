import {
  Badge,
  Box,
  Card,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import demoComingsoon, {
  comingSoonId,
  comingSoonNum,
} from '@/data/demo-comingsoon';
import demoExample from '@/data/demo-example';
import demoKokiFujisaki from '@/data/demo-kokifujisaki';
import demoRyosukeIdei from '@/data/demo-ryosukeidei';
import demoTakahiroAnno from '@/data/demo-takahiroanno';
import type { ProfileList } from '@/models/type';

type Entry = {
  id: string;
  latestReportId: string;
  profile: ProfileList;
  href?: string;
};

// TODO: 暫定対応で岩永さんを公開したので、後ほど整理
const politicianEntries: Entry[] = [
  {
    id: 'election-finance-iwanaga',
    latestReportId: 'election-finance-iwanaga',
    href: '/election-finance/iwanaga',
    profile: {
      name: '岩永淳志',
      title: '和歌山県議会議員日高郡選挙区補欠選挙',
      image: '/demo-atsushiiwanaga.png',
      party: '無所属',
      district: '和歌山県日高郡',
    },
  },
  demoTakahiroAnno,
  demoRyosukeIdei,
  demoKokiFujisaki,
  demoExample,
].map((data) => ({
  id: data.id,
  latestReportId: data.latestReportId,
  profile: data.profile,
  href: 'href' in data ? data.href : undefined,
}));

const comingSoonEntries: Entry[] = Array.from(
  { length: comingSoonNum },
  (_, i) => ({
    ...demoComingsoon,
    id: `${comingSoonId}-${i}`,
    latestReportId: `${comingSoonId}-${i}`,
  }),
);

const entries: Entry[] = [...politicianEntries, ...comingSoonEntries];

export const metadata = {
  title: 'Polimoney - 政治資金の透明性を高める',
  description:
    'Polimoneyは、デジタル民主主義2030プロジェクトの一環として、政治資金の透明性を高めるために開発されたオープンソースのプロジェクトです。',
};

export default function Page() {
  return (
    <Box>
      <Header />
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5} mb={5} p={2}>
        {entries.map((entry) => (
          <Link
            href={(() => {
              if (entry.href) {
                return entry.href;
              }
              if (entry.latestReportId.startsWith(comingSoonId)) {
                return '#';
              }
              const id = entry.latestReportId.replace('demo-', '');
              const lastHyphenIndex = id.lastIndexOf('-');
              const politicianId = id.substring(0, lastHyphenIndex);
              const year = id.substring(lastHyphenIndex + 1);
              return `/${politicianId}/${year}`;
            })()}
            key={entry.latestReportId}
          >
            <Card.Root
              flexDirection="row"
              boxShadow="xs"
              border="none"
              alignItems="center"
            >
              <Image
                objectFit="cover"
                maxW="130px"
                src={entry.profile.image}
                alt={entry.profile.name}
                borderTopLeftRadius="md"
                borderBottomLeftRadius="md"
              />
              <Box>
                <Card.Body>
                  <Stack gap={0}>
                    <Text fontSize="xs">{entry.profile.title}</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {entry.profile.name}
                    </Text>
                    <HStack mt={1}>
                      {entry.profile.party && (
                        <Badge variant="outline" colorPalette="red">
                          {entry.profile.party}
                        </Badge>
                      )}
                      {entry.profile.district && (
                        <Badge variant="outline">
                          {entry.profile.district}
                        </Badge>
                      )}
                    </HStack>
                  </Stack>
                </Card.Body>
              </Box>
            </Card.Root>
          </Link>
        ))}
      </SimpleGrid>
      <Notice />
      <Footer />
    </Box>
  );
}
