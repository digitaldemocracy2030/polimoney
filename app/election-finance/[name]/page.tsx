import fs from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { ElectionFinanceClient } from '@/components/election-finance/ElectionFinanceClient';
import type { EfData } from '@/models/election-finance';

export async function generateStaticParams() {
  const dataDir = path.join(process.cwd(), 'data', 'election-finance');
  try {
    const files = await fs.readdir(dataDir);
    return files
      .filter((file) => file.startsWith('ef-') && file.endsWith('.json'))
      .map((file) => ({
        name: file.replace(/^ef-/, '').replace(/\.json$/, ''),
      }));
  } catch (error) {
    console.error('Error reading election finance data directory:', error);
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  // Validate name to prevent directory traversal
  if (!/^[a-zA-Z0-9-]+$/.test(name)) {
    notFound();
  }

  const filePath = path.join(
    process.cwd(),
    'data',
    'election-finance',
    `ef-${name}.json`,
  );

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as EfData;
    return <ElectionFinanceClient data={data} />;
  } catch (_error) {
    notFound();
  }
}
