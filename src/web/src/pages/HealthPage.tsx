import { Center, Stack, Text, Badge, Title, Loader, Paper, Divider } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { ThemeSwitcher } from '../components/ThemeSwitcher'

export function HealthPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('/api/health')
      if (!res.ok) throw new Error('Unhealthy')
      return res.text()
    },
    retry: false,
  })

  return (
    <Center h="100vh">
      <Stack align="center" gap="md" w={400}>
        <Title order={1}>Gantry</Title>
        <Text c="dimmed" size="sm">API health check</Text>
        {isLoading && <Loader size="sm" />}
        {!isLoading && !isError && (
          <Badge color="green" size="lg">API reachable — {data}</Badge>
        )}
        {isError && (
          <Badge color="red" size="lg">API unreachable</Badge>
        )}
        <Divider w="100%" />
        <Paper p="md" w="100%" withBorder>
          <ThemeSwitcher />
        </Paper>
      </Stack>
    </Center>
  )
}
