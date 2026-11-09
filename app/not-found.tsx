"use client";

import { Navigate } from "../lib/router";

/* Endereço desconhecido volta para o início, como o app sempre fez. */
export default function NotFound() {
  return <Navigate to="/" />;
}
