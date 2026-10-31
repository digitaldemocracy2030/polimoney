import { Button, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { PageLayout } from '@/components/PageLayout';

export default function NotFound() {
  return (
    <PageLayout>
      <Stack align="center" py="xl">
        <Title order={1}>404</Title>
        <Title order={2} size="h4">
          ページが見つかりません
        </Title>
        <Text c="dimmed" ta="center">
          お探しのページは存在しません。
          <br />
          URLをご確認いただくか、トップページからお探しください。
        </Text>
        <Button component={Link} href="/">
          トップページへ戻る
        </Button>
      </Stack>
    </PageLayout>
  );
}
