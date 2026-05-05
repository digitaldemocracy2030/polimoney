import { HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <HStack gap={1} fontSize="sm" color="gray.500" px={4} pt={3}>
      {items.map((item, i) => (
        <HStack key={i} gap={1}>
          {i > 0 && <Text color="gray.400">›</Text>}
          {item.href ? (
            <Link href={item.href}>
              <Text color="blue.500" _hover={{ textDecoration: 'underline' }}>
                {item.label}
              </Text>
            </Link>
          ) : (
            <Text>{item.label}</Text>
          )}
        </HStack>
      ))}
    </HStack>
  );
}
