import { Alert } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { PreviewBoard } from './PreviewBoard';

export default function Page() {
  return (
    <PageLayout>
      <Alert color="yellow" mb="md">
        このページの内容は公開前のものです。URLを知っている人しかアクセスできません。
      </Alert>
      <PreviewBoard />
    </PageLayout>
  );
}
