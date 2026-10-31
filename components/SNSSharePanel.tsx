'use client';

import { ActionIcon, Group, Menu } from '@mantine/core';
import { CheckIcon, LinkIcon, Share2Icon } from 'lucide-react';
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
    <Menu closeOnItemClick={false} position="bottom">
      <Menu.Target>
        <ActionIcon variant="default" size="lg" aria-label="共有">
          <Share2Icon size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Group gap={8} p={4} wrap="nowrap">
          <ActionIcon
            variant="light"
            color={copied ? 'green' : 'gray'}
            radius="xl"
            size={32}
            onClick={handleCopy}
            aria-label={copied ? 'コピー済み' : 'URLをコピー'}
          >
            {copied ? <CheckIcon size={16} /> : <LinkIcon size={16} />}
          </ActionIcon>
          <LineShareButton url={url} title={shareTitle}>
            <LineIcon size={32} round />
          </LineShareButton>
          <FacebookShareButton
            url={url}
            title={shareTitle}
            hashtag={hashTags[0]}
          >
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton url={url} title={shareTitle} hashtags={hashTags}>
            <XIcon size={32} round />
          </TwitterShareButton>
        </Group>
      </Menu.Dropdown>
    </Menu>
  );
}
