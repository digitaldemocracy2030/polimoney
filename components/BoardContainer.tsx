import { Box } from '@chakra-ui/react';

type Props = {
  id?: string;
  children: React.ReactNode;
};

export function BoardContainer({ id, children }: Props) {
  return (
    <Box id={id} bgColor={'#ffffff'} borderRadius={'xl'} p={6} mb={4}>
      {children}
    </Box>
  );
}
