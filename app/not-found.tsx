import { Box, Button, Card, Heading, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';

export default function NotFound() {
  return (
    <Box>
      <Header />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="60vh"
        p={8}
      >
        <Card.Root maxW="md" textAlign="center" boxShadow="lg">
          <Card.Body>
            <Stack gap={6}>
              <Box>
                <Text fontSize="6xl" fontWeight="bold" color="red.500">
                  404
                </Text>
                <Heading size="lg" color="gray.700">
                  ページが見つかりません
                </Heading>
              </Box>
              <Text color="gray.600" fontSize="md">
                お探しのページは存在しません。
                <br />
                URLをご確認いただくか、トップページからお探しください。
              </Text>
              <Link href="/">
                <Button
                  colorPalette="blue"
                  size="lg"
                  width="full"
                  variant="solid"
                >
                  トップページへ戻る
                </Button>
              </Link>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Box>
      <Notice />
      <Footer />
    </Box>
  );
}
