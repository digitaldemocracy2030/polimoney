import { Box, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Box px={4} pt={3} mb={2}>
      <HStack
        as="nav"
        aria-label="パンくず"
        gap={1.5}
        flexWrap="wrap"
        display="inline-flex"
        maxW="100%"
        px={0}
        py={0}
      >
        {items.map((item, i) => (
          <HStack key={`${item.label}-${item.href}`} gap={1.5} minW={0}>
            {i > 0 && (
              <Text color="gray.300" fontSize="xs" aria-hidden>
                /
              </Text>
            )}
            {item.href ? (
              <Link href={item.href}>
                <Text
                  fontSize="sm"
                  color="gray.700"
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  transition="all 0.15s"
                  _hover={{
                    color: 'gray.900',
                    textDecoration: 'none',
                    bg: 'gray.100',
                  }}
                >
                  {item.label}
                </Text>
              </Link>
            ) : (
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="gray.800"
                px={2}
                py={0.5}
                borderRadius="md"
                bg="transparent"
              >
                {item.label}
              </Text>
            )}
          </HStack>
        ))}
      </HStack>
    </Box>
  );
}
