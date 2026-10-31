import { Anchor, Breadcrumbs, Text } from '@mantine/core';
import Link from 'next/link';

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Breadcrumbs aria-label="パンくず">
      {items.map((item) =>
        item.href ? (
          <Anchor
            key={`${item.label}-${item.href}`}
            component={Link}
            href={item.href}
            size="sm"
          >
            {item.label}
          </Anchor>
        ) : (
          <Text key={item.label} size="sm">
            {item.label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
}
