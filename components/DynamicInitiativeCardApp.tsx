"use client";

import dynamic from "next/dynamic";

const InitiativeCardApp = dynamic(
  () => import("@/components/InitiativeCardApp"),
  { ssr: false },
);

export default function DynamicInitiativeCardApp() {
  return <InitiativeCardApp />;
}
