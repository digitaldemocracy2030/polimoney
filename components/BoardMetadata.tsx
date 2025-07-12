import { HStack, SimpleGrid, Text } from '@chakra-ui/react';
import { BoardContainer } from '@/components/BoardContainer';
import type { Report } from '@/models/type';

type Props = {
  report: Report;
};

export function BoardMetadata({ report }: Props) {
  return (
    <BoardContainer>
      <Text fontSize={'sm'} fontWeight={'bold'} mb={4}>
        本収支報告に関する情報開示
      </Text>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={2}>
        <HStack>
          <dt>データ引用元</dt>
          <dd>{report.year}年収支報告書</dd>
        </HStack>
        <HStack>
          <dt>政治団体の区分</dt>
          <dd>{report.orgType}</dd>
        </HStack>
        <HStack>
          <dt>政治団体の名称</dt>
          <dd>{report.orgName}</dd>
        </HStack>
        <HStack>
          <dt>活動区域の区分</dt>
          <dd>{report.activityArea}</dd>
        </HStack>
        <HStack>
          <dt>代表者</dt>
          <dd>{report.representative}</dd>
        </HStack>
        <HStack>
          <dt>資金管理団体の指定</dt>
          <dd>{report.fundManagementOrg}</dd>
        </HStack>
        <HStack>
          <dt>会計責任者</dt>
          <dd>{report.accountingManager}</dd>
        </HStack>
        <HStack>
          <dt>最終更新日</dt>
          <dd>{report.lastUpdate}</dd>
        </HStack>
        <HStack>
          <dt>事務担当者</dt>
          <dd>{report.administrativeManager}</dd>
        </HStack>
      </SimpleGrid>
    </BoardContainer>
  );
}
