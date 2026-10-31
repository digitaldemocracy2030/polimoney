import { Paper } from '@mantine/core';

type Props = {
  id?: string;
  children: React.ReactNode;
};

export function BoardContainer({ id, children }: Props) {
  return (
    <Paper id={id} p="lg" mb="md">
      {children}
    </Paper>
  );
}
