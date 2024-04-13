import BroadcastRoundsView from "@/components/broadcasts/BroadcastRoundsView";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/broadcasts/$broadcastId/")({
  component: BroadcastRoundsView,
});
