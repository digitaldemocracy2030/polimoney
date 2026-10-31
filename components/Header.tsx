'use client';

import {
  Anchor,
  Burger,
  Divider,
  Group,
  Menu,
  Stack,
  Switch,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MoonIcon, SunIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SNSSharePanel from './SNSSharePanel';

const POLITICAL_NAV_LINKS = [
  { href: '#summary', label: '収支の流れ' },
  { href: '#income', label: '収入の一覧' },
  { href: '#expense', label: '支出の一覧' },
] as const;

const ELECTION_NAV_LINKS = [
  { href: '#expense', label: '支出目的で見る' },
  { href: '#income', label: '収入で見る' },
  { href: '#public', label: '公費で見る' },
] as const;

export function Header({ profileName }: { profileName?: string }) {
  const pathname = usePathname();
  const { toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const [mounted, setMounted] = useState(false);
  const [menuOpened, { toggle: toggleMenu, close: closeMenu }] =
    useDisclosure(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPoliticalPage =
    /^\/(politicians|organizations)\/[^/]+\/political\//.test(pathname);
  const isElectionPage = /^\/politicians\/[^/]+\/election\//.test(pathname);
  const showNav = isPoliticalPage || isElectionPage;
  const navLinks = isElectionPage ? ELECTION_NAV_LINKS : POLITICAL_NAV_LINKS;

  return (
    <Stack component="header" gap="md">
      <Group justify="space-between" wrap="nowrap">
        <Anchor component={Link} href="/" underline="never" c="inherit">
          <Title order={1}>Polimoney</Title>
        </Anchor>

        <Group gap="sm" wrap="nowrap">
          {showNav && (
            <>
              <Group gap="md" visibleFrom="sm">
                {navLinks.map((link) => (
                  <Anchor key={link.href} href={link.href} size="sm">
                    {link.label}
                  </Anchor>
                ))}
              </Group>

              <Menu
                opened={menuOpened}
                onClose={closeMenu}
                position="bottom-end"
              >
                <Menu.Target>
                  <Burger
                    opened={menuOpened}
                    onClick={toggleMenu}
                    hiddenFrom="sm"
                    size="sm"
                    aria-label="メニュー"
                  />
                </Menu.Target>
                <Menu.Dropdown hiddenFrom="sm">
                  {navLinks.map((link) => (
                    <Menu.Item
                      key={link.href}
                      component="a"
                      href={link.href}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>

              <SNSSharePanel profileName={profileName ?? ''} />
            </>
          )}
          <Switch
            size="md"
            checked={mounted && computedColorScheme === 'dark'}
            onChange={() => toggleColorScheme()}
            onLabel={<MoonIcon size={14} />}
            offLabel={<SunIcon size={14} />}
            aria-label="テーマ切り替え"
          />
        </Group>
      </Group>
      <Divider />
    </Stack>
  );
}
