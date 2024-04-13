import { selectedBroadcastAtom } from "@/state/atoms";
import {
  Box,
  Button,
  Divider,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconNetwork } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import useSWR from "swr";
import GenericCard from "../common/GenericCard";
import { GetBroadcasts, UnixToNormalTime } from "@/utils/lichess/api";

export default function BroadcastPage() {
  const {
    data: broadcasts,
    error,
    isLoading,
    mutate,
  } = useSWR("broadcasts", () => GetBroadcasts());

  const [selected, setSelected] = useState<string | null>(null);
  const selectedBroadcast = useMemo(
    () => (broadcasts ?? []).find((bc) => bc.tour.id === selected) ?? null,
    [broadcasts, selected],
  );
  const [, setStorageSelected] = useAtom(selectedBroadcastAtom);

  const navigate = useNavigate();

  return (
    <Stack h="100%">
      <Group align="baseline" pl="lg" py="sm">
        <Title>Current Broadcasts</Title>
      </Group>

      <Group
        grow
        flex={1}
        style={{ overflow: "hidden" }}
        align="start"
        px="md"
        pb="md"
      >
        <ScrollArea h="100%" offsetScrollbars>
          <SimpleGrid
            cols={{ base: 1, md: 1 }}
            spacing={{ base: "md", md: "sm" }}
          >
            {isLoading && (
              <>
                <Skeleton h="8rem" />
                <Skeleton h="8rem" />
                <Skeleton h="8rem" />
              </>
            )}
            {!isLoading && broadcasts?.map((item) => (
                <GenericCard
                  id={item.tour.id}
                  key={item.tour.id}
                  isSelected={selectedBroadcast?.tour?.id === item.tour.id}
                  setSelected={setSelected}
                  onDoubleClick={() => {
                    navigate({
                      to: "/broadcasts/$broadcastId/",
                      params: { broadcastId: item.tour.id || "" },
                    });
                    setStorageSelected(item);
                  }}
                  Header={
                    <Group wrap="nowrap" justify="space-between">
                      <Group wrap="nowrap" miw={0}>
                        <IconNetwork size="1.5rem" />
                        <Box miw={0}>
                          <Text fw={500}>{item.tour.name}</Text>
                          <Text
                            size="xs"
                            c="dimmed"
                            style={{ wordWrap: "break-word" }}
                          >
                            {item.tour.description}
                          </Text>
                        </Box>
                      </Group>
                    </Group>
                  }
                  stats={[
                    {
                      label: "Created at",
                      value: UnixToNormalTime(item.tour.createdAt).toLocaleDateString(),
                    },
                    {
                      label: "Tier",
                      value: item.tour.tier.toString(),
                    },
                    {
                      label: "Rounds",
                      value: item.rounds.length.toString(),
                    },
                  ]}
                />
              ))}
          </SimpleGrid>
        </ScrollArea>

        <Paper withBorder p="md" h="100%">
          {selectedBroadcast === null ? (
            <Text ta="center">No broadcast selected</Text>
          ) : (
            <ScrollArea h="100%" offsetScrollbars>
              <Stack>
                {(
                  <>
                    <Divider variant="dashed" label="General settings" />
                    <TextInput
                      label="Title"
                      value={selectedBroadcast.tour.name}
                      readOnly={true}
                    />
                    <Textarea
                      label="Description"
                      value={selectedBroadcast.tour.description}
                      readOnly={true}
                    />

                    <div>
                      <Button
                        component={Link}
                        to="/broadcasts/$broadcastId"
                        params={{ databaseId: selectedBroadcast.tour.id }}
                        onClick={() => setStorageSelected(selectedBroadcast)}
                        fullWidth
                        variant="default"
                        size="lg"
                        rightSection={<IconArrowRight size="1rem" />}
                      >
                        Explore
                      </Button>
                    </div>
                  </>
                )}
              </Stack>
            </ScrollArea>
          )}
        </Paper>
      </Group>
    </Stack>
  );
}