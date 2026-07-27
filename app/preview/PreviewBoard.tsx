'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AccountingReports } from '@/models/type';
import { Board } from './Board';

export function PreviewBoard() {
  const [data, setData] = useState<AccountingReports | null>(null);
  const [politicianId, setPoliticianId] = useState<string | null>(null);

  useEffect(() => {
    const urlString = new URL(location.href).searchParams.get('url');
    if (!urlString) {
      notFound();
      return;
    }

    try {
      const path = new URL(urlString).pathname;
      const filename = path.split('/').pop();
      if (filename) {
        const id = filename.replace('.json', '');
        setPoliticianId(id);
      }
    } catch (e) {
      console.error('Invalid URL for preview:', e);
      notFound();
      return;
    }

    fetch(urlString)
      .then((response) => response.json())
      .then((fetchedData: AccountingReports) => {
        setData(fetchedData);
      })
      .catch(() => {
        notFound();
      });
  }, []);

  if (!data || !politicianId) {
    return null;
  }

  return <Board data={data} politicianId={politicianId} />;
}
