import { Alert, Box } from '@chakra-ui/react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { PreviewBoard } from '@/components/PreviewBoard';

export default function Page() {
  return (
    <Box>
      <Header />
      <PreviewAlert />
      <PreviewBoard />
      <Notice />
      <Footer />
    </Box>
  );
}

function PreviewAlert() {
  return (
    <>
      <Alert.Root status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>
            このページの内容は公開前のものです。URLを知っている人しかアクセスできません。
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </>
  );
}
