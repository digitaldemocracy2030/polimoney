'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FacebookIcon,
  FacebookShareButton,
  LineIcon,
  LineShareButton,
  TwitterShareButton,
  XIcon,
} from 'react-share';

const titleMap: Record<string, string> = {
  '/polimoney': 'Polimoney',
};

export default function SNSSharePanel({
  className = '',
}: {
  className?: string;
}) {
  const pathname = usePathname();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const siteTitle = 'Polimoney';
  const title = titleMap[pathname];
  const shareTitle = title ? `${siteTitle} - ${title}` : siteTitle;
  const url = `${origin}${pathname}`;

  const SNSButtons = () => (
    <>
      {/* コピー用ボタン */}
      <button
        onClick={handleCopy}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border transition"
        aria-label="URLをコピー"
        type="button"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <title>{copied ? 'コピー済み' : 'URLをコピー'}</title>
          <circle
            cx="16"
            cy="16"
            r="16"
            fill={copied ? '#4ade80' : '#f3f4f6'}
            stroke="#e5e7eb"
          />
          {copied ? (
            // コピー済みアイコン（チェックマーク）
            <path
              d="M12 17l4 4 7-7"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            // コピーアイコン
            <>
              <rect
                x="10"
                y="12"
                width="10"
                height="10"
                rx="2"
                stroke="#555"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="13"
                y="9"
                width="10"
                height="10"
                rx="2"
                stroke="#555"
                strokeWidth="2"
                opacity="0.3"
                fill="none"
              />
            </>
          )}
        </svg>
      </button>
      <LineShareButton url={url} title={shareTitle}>
        <LineIcon size={32} round />
      </LineShareButton>
      <FacebookShareButton url={url} title={shareTitle}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={url} title={shareTitle}>
        <XIcon size={32} round />
      </TwitterShareButton>
    </>
  );

  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_e) {
      // エラー時は何もしない
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* SNSボタン：SHAREボタンの左横に表示（中央揃え） */}
      {visible && (
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 flex gap-2 bg-white rounded shadow-lg p-2 z-20">
          <SNSButtons />
          {/* ポップアップでコピー通知 */}
          {copied && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-black text-white text-xs rounded px-3 py-1 shadow z-30 whitespace-nowrap animate-fade-in">
              リンクをコピーしました
            </div>
          )}
        </div>
      )}

      {/* SHAREボタン */}
      <button
        type="button"
        className={`text-sm font-normal px-3 py-0.5 rounded-none transition z-10
                ${
                  visible
                    ? 'bg-white text-black border border-black'
                    : 'bg-black text-white border border-black hover:bg-gray-700 hover:text-white'
                }`}
        onClick={() => setVisible((v) => !v)}
        aria-label="共有"
      >
        {/* 共有アイコン（四角＋上矢印） */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <title>共有</title>
          <rect
            x="4"
            y="9"
            width="12"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 15V3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7 6l3-3 3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
