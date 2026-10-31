import { Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import { Footer } from './Footer';
import { Header } from './Header';
import { Notice } from './Notice';

type Props = {
  profileName?: string;
  breadcrumb?: BreadcrumbItem[];
  children: ReactNode;
};

export function PageLayout({ profileName, breadcrumb, children }: Props) {
  return (
    <Stack gap="lg">
      <Header profileName={profileName} />
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <main>{children}</main>
      <Notice />
      <Footer />
    </Stack>
  );
}
