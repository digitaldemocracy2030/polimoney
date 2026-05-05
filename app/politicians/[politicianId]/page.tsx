import fs from 'node:fs/promises';
import path from 'node:path';
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
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { politicianDataMap } from '@/data/politician-data';
import { findPolitician } from '@/data/politician-master';
import type { EfMetadata } from '@/models/election-finance';
import type { AccountingReports, Report } from '@/models/type';

type RouteParams = { politicianId: string };
type Props = { params: Promise<RouteParams> };

function getPoliticalReports(politicianId: string): Report[] {
  const dataModule = (
    politicianDataMap as Record<
      string,
      { default: AccountingReports }
    >
  )[politicianId];
  if (!dataModule) return [];
  return dataModule.default.data.map((d: { report: Report }) => d.report);
}

async function getElectionData(
  dataId: string,
): Promise<EfMetadata | null> {
  const filePath = path.join(
    process.cwd(),
    'data',
    'election-finance',
    `ef-${dataId}.json`,
  );
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content) as { metadata: EfMetadata };
    return json.metadata;
  } catch {
    return null;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { politicianId } = await props.params;
  const politician = findPolitician(politicianId);
  if (!politician) return { title: 'データが見つかりません | Polimoney (ポリマネー)' };
  return {
    title: `${politician.profile.name} | Polimoney (ポリマネー)`,
  };
}

export default async function Page(props: Props) {
  const { politicianId } = await props.params;
  const politician = findPolitician(politicianId);

  if (!politician || politician.id.startsWith('demo-comingsoon')) {
    notFound();
  }

  const politicalReports = politician.politicalDataId
    ? getPoliticalReports(politician.politicalDataId)
    : [];

  const electionItems = await Promise.all(
    (politician.electionDataIds ?? []).map(async (dataId) => ({
      dataId,
      metadata: await getElectionData(dataId),
    })),
  );

  return (
    <Box>
      <Header profileName={politician.profile.name} />
      <Box px={4} py={6}>
        {/* プロフィールヘッダー */}
        <HStack gap={4} mb={8}>
          <Image
            src={politician.profile.image}
            alt={politician.profile.name}
            boxSize="80px"
            objectFit="cover"
            borderRadius="full"
          />
          <Stack gap={0}>
            <Text fontSize="xs" color="gray.500">{politician.profile.title}</Text>
            <Text fontSize="2xl" fontWeight="bold">{politician.profile.name}</Text>
            <HStack mt={1}>
              {politician.profile.party && (
                <Badge variant="outline" colorPalette="red">
                  {politician.profile.party}
                </Badge>
              )}
              {politician.profile.district && (
                <Badge variant="outline">{politician.profile.district}</Badge>
              )}
            </HStack>
          </Stack>
        </HStack>

        {/* 政治資金収支 */}
        {politicalReports.length > 0 && (
          <Box mb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              政治資金収支報告
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {politicalReports.slice(0, 4).map((report) => (
                <Link
                  key={report.id}
                  href={`/politicians/${politicianId}/political/${report.id}`}
                >
                  <Card.Root
                    flexDirection="row"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ boxShadow: 'sm', borderColor: 'gray.300' }}
                    transition="all 0.15s"
                    cursor="pointer"
                    overflow="hidden"
                  >
                    <Box
                      w="6px"
                      flexShrink={0}
                      background="linear-gradient(180deg, #FDD2F8 0%, #A6D1FF 100%)"
                    />
                    <Card.Body px={4} py={3}>
                      <Text fontWeight="bold">{report.year}年</Text>
                      <Text fontSize="sm" color="gray.600">{report.orgName}</Text>
                    </Card.Body>
                  </Card.Root>
                </Link>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* 選挙運動収支 */}
        {electionItems.length > 0 && (
          <Box mb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              選挙運動費用収支報告
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {electionItems.map(({ dataId, metadata }) =>
                metadata ? (
                  <Link
                    key={dataId}
                    href={`/politicians/${politicianId}/election/${dataId}`}
                  >
                    <Card.Root
                      flexDirection="row"
                      boxShadow="xs"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ boxShadow: 'sm', borderColor: 'gray.300' }}
                      transition="all 0.15s"
                      cursor="pointer"
                      overflow="hidden"
                    >
                      <Box
                        w="6px"
                        flexShrink={0}
                        background="linear-gradient(180deg, #FDD2F8 0%, #A6D1FF 100%)"
                      />
                      <Card.Body px={4} py={3}>
                        <Text fontWeight="bold">{metadata.title}</Text>
                        <Text fontSize="sm" color="gray.600">{metadata.date}</Text>
                      </Card.Body>
                    </Card.Root>
                  </Link>
                ) : null,
              )}
            </SimpleGrid>
          </Box>
        )}

        {politicalReports.length === 0 && electionItems.length === 0 && (
          <Text color="gray.500">データがありません</Text>
        )}

        {/*
        TODO: 政治団体導線を再公開する際にこのセクションを復帰する
        {politician.politicalDataId && politicalReports.length > 0 && (
          <Box mb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              紐づく政治団体
            </Text>
            <Link href={`/organizations/${politicianId}`}>
              <Card.Root
                flexDirection="row"
                boxShadow="xs"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ boxShadow: 'sm', borderColor: 'gray.300' }}
                transition="all 0.15s"
                cursor="pointer"
                overflow="hidden"
              >
                <Box
                  w="6px"
                  flexShrink={0}
                  background="linear-gradient(180deg, #FDD2F8 0%, #A6D1FF 100%)"
                />
                <Card.Body px={4} py={3}>
                  <Text fontWeight="bold">
                    {politicalReports[0].orgName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {politicalReports[0].orgType}
                  </Text>
                </Card.Body>
              </Card.Root>
            </Link>
          </Box>
        )}
        */}
      </Box>
      <Notice />
      <Footer />
    </Box>
  );
}
