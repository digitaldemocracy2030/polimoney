'use client';
import { Box, Heading, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SNSSharePanel from './SNSSharePanel';

export function Header({ profileName }: { profileName?: string }) {
  const pathname = usePathname();

  return (
    <Box>
      <Box w="full" position="relative">
        <HStack
          justify="space-between"
          position="relative"
          w="full"
          px={{ base: 6, md: 10 }}
          py={5}
          background={'linear-gradient(90deg, #FDD2F8 0%, #A6D1FF 100%)'}
          borderRadius={'full'}
          color={'#ffffff'}
          textShadow={'0 0 1px #00000077'}
        >
          {/* タイトル（デスクトップでは左端、モバイルでは非表示） */}
          <Box display={{ base: 'none', lg: 'block' }}>
            <Link href={'/'}>
              <Heading fontSize={'3xl'}>Polimoney</Heading>
            </Link>
          </Box>

          {/* モバイル用：中央のタイトル */}
          <Box
            display={{ base: 'block', lg: 'none' }}
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
          >
            <Link href={'/'}>
              <Heading fontSize={'3xl'}>Polimoney</Heading>
            </Link>
          </Box>

          {/* デスクトップ用：右寄せナビゲーション */}
          <HStack
            display={{ base: 'none', lg: 'flex' }}
            gap={8}
            position="absolute"
            right={{ base: 6, md: 10 }}
          >
            <HStack fontSize={'sm'} fontWeight={'bold'} gap={8}>
              <Link href={'#summary'}>収支の流れ</Link>
              <Link href={'#income'}>収入の一覧</Link>
              <Link href={'#expense'}>支出の一覧</Link>
            </HStack>
            {pathname !== '/' && (
              <Box>
                <SNSSharePanel profileName={profileName ?? ''} />
              </Box>
            )}
          </HStack>

          {/* モバイル用：共有ボタン（右端に固定配置） */}
          {pathname !== '/' && (
            <Box
              display={{ base: 'block', lg: 'none' }}
              position="absolute"
              right={{ base: 6, md: 10 }}
              top="50%"
              transform="translateY(-50%)"
            >
              <SNSSharePanel profileName={profileName ?? ''} />
            </Box>
          )}
        </HStack>
      </Box>
      <Text fontSize={'xs'} textAlign={'center'} my={6}>
        政治資金の流れを見える化するプラットフォームです。透明性の高い政治実現を目指して、オープンソースで開発されています。
      </Text>
    </Box>
  );
}
