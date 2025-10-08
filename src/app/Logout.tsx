"use client";

import { Button } from "@/shared";
import { signOut } from "next-auth/react";

export function Logout() {
  return <Button onClick={() => signOut()}>Выйти</Button>;
}
