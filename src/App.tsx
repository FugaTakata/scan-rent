// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { ReactNode } from "react";

import { Box, Container, Group, MantineProvider, Text } from "@mantine/core";
import { AppShell } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { IconHomeRibbon } from "@tabler/icons-react";

import { HouseContainer } from "./House";
import { FormContainer } from "./Form";

export default function App() {
  return (
    <MantineProvider>
      <Notifications position="top-right" limit={2} />
      <AppLayout>
        <HouseContainer />
      </AppLayout>
    </MantineProvider>
  );
}

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell header={{ height: 60 }} footer={{ height: 190 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <IconHomeRibbon size={30} stroke={2} color="green" />
          <Text fw={600} size="md">
            scan-rent
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="md">{children}</Container>
      </AppShell.Main>

      <AppShell.Footer>
        <Box p="md">
          <FormContainer />
        </Box>
      </AppShell.Footer>
    </AppShell>
  );
}
