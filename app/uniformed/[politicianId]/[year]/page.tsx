import { Box } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BoardMetadata } from '@/components/BoardMetadata';
import { BoardTransactions } from '@/components/BoardTransactions';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { BoardSummary } from '@/components/uniformed/BoardSummary';
import { politicianDataMap } from '@/data/uniformed/politician-data';
import type { Report, Transaction } from '@/models/uniformed/type';

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
  const dataModule = (politicianDataMap as Record<string, any>)[politicianId];

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
    };
  }

  return {
    title: `${data.yearData.profile.name} (${year}年) | Polimoney (ポリマネー)`,
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
    <Box>
      <Header profileName={data.yearData.profile.name} />
      <BoardSummary
        politicianId={politicianId}
        profile={yearData.profile}
        report={reportData.report}
        otherReports={allReports}
        transactions={reportData.transactions}
        categories={reportData.categories}
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
