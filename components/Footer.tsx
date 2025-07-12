'use client';

import { Text } from '@chakra-ui/react';
import Link from 'next/link';
import { BoardContainer } from '@/components/BoardContainer';

export function Footer() {
  return (
    <BoardContainer>
      <Text fontSize={'sm'} fontWeight={'bold'} mb={4}>
        Polimoney について
      </Text>
      <Text fontSize={'sm'}>
        このプロジェクトは、「デジタル民主主義2030」によって開発されたオープンソースプログラムです。
        デジタル技術を活用し、政治資金の透明化を実現することを目的としています。
        あわせて、市民の声を政策に反映させる仕組みづくりや、政治の透明性を高めるシステムの構築にも取り組んでいます。
        <Link href={'https://dd2030.org'} target={'_blank'}>
          <Text as={'span'} fontWeight={'bold'} className={'income'}>
            詳しくはこちら
          </Text>
        </Link>
      </Text>
    </BoardContainer>
  );
}
