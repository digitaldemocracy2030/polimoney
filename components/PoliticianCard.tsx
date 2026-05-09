import { Badge, Card, HStack, Image, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import type { PoliticianMasterEntry } from '@/data/politician-master';

type Props = {
  entry: PoliticianMasterEntry;
};

export function PoliticianCard({ entry }: Props) {
  return (
    <Link href={`/politicians/${entry.id}`}>
      <Card.Root
        flexDirection="row"
        h="100px"
        boxShadow="xs"
        border="1px solid"
        borderColor="gray.200"
        _hover={{ boxShadow: 'sm', borderColor: 'gray.300' }}
        transition="all 0.15s"
        cursor="pointer"
        overflow="hidden"
      >
        <Image
          objectFit="cover"
          w="100px"
          h="100px"
          flexShrink={0}
          src={entry.profile.image}
          alt={entry.profile.name}
        />
        <Card.Body px={3} py={2} display="flex" justifyContent="center">
          <Stack gap={0}>
            <Text fontSize="xs" color="gray.500">
              {entry.profile.title}
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              {entry.profile.name}
            </Text>
            <HStack mt={1}>
              {entry.profile.party && (
                <Badge
                  variant="outline"
                  colorPalette="red"
                  fontSize="xs"
                >
                  {entry.profile.party}
                </Badge>
              )}
              {entry.profile.district && (
                <Badge variant="outline" fontSize="xs">
                  {entry.profile.district}
                </Badge>
              )}
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Link>
  );
}
