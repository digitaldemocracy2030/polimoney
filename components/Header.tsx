'use client';
import { Box, HStack, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SNSSharePanel from './SNSSharePanel';

export function Header() {
  const pathname = usePathname();

  return (
    <Box>
      <HStack
        justify={{ base: 'center', lg: 'space-between' }}
        alignItems={'center'}
        px={10}
        py={5}
        background={'linear-gradient(90deg, #FDD2F8 0%, #A6D1FF 100%)'}
        borderRadius={'full'}
        color={'#ffffff'}
        textShadow={'0 0 1px #00000077'}
      >
        <Link href={'/'}>
          <Heading fontSize={'3xl'}>Polimoney</Heading>
        </Link>
        {pathname !== '/' && (
          <HStack
            fontSize={'sm'}
            fontWeight={'bold'}
            gap={8}
            display={{ base: 'none', lg: 'flex' }}
          >
            <Link href={'#summary'}>収支の流れ</Link>
            <Link href={'#income'}>収入の一覧</Link>
            <Link href={'#expense'}>支出の一覧</Link>
            <SNSSharePanel className="mr-4" />
          </HStack>
        )}
      </HStack>
      <Text fontSize={'xs'} textAlign={'center'} my={6}>
        政治資金の流れを見える化するプラットフォームです。透明性の高い政治実現を目指して、オープンソースで開発されています。
      </Text>
    </Box>
  );
}
