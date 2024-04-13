import { selectedBroadcastAtom, selectedBroadcastRoundAtom } from "@/state/atoms";
import {
  ActionIcon,
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

import { IconArrowBackUp, IconArrowRight, IconNetwork } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import GenericCard from "../common/GenericCard";
import { UnixToNormalTime } from "@/utils/lichess/api";

export default function BroadcastRoundsView() {
  const [selected, setSelected] = useState<string | null>(null);

  const [broadcast, setBroadcast] = useAtom(selectedBroadcastAtom);
  const [, setStorageSelected] = useAtom(selectedBroadcastRoundAtom);

  const navigate = useNavigate();

  return (
    <Stack h="100%">
      <Group align="baseline" pl="lg" py="sm">
        <Title>Rounds</Title>
        <Link onClick={() => setBroadcast(null)} to={"/broadcasts"}>
          <ActionIcon variant="default">
            <IconArrowBackUp size="1rem" />
          </ActionIcon>
        </Link>
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
            cols={{ base: 1, md: 3 }}
            spacing={{ base: "md", md: "sm" }}
          >
            {broadcast === null && (
              <>
                <Skeleton h="8rem" />
                <Skeleton h="8rem" />
                <Skeleton h="8rem" />
              </>
            )}
            {broadcast !== null && broadcast.rounds.sort((a, b) => a.startsAt - b.startsAt).map((item) => (
                <GenericCard
                  id={item.id}
                  key={item.id}
                  isSelected={item.ongoing}
                  setSelected={setSelected}
                  error={UnixToNormalTime(item.startsAt) >= new Date() ? " " : undefined}
                  onDoubleClick={() => {
                    navigate({
                      to: "/broadcasts/$broadcastId/$roundId/",
                      params: { broadcastId: broadcast.tour.id || "", roundId: item.id},
                    });
                    setStorageSelected(item);
                  }}
                  Header={
                    <Group wrap="nowrap" justify="space-between">
                      <Group wrap="nowrap" miw={0}>
                        <Box miw={0}>
                          <Text fw={500}>{item.name}</Text>
                        </Box>
                      </Group>
                    </Group>
                  }
                  stats={[
                    {
                      label: "Created at",
                      value: UnixToNormalTime(item.createdAt).toLocaleDateString(),
                    },
                    {
                      label: "Started at",
                      value: UnixToNormalTime(item.startsAt).toLocaleDateString(),
                    },
                    {
                      label: "Finished",
                      value: item.finished?.toString() ?? "false",
                    },
                  ]}
                />
              ))}
          </SimpleGrid>
        </ScrollArea>
      </Group>
    </Stack>
  );
}
