import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { ReportBoard } from '@/components/ReportBoard';
import { politicianDataMap } from '@/data/politician-data';
import type { AccountingReports, Report } from '@/models/type';

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

  const { yearData, allReports, report } = data;
  const entry = yearData.data.find((d) => d.report.id === report.id);

  return (
    <PageLayout
      profileName={yearData.profile.name}
      breadcrumb={[
        { label: report.orgName, href: `/organizations/${orgId}` },
        { label: '政治資金収支報告' },
      ]}
    >
      <ReportBoard
        profile={yearData.profile}
        report={report}
        otherReports={allReports}
        transactions={entry?.transactions ?? []}
        categories={entry?.categories}
        reportPathPrefix={`/organizations/${orgId}/political`}
      />
    </PageLayout>
  );
}
