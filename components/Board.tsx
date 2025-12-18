'use client';

import { BoardMetadata } from '@/components/BoardMetadata';
import { BoardSummary } from '@/components/BoardSummary';
import { BoardTransactions } from '@/components/BoardTransactions';
import type { AccountingReports } from '@/models/type';

// ✅ 1. PropsにpoliticianIdを追加
interface BoardProps {
  data: AccountingReports | null;
  politicianId: string;
}

// ✅ 2. 引数でpoliticianIdを受け取る
export function Board({ data, politicianId }: BoardProps) {
  if (!data) return null;

  const reportData = data.data.find((d) => d.report.id === data.latestReportId);
  if (!reportData) return null;
  return (
    <>
      {/* ✅ 3. BoardSummaryにpoliticianIdを渡す */}
      <BoardSummary
        politicianId={politicianId}
        profile={data.profile}
        report={reportData.report}
        otherReports={data.data.map((d) => d.report)}
        flows={reportData.flows}
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
