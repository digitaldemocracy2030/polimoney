'use client';

import { Box, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SNSSharePanel from './SNSSharePanel';

export function Header({ profileName }: { profileName?: string }) {
  const pathname = usePathname();

  return (
    <Box>
      <Box w="full" position="relative">
        <Flex
          justify="space-between"
          alignItems="center"
          w="full"
          h="60px"
          px={8}
          py={5}
          background={'linear-gradient(90deg, #FDD2F8 0%, #A6D1FF 100%)'}
          borderRadius={'full'}
          color={'#ffffff'}
          textShadow={'0 0 1px #00000077'}
        >
          {/* タイトル */}
          <Box>
            <Link href={'/'}>
              <Heading as="h1" size="2xl">
                Polimoney
              </Heading>
            </Link>
          </Box>

          {/* ナビゲーションボタン */}
          <HStack
            gap={{ base: 4, lg: 6 }}
            align="center"
            position={{ base: 'absolute', lg: 'static' }}
            right={{ base: 6, lg: 'auto' }}
          >
            {pathname !== '/' && (
              <>
                <HStack
                  display={{ base: 'none', lg: 'flex' }}
                  fontSize={'sm'}
                  fontWeight={'bold'}
                  gap={6}
                >
                  <Link href={'#summary'}>収支の流れ</Link>
                  <Link href={'#income'}>収入の一覧</Link>
                  <Link href={'#expense'}>支出の一覧</Link>
                </HStack>
                <SNSSharePanel profileName={profileName ?? ''} />
              </>
            )}
          </HStack>
        </Flex>
      </Box>
      <Text fontSize={'xs'} textAlign={'center'} my={6}>
        政治資金の流れを見える化するプラットフォームです。透明性の高い政治実現を目指して、オープンソースで開発されています。
      </Text>
    </Box>
  );
}
