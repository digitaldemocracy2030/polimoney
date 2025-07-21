'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AccountingReports } from '@/models/type';
import { Board } from './Board';

export function PreviewBoard() {
  const [data, setData] = useState<AccountingReports | null>(null);
  useEffect(() => {
    const url = new URL(location.href).searchParams.get('url');
    if (!url) {
      notFound();
      return;
    }
    fetch(url)
      .then((response) => response.json())
      .then((data: AccountingReports) => {
        setData(data);
      })
      .catch(() => {
        notFound();
      });
  }, []);

  return <Board data={data} />;
}
