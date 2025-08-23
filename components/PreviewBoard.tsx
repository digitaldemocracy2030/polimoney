'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AccountingReports } from '@/models/type';
import { Board } from './Board';

export function PreviewBoard() {
  const [data, setData] = useState<AccountingReports | null>(null);
  // ✅ 1. politicianIdを保持するためのstateを追加
  const [politicianId, setPoliticianId] = useState<string | null>(null);

  useEffect(() => {
    const urlString = new URL(location.href).searchParams.get('url');
    if (!urlString) {
      notFound();
      return;
    }

    // ✅ 2. URLからpoliticianIdを抽出
    try {
      const path = new URL(urlString).pathname;
      const filename = path.split('/').pop(); // "some-id.json"などを取得
      if (filename) {
        const id = filename.replace('.json', '');
        setPoliticianId(id); // ✅ 3. politicianIdをstateにセット
      }
    } catch (e) {
      console.error('Invalid URL for preview:', e);
      notFound();
      return;
    }

    // データの取得処理
    fetch(urlString)
      .then((response) => response.json())
      .then((fetchedData: AccountingReports) => {
        setData(fetchedData);
      })
      .catch(() => {
        notFound();
      });
  }, []);

  // ✅ 4. dataとpoliticianIdが揃ったらBoardコンポーネントを描画
  if (!data || !politicianId) {
    return null; // またはローディング表示など
  }

  return <Board data={data} politicianId={politicianId} />;
}
