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
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";

import { IconArrowBackUp, IconDownload, IconChess, IconNetwork, IconTrophy, IconUser } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import GenericCard from "../common/GenericCard";
import { UnixToNormalTime, GetRoundPgn } from "@/utils/lichess/api";
import { DatabaseInfo, getDatabase, getDatabases } from "@/utils/db";
import GameTable from "../databases/GameTable";
import PlayerTable from "../databases/PlayerTable";
import TournamentTable from "../databases/TournamentTable";
import useSWR from "swr";
import { invoke, unwrap } from "@/utils/invoke";
import { commands } from "@/bindings";

export default function BroadcastRoundPage() {

  const [broadcast, setBroadcast] = useAtom(selectedBroadcastAtom);
  const [round, setStorageSelected] = useAtom(selectedBroadcastRoundAtom);

  const {
    data: database,
    error,
    isLoading,
    mutate,
  } = useSWR(`broadcastRound${round!.id}Png`, async () => {
    const path = await GetRoundPgn(round!.id);
    const dbPath = path.replace(".pgn", ".db3");
    console.log(123);
    unwrap(
      await commands.convertPgn(path, dbPath, null, `${broadcast!.tour.name} | ${round!.name}`, broadcast!.tour.description, true),
    );
    return await getDatabase(dbPath);
  });


  const navigate = useNavigate();

  return (
    <Box p="sm" h="100%">
      {round && (
        <Stack h="100%" style={{ overflow: "hidden" }}>
          <Group align="center">
            <ActionIcon variant="default" onClick={() => {
              navigate({
                to: "/broadcasts/$broadcastId/",
                params: { broadcastId: broadcast!.tour.id || "" },
              });
            }}>
              <IconArrowBackUp size="1rem" />
            </ActionIcon>
            <Title>{`${broadcast!.tour.name} | ${round.name}`}</Title>
            <ActionIcon variant="default" onClick={() => {
              mutate();
              //window.location.reload();
            }}>
              <IconDownload size="1rem" />
            </ActionIcon>
          </Group>
          {isLoading && (
            <>
              <Skeleton h="8rem" />
              <Skeleton h="8rem" />
              <Skeleton h="8rem" />
            </>
          )}
          {!isLoading && (
            <Tabs
              defaultValue="games"
              flex={1}
              style={{
                display: "flex",
                overflow: "hidden",
                flexDirection: "column",
              }}
            >
              <Tabs.List>
                <Tabs.Tab leftSection={<IconChess size="1rem" />} value="games">
                  Games
                </Tabs.Tab>
                <Tabs.Tab leftSection={<IconUser size="1rem" />} value="players">
                  Players
                </Tabs.Tab>
                <Tabs.Tab
                  leftSection={<IconTrophy size="1rem" />}
                  value="tournaments"
                >
                  Tournaments
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel
                value="games"
                flex={1}
                style={{ overflow: "hidden" }}
                pt="md"
              >
                <GameTable database={database!} />
              </Tabs.Panel>
              <Tabs.Panel
                value="players"
                flex={1}
                style={{ overflow: "hidden" }}
                pt="md"
              >
                <PlayerTable database={database!} />
              </Tabs.Panel>
              <Tabs.Panel
                value="tournaments"
                flex={1}
                style={{ overflow: "hidden" }}
                pt="md"
              >
                <TournamentTable database={database!} />
              </Tabs.Panel>
            </Tabs>)}
        </Stack>
      )}
    </Box>
  );
}
