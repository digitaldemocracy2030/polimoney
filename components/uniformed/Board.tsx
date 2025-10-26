'use client';

import { BoardMetadata } from '@/components/BoardMetadata';
import { BoardTransactions } from '@/components/BoardTransactions';
import { BoardSummary } from '@/components/uniformed/BoardSummary';
import type { AccountingReports } from '@/models/uniformed/type';

interface BoardProps {
  data: AccountingReports | null;
  politicianId: string;
}

export function Board({ data, politicianId }: BoardProps) {
  if (!data) return;

  const reportData = data.data.find((d) => d.report.id === data.latestReportId);
  if (!reportData) return null;

  return (
    <>
      <BoardSummary
        politicianId={politicianId}
        profile={data.profile}
        report={reportData.report}
        otherReports={data.data.map((d) => d.report)}
        transactions={reportData.transactions}
        categories={reportData.categories}
        useFixedBoardChart={false}
      />
      <BoardTransactions
        direction={'income'}
        total={reportData.report.totalIncome}
        transactions={reportData.transactions.filter(
          (t) => t.direction === 'income',
        )}
        showPurpose={true}
        showDate={true}
      />
      <BoardTransactions
        direction={'expense'}
        total={reportData.report.totalExpense}
        transactions={reportData.transactions.filter(
          (t) => t.direction === 'expense',
        )}
        showPurpose={true}
        showDate={true}
      />
      <BoardMetadata report={reportData.report} />
    </>
  );
}
