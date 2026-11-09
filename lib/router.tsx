"use client";

/**
 * Pequena camada sobre o roteador do Next que mantém a API usada pelas telas
 * (Link, Navigate, useNavigate, useParams, useSearchParams, matchPath).
 */
import { useCallback, useEffect, type ComponentProps } from "react";
import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & { to: string };

export const Link = ({ to, ...props }: LinkProps) => {
  return <NextLink href={to} {...props} />;
};

type NavigateOptions = {
  replace?: boolean;
};

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        if (to < 0) router.back();
        else router.forward();
        return;
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router],
  );
}

/** Redireciona assim que monta, sem deixar a tela atual no histórico. */
export const Navigate = ({ to }: { to: string; replace?: boolean }) => {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
};

export function useParams(): Record<string, string | undefined> {
  const params = useNextParams<Record<string, string | undefined>>();
  return params ?? {};
}

export function useLocation() {
  return { pathname: usePathname() ?? "/" };
}

type ParamsInit = Record<string, string>;

export function useSearchParams() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const params = useNextSearchParams();
  const setParams = useCallback(
    (next: ParamsInit, options?: NavigateOptions) => {
      const query = new URLSearchParams(next).toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (options?.replace) router.replace(url);
      else router.push(url);
    },
    [router, pathname],
  );
  return [params ?? new URLSearchParams(), setParams] as const;
}

/** Compara um padrão como "/treino/:id" com um caminho e devolve os parâmetros. */
export function matchPath(
  pattern: string,
  pathname: string,
): { params: Record<string, string> } | null {
  const clean = (s: string) => s.replace(/\/+$/, "").split("/");
  const want = clean(pattern);
  const have = clean(pathname);
  if (want.length !== have.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(":")) params[want[i].slice(1)] = have[i];
    else if (want[i] !== have[i]) return null;
  }
  return { params };
}
