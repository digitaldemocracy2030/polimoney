import { Badge, Box, Card, Group, Image, Text } from '@mantine/core';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  href: string;
  title: ReactNode;
  subtitle?: ReactNode;
  overline?: string;
  badges?: string[];
  image?: { src: string; alt: string };
};

export function LinkCard({
  href,
  title,
  subtitle,
  overline,
  badges,
  image,
}: Props) {
  return (
    <Card component={Link} href={href} withBorder padding={0}>
      <Group wrap="nowrap" gap={0}>
        {image && (
          <Image src={image.src} alt={image.alt} w={100} h={100} fit="cover" />
        )}
        <Box p="sm" miw={0}>
          {overline && (
            <Text size="xs" c="dimmed">
              {overline}
            </Text>
          )}
          <Text fw={700}>{title}</Text>
          {subtitle && (
            <Text size="sm" c="dimmed">
              {subtitle}
            </Text>
          )}
          {badges && badges.length > 0 && (
            <Group gap="xs" mt={4}>
              {badges.map((badge) => (
                <Badge key={badge} variant="light">
                  {badge}
                </Badge>
              ))}
            </Group>
          )}
        </Box>
      </Group>
    </Card>
  );
}
