import { BoardMetadata } from '@/components/BoardMetadata';
import { BoardSummary } from '@/components/BoardSummary';
import { BoardTransactions } from '@/components/BoardTransactions';
import type { Category } from '@/data/common';
import type { Profile, Report, Transaction } from '@/models/type';

type Props = {
  profile: Profile;
  report: Report;
  otherReports: Report[];
  transactions: Transaction[];
  categories?: {
    income: Category[];
    expense: Category[];
  };
  reportPathPrefix: string;
  showPurpose?: boolean;
  showDate?: boolean;
};

export function ReportBoard({
  profile,
  report,
  otherReports,
  transactions,
  categories,
  reportPathPrefix,
  showPurpose = false,
  showDate = false,
}: Props) {
  return (
    <>
      <BoardSummary
        profile={profile}
        report={report}
        otherReports={otherReports}
        transactions={transactions}
        categories={categories}
        reportPathPrefix={reportPathPrefix}
      />
      <BoardTransactions
        direction="income"
        total={report.totalIncome}
        transactions={transactions.filter((t) => t.direction === 'income')}
        showPurpose={showPurpose}
        showDate={showDate}
      />
      <BoardTransactions
        direction="expense"
        total={report.totalExpense}
        transactions={transactions.filter((t) => t.direction === 'expense')}
        showPurpose={showPurpose}
        showDate={showDate}
      />
      <BoardMetadata report={report} />
    </>
  );
}
