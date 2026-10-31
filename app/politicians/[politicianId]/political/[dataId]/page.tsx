import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { ReportBoard } from '@/components/ReportBoard';
import { politicianDataMap } from '@/data/politician-data';
import type { AccountingReports, Report } from '@/models/type';

type RouteParams = {
  politicianId: string;
  dataId: string;
};

type Props = {
  params: Promise<RouteParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getPoliticianData(politicianId: string, dataId: string) {
  const dataModule = (
    politicianDataMap as Record<
      string,
      {
        default: AccountingReports;
        getDataByYear: (year: number) => AccountingReports | null;
      }
    >
  )[politicianId];
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
  const { politicianId, dataId } = await props.params;
  const data = getPoliticianData(politicianId, dataId);
  if (!data) {
    return { title: 'データが見つかりません | Polimoney (ポリマネー)' };
  }
  return {
    title: `${data.yearData.profile.name} (${data.report.year}年) | Polimoney (ポリマネー)`,
  };
}

export default async function Page(props: Props) {
  const { politicianId, dataId } = await props.params;
  const data = getPoliticianData(politicianId, dataId);
  if (!data) notFound();

  const { yearData, allReports, report } = data;
  const entry = yearData.data.find((d) => d.report.id === report.id);

  return (
    <PageLayout
      profileName={yearData.profile.name}
      breadcrumb={[
        {
          label: yearData.profile.name,
          href: `/politicians/${politicianId}`,
        },
        { label: '政治資金収支報告' },
      ]}
    >
      <ReportBoard
        profile={yearData.profile}
        report={report}
        otherReports={allReports}
        transactions={entry?.transactions ?? []}
        categories={entry?.categories}
        reportPathPrefix={`/politicians/${politicianId}/political`}
      />
    </PageLayout>
  );
}
