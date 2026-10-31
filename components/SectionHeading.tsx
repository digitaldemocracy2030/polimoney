import { Title } from '@mantine/core';
import type { ReactNode } from 'react';

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Title order={2} size="h4" mb="sm">
      {children}
    </Title>
  );
}
