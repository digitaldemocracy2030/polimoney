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
import type { AccountingReports, Report } from '@/models/type';

type RouteParams = { orgId: string };
type Props = { params: Promise<RouteParams> };

function getOrgData(orgId: string) {
  const dataModule = (
    politicianDataMap as Record<string, { default: AccountingReports }>
  )[orgId];
  if (!dataModule) return null;
  const reports = dataModule.default.data.map(
    (d: { report: Report }) => d.report,
  );
  if (reports.length === 0) return null;
  const latest = reports.reduce((a, b) => (a.year > b.year ? a : b));
  return { reports, latest };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { orgId } = await props.params;
  const data = getOrgData(orgId);
  if (!data) return { title: 'データが見つかりません | Polimoney (ポリマネー)' };
  return { title: `${data.latest.orgName} | Polimoney (ポリマネー)` };
}

export default async function Page(props: Props) {
  const { orgId } = await props.params;
  const data = getOrgData(orgId);
  if (!data) notFound();

  const politician = findPolitician(orgId);
  const sortedReports = [...data.reports].sort((a, b) => b.year - a.year);

  return (
    <Box>
      <Header />
      <Box px={4} py={6}>
        {/* 団体情報 */}
        <Box mb={8}>
          <Text fontSize="2xl" fontWeight="bold">
            {data.latest.orgName}
          </Text>
          <HStack mt={2}>
            <Badge variant="outline">{data.latest.orgType}</Badge>
            <Badge variant="outline">{data.latest.activityArea}</Badge>
          </HStack>
        </Box>

        {/* 政治資金収支報告 */}
        <Box mb={8}>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            政治資金収支報告
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {sortedReports.map((report) => (
              <Link
                key={report.id}
                href={`/organizations/${orgId}/political/${report.id}`}
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
                    <Text fontSize="sm" color="gray.600">
                      {report.orgName}
                    </Text>
                  </Card.Body>
                </Card.Root>
              </Link>
            ))}
          </SimpleGrid>
        </Box>

        {/* 代表者（政治家リンク） */}
        {politician && (
          <Box mb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              代表者
            </Text>
            <Link href={`/politicians/${orgId}`}>
              <Card.Root
                flexDirection="row"
                h="90px"
                boxShadow="xs"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ boxShadow: 'sm', borderColor: 'gray.300' }}
                transition="all 0.15s"
                cursor="pointer"
                overflow="hidden"
              >
                <Image
                  objectFit="cover"
                  w="90px"
                  h="90px"
                  flexShrink={0}
                  src={politician.profile.image}
                  alt={politician.profile.name}
                />
                <Card.Body px={4} py={3} display="flex" alignItems="center">
                  <Stack gap={0}>
                    <Text fontSize="xs" color="gray.500">
                      {data.latest.representative}
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">
                      {politician.profile.name}
                    </Text>
                    <HStack mt={1}>
                      {politician.profile.party && (
                        <Badge
                          variant="outline"
                          colorPalette="red"
                          fontSize="xs"
                        >
                          {politician.profile.party}
                        </Badge>
                      )}
                    </HStack>
                  </Stack>
                </Card.Body>
              </Card.Root>
            </Link>
          </Box>
        )}
      </Box>
      <Notice />
      <Footer />
    </Box>
  );
}
