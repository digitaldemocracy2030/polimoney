import fs from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { findPolitician } from '@/data/politician-master';
import type { EfData } from '@/models/election-finance';
import { ElectionFinanceContent } from './ElectionFinanceContent';

type RouteParams = {
  politicianId: string;
  dataId: string;
};

type Props = {
  params: Promise<RouteParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page(props: Props) {
  const { politicianId, dataId } = await props.params;

  // Validate dataId to prevent directory traversal
  if (!/^[a-zA-Z0-9-]+$/.test(dataId)) {
    notFound();
  }

  const politician = findPolitician(politicianId);
  if (!politician) {
    notFound();
  }

  // Load all election finance data for this politician
  const allElectionData: Array<{ dataId: string; data: EfData }> = [];
  if (politician.electionDataIds) {
    for (const eid of politician.electionDataIds) {
      // Validate eid to prevent directory traversal
      if (!/^[a-zA-Z0-9-]+$/.test(eid)) continue;

      const filePath = path.join(
        process.cwd(),
        'data',
        'election-finance',
        `ef-${eid}.json`,
      );

      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent) as EfData;
        allElectionData.push({ dataId: eid, data });
      } catch (_error) {
        // Skip if file not found
      }
    }
  }

  // Find current data
  const currentData = allElectionData.find((d) => d.dataId === dataId);
  if (!currentData) {
    notFound();
  }

  return (
    <ElectionFinanceContent
      data={currentData.data}
      politicianId={politicianId}
      profile={politician.profile}
      allElectionData={allElectionData}
      currentDataId={dataId}
    />
  );
}
