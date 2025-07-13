"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

import { useTRPC } from "@/trpc/client";

function Client() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.createAI.queryOptions({
      text: "john",
    }),
  );
  return <div>{data?.greeting}</div>;
}

export default Client;
