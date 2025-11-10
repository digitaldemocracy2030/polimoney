'use client';

import { Group, Menu } from '@chakra-ui/react';
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

export default function SNSSharePanel({
  profileName,
}: {
  profileName: string;
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
  const shareTitle = profileName ? `${profileName} - ${siteTitle}` : siteTitle;
  const url = `${origin}${pathname}`;
  const hashTags = ['Polimoney', 'デジタル民主主義2030'];

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
    <Menu.Root closeOnSelect={false} positioning={{ placement: 'bottom' }}>
      <Menu.Trigger asChild>
        <button
          type="button"
          className={`text-sm font-normal px-3 py-0.5 rounded-none transition z-10
                  bg-black text-white border border-black hover:bg-gray-700 hover:text-white`}
          aria-label="共有"
        >
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
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <ShareButtons
            url={url}
            shareTitle={shareTitle}
            hashTags={hashTags}
            copied={copied}
            onCopy={handleCopy}
          />
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}

const ShareButtons = ({
  url,
  shareTitle,
  hashTags,
  copied,
  onCopy,
}: {
  url: string;
  shareTitle: string;
  hashTags: string[];
  copied: boolean;
  onCopy: () => void;
}) => (
  <Group grow gap="0">
    <Menu.Item value="copy" onClick={onCopy}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border transition">
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
            <path
              d="M10 16l4 4 7-7"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
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
      </div>
    </Menu.Item>
    <Menu.Item value="line">
      <LineShareButton url={url} title={shareTitle}>
        <LineIcon size={32} round />
      </LineShareButton>
    </Menu.Item>
    <Menu.Item value="facebook">
      <FacebookShareButton url={url} title={shareTitle} hashtag={hashTags[0]}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
    </Menu.Item>
    <Menu.Item value="twitter">
      <TwitterShareButton url={url} title={shareTitle} hashtags={hashTags}>
        <XIcon size={32} round />
      </TwitterShareButton>
    </Menu.Item>
  </Group>
);
