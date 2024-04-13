import BroadcastRoundPage from "@/components/broadcasts/BroadcastRoundPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/broadcasts/$broadcastId/$roundId/")({
  component: BroadcastRoundPage,
});
