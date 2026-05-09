import { Box } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BoardMetadata } from '@/components/BoardMetadata';
import { BoardSummary } from '@/components/BoardSummary';
import { BoardTransactions } from '@/components/BoardTransactions';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { politicianDataMap } from '@/data/politician-data';
import type { AccountingReports, Report, Transaction } from '@/models/type';

type RouteParams = {
  orgId: string;
  dataId: string;
};

type Props = {
  params: Promise<RouteParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getOrgReportData(orgId: string, dataId: string) {
  const dataModule = (
    politicianDataMap as Record<
      string,
      {
        default: AccountingReports;
        getDataByYear: (year: number) => AccountingReports | null;
      }
    >
  )[orgId];
  if (!dataModule) return null;

  const allData = dataModule.default.data;
  const matchedEntry = allData.find(
    (d: { report: Report }) => d.report.id === dataId,
  );
  if (!matchedEntry) return null;

  const allReports: Report[] = allData.map((d: { report: Report }) => d.report);
  const yearData = dataModule.getDataByYear(matchedEntry.report.year);
  if (!yearData) return null;

  return { yearData, allReports, report: matchedEntry.report };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { orgId, dataId } = await props.params;
  const data = getOrgReportData(orgId, dataId);
  if (!data)
    return { title: 'データが見つかりません | Polimoney (ポリマネー)' };
  return {
    title: `${data.report.orgName} (${data.report.year}年) | Polimoney (ポリマネー)`,
  };
}

export default async function Page(props: Props) {
  const { orgId, dataId } = await props.params;
  const data = getOrgReportData(orgId, dataId);
  if (!data) notFound();

  const { yearData, allReports } = data;
  const reportData = yearData.data[0];

  return (
    <Box>
      <Header profileName={yearData.profile.name} />
      <Breadcrumb
        items={[
          { label: data.report.orgName, href: `/organizations/${orgId}` },
          { label: '政治資金収支報告' },
        ]}
      />
      <BoardSummary
        politicianId={orgId}
        profile={yearData.profile}
        report={reportData.report}
        otherReports={allReports}
        flows={reportData.flows}
        reportPathPrefix={`/organizations/${orgId}/political`}
      />
      <BoardTransactions
        direction={'income'}
        total={reportData.report.totalIncome}
        transactions={reportData.transactions.filter(
          (t: Transaction) => t.direction === 'income',
        )}
        showPurpose={false}
        showDate={false}
      />
      <BoardTransactions
        direction={'expense'}
        total={reportData.report.totalExpense}
        transactions={reportData.transactions.filter(
          (t: Transaction) => t.direction === 'expense',
        )}
        showPurpose={false}
        showDate={false}
      />
      <BoardMetadata report={reportData.report} />
      <Notice />
      <Footer />
    </Box>
  );
}
