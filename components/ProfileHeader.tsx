import { Avatar, Badge, Group, Stack, Text, Title } from '@mantine/core';
import type { ProfileList } from '@/models/type';

export function ProfileHeader({ profile }: { profile: ProfileList }) {
  const badges = [profile.party, profile.district].filter((v): v is string =>
    Boolean(v),
  );

  return (
    <Group wrap="nowrap">
      <Avatar src={profile.image} alt={profile.name} size="xl" />
      <Stack gap={0}>
        {profile.title && (
          <Text size="xs" c="dimmed">
            {profile.title}
          </Text>
        )}
        <Title order={2}>{profile.name}</Title>
        {badges.length > 0 && (
          <Group gap="xs" mt={4}>
            {badges.map((badge) => (
              <Badge key={badge} variant="light">
                {badge}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>
    </Group>
  );
}
