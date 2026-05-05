import fs from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
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

  const filePath = path.join(
    process.cwd(),
    'data',
    'election-finance',
    `ef-${dataId}.json`,
  );

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as EfData;
    return <ElectionFinanceContent data={data} politicianId={politicianId} />;
  } catch (_error) {
    notFound();
  }
}
