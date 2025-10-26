'use client';

import { Box } from '@chakra-ui/react';
import { BoardMetadata } from '@/components/BoardMetadata';
import { BoardTransactions } from '@/components/BoardTransactions';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { BoardSummary } from '@/components/uniformed/BoardSummary';
import type { Report, Transaction } from '@/models/uniformed/type';
import { useAuth0 } from '@auth0/auth0-react';
import { notFound } from 'next/navigation';

interface Props {
  politicianId: string;
  yearData: any;
  allReports: Report[];
  reportData: any;
}

export function Main({
  politicianId,
  yearData,
  allReports,
  reportData,
}: Props) {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) return null;

  return (
    <Box>
      <Header profileName={yearData.profile.name} />
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
