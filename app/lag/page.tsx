import type { Metadata } from "next";
import TeamPage from "./TeamPage";

export const metadata: Metadata = {
  title: "Lag — Mattespelet",
};

export default function Page() {
  return <TeamPage />;
}
