import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Main } from '@/components/uniformed/Main';
import { politicianDataMap } from '@/data/uniformed/politician-data';
import type { AccountingReports, Report } from '@/models/uniformed/type';

type Props = {
  params: Promise<{
    politicianId: string;
    year: string;
  }>;
};

export async function generateStaticParams() {
  const params = Object.entries(politicianDataMap).flatMap(
    ([politicianId, dataModule]) => {
      const reports = dataModule.default?.data?.map((d) => d.report) || [];
      return reports.map((report: Report) => ({
        politicianId: politicianId,
        year: String(report.year),
      }));
    },
  );

  return params;
}

function getPoliticianData(politicianId: string, year: string) {
  const dataModule = (
    politicianDataMap as Record<
      string,
      {
        default: AccountingReports;
        getDataByYear: (year: number) => AccountingReports | null;
      }
    >
  )[politicianId];

  console.log(`politicianId: ${politicianId}`);
  console.log(`year: ${year}`);

  if (!dataModule?.getDataByYear) {
    return null;
  }

  const yearData = dataModule.getDataByYear(Number(year));
  if (!yearData) {
    return null;
  }

  const allReports: Report[] = dataModule.default.data.map(
    (d: { report: Report }) => d.report,
  );
  return {
    yearData,
    allReports,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // awaitすると、Promise<T>からTが取り出されるため、型推論が正しく機能する
  const { politicianId, year } = await params;
  const data = getPoliticianData(politicianId, year);

  if (!data) {
    return {
      title: 'データが見つかりません | Polimoney (ポリマネー)',
      robots: {
        index: false,
        follow: false,
        nocache: true,
      },
    };
  }

  return {
    title: `${data.yearData.profile.name} (${year}年) | Polimoney (ポリマネー)`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function Page({ params }: Props) {
  const { politicianId, year } = await params;
  const data = getPoliticianData(politicianId, year);

  if (!data) {
    notFound();
  }

  const { yearData, allReports } = data;
  const reportData = yearData.data[0];

  return (
    <Main
      politicianId={politicianId}
      yearData={yearData}
      allReports={allReports}
      reportData={reportData}
    />
  );
}
