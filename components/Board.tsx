'use client';

import { BoardMetadata } from '@/components/BoardMetadata';
import { BoardSummary } from '@/components/BoardSummary';
import { BoardTransactions } from '@/components/BoardTransactions';
import type { AccountingReports } from '@/models/type';

interface BoardProps {
  data: AccountingReports | null;
}

export function Board({ data }: BoardProps) {
  if (!data) return <></>;

  const reportData = data.datas.find(
    (d) => d.report.id === data.latestReportId,
  );
  if (!reportData) return null;
  return (
    <>
      <BoardSummary
        profile={data.profile}
        report={reportData.report}
        otherReports={data.datas.map((d) => d.report)}
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
