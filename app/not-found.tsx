"use client";

import { paths } from "@/lib/paths";
import { Navigate } from "@/lib/router";

/* Endereço desconhecido volta para o início do app, como ele sempre fez. */
export default function NotFound() {
  return <Navigate to={paths.home} />;
}
