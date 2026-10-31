'use client';

import { ReportBoard } from '@/components/ReportBoard';
import type { AccountingReports } from '@/models/type';

interface BoardProps {
  data: AccountingReports | null;
  politicianId: string;
}

export function Board({ data, politicianId }: BoardProps) {
  if (!data) return null;

  const reportData = data.data.find((d) => d.report.id === data.latestReportId);
  if (!reportData) return null;

  return (
    <ReportBoard
      profile={data.profile}
      report={reportData.report}
      otherReports={data.data.map((d) => d.report)}
      transactions={reportData.transactions}
      categories={reportData.categories}
      reportPathPrefix={`/politicians/${politicianId}/political`}
      showPurpose
      showDate
    />
  );
}
