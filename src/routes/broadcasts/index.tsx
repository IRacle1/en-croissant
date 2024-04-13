import BroadcastPage from "@/components/broadcasts/BroadcastPage";
import { selectedDatabaseAtom } from "@/state/atoms";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";

export const Route = createFileRoute("/broadcasts/")({
  component: BroadcastPage,
  /*beforeLoad: async () => {
    const store = getDefaultStore();
    const db = store.get(selectedDatabaseAtom)?.title;
    if (db) {
      throw redirect({
        to: "/databases/$databaseId",
        params: { databaseId: db },
      });
    }
    return null;
  },*/
});
