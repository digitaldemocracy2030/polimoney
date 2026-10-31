import { Anchor, Text } from '@mantine/core';
import { BoardContainer } from '@/components/BoardContainer';

export function Footer() {
  return (
    <BoardContainer>
      <Text size="sm" fw={700} mb="sm">
        Polimoney について
      </Text>
      <Text size="sm">
        このプロジェクトは、「デジタル民主主義2030」によって開発されたオープンソースプログラムです。
        デジタル技術を活用し、政治資金の透明化を実現することを目的としています。
        あわせて、市民の声を政策に反映させる仕組みづくりや、政治の透明性を高めるシステムの構築にも取り組んでいます。
        <Anchor href="https://dd2030.org" target="_blank" size="sm">
          詳しくはこちら
        </Anchor>
      </Text>
    </BoardContainer>
  );
}
