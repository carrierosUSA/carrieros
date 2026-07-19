"use client";

import {
  BadgeCheck,
  Boxes,
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  Layers,
  Package,
  Search,
  Sparkles,
  Truck,
  User,
  IdCard,
  UserRoundSearch,
  Users,
  Workflow,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { runAlphCommandAction } from "@/app/actions/alph";
import { searchCommandPaletteAction } from "@/app/actions/command-palette";
import {
  COMMAND_PALETTE_CATEGORY_LABELS,
  COMMAND_PALETTE_CATEGORY_ORDER,
  type CommandPaletteCategory,
  type CommandPaletteResult,
} from "@/lib/command-palette/types";
import { looksLikeAlphQuery } from "@/lib/alph/parser";
import { pushAlphHistory } from "@/lib/alph/history";
import type { AlphResult } from "@/lib/alph/types";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

type PaletteRow =
  | {
      kind: "alph";
      id: string;
      title: string;
      subtitle?: string;
      href: string;
      result: AlphResult;
    }
  | {
      kind: "search";
      id: string;
      title: string;
      subtitle?: string;
      href: string;
      category: CommandPaletteCategory;
    };

const CATEGORY_ICONS: Record<CommandPaletteCategory, ReactNode> = {
  advanced: <Layers className="h-4 w-4" strokeWidth={2} />,
  platform: <LayoutDashboard className="h-4 w-4" strokeWidth={2} />,
  loads: <Package className="h-4 w-4" strokeWidth={2} />,
  drivers: <User className="h-4 w-4" strokeWidth={2} />,
  workforce: <UserRoundSearch className="h-4 w-4" strokeWidth={2} />,
  wallet: <IdCard className="h-4 w-4" strokeWidth={2} />,
  network: <BadgeCheck className="h-4 w-4" strokeWidth={2} />,
  exchange: <Boxes className="h-4 w-4" strokeWidth={2} />,
  companies: <BriefcaseBusiness className="h-4 w-4" strokeWidth={2} />,
  brokers: <Building2 className="h-4 w-4" strokeWidth={2} />,
  customers: <Users className="h-4 w-4" strokeWidth={2} />,
  invoices: <FileText className="h-4 w-4" strokeWidth={2} />,
  trucks: <Truck className="h-4 w-4" strokeWidth={2} />,
  trailers: <Truck className="h-4 w-4" strokeWidth={2} />,
  documents: <FileText className="h-4 w-4" strokeWidth={2} />,
  workflows: <Workflow className="h-4 w-4" strokeWidth={2} />,
};

function groupSearchResults(results: CommandPaletteResult[]) {
  return COMMAND_PALETTE_CATEGORY_ORDER.map((category) => ({
    category,
    label: COMMAND_PALETTE_CATEGORY_LABELS[category],
    items: results.filter((result) => result.category === category),
  })).filter((group) => group.items.length > 0);
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function alphPrimaryHref(result: AlphResult): string {
  return (
    result.actions?.find((action) => action.primary)?.href ??
    result.href ??
    "/alph"
  );
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandPaletteResult[]>([]);
  const [alphResult, setAlphResult] = useState<AlphResult | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const alphMode = looksLikeAlphQuery(query);

  const groupedResults = useMemo(() => groupSearchResults(results), [results]);

  const flatRows = useMemo<PaletteRow[]>(() => {
    const rows: PaletteRow[] = [];

    if (alphResult && alphMode) {
      const href = alphPrimaryHref(alphResult);
      rows.push({
        kind: "alph",
        id: `alph-${alphResult.intent}`,
        title: alphResult.title,
        subtitle: alphResult.body?.split("\n")[0],
        href,
        result: alphResult,
      });

      for (const action of alphResult.actions ?? []) {
        if (action.href === href) {
          continue;
        }
        rows.push({
          kind: "alph",
          id: `alph-action-${action.label}`,
          title: action.label,
          subtitle: alphResult.title,
          href: action.href,
          result: alphResult,
        });
      }
    }

    for (const group of groupedResults) {
      for (const item of group.items) {
        rows.push({
          kind: "search",
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          href: item.href,
          category: item.category,
        });
      }
    }

    return rows;
  }, [alphMode, alphResult, groupedResults]);

  const handleClose = useCallback(() => {
    setQuery("");
    setResults([]);
    setAlphResult(null);
    setActiveIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      startTransition(async () => {
        const trimmed = query.trim();

        if (!trimmed) {
          setResults([]);
          setAlphResult(null);
          setActiveIndex(0);
          return;
        }

        if (looksLikeAlphQuery(trimmed)) {
          const [{ result }, nextResults] = await Promise.all([
            runAlphCommandAction(trimmed),
            searchCommandPaletteAction(trimmed),
          ]);
          setAlphResult(result);
          setResults(nextResults.slice(0, 8));
        } else {
          setAlphResult(null);
          const nextResults = await searchCommandPaletteAction(trimmed);
          setResults(nextResults);
        }

        setActiveIndex(0);
      });
    }, query ? 120 : 0);

    return () => window.clearTimeout(timeout);
  }, [open, query]);

  const navigateTo = useCallback(
    (href: string, options?: { alph?: AlphResult; queryText?: string }) => {
      if (options?.alph && options.queryText) {
        pushAlphHistory({
          text: options.queryText,
          resultTitle: options.alph.title,
        });
      }
      router.push(href);
      handleClose();
    },
    [handleClose, router],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) =>
          flatRows.length === 0 ? 0 : (index + 1) % flatRows.length,
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) =>
          flatRows.length === 0
            ? 0
            : (index - 1 + flatRows.length) % flatRows.length,
        );
        return;
      }

      if (event.key === "Enter" && flatRows[activeIndex]) {
        event.preventDefault();
        const row = flatRows[activeIndex];
        navigateTo(row.href, {
          alph: row.kind === "alph" ? row.result : undefined,
          queryText: query,
        });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, flatRows, handleClose, navigateTo, open, query]);

  useEffect(() => {
    const activeItem = listRef.current?.querySelector('[data-active="true"]');
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, flatRows]);

  if (!open || !isClient) {
    return null;
  }

  let renderIndex = -1;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-slate-900/25 px-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white shadow-2xl shadow-slate-400/20"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 border-b border-[#F1F5F9] px-4 py-3">
          {alphMode ? (
            <Sparkles className="h-5 w-5 shrink-0 text-[#2563EB]" strokeWidth={2} />
          ) : (
            <Search className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={2} />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              alphMode
                ? "Ask Alph… Show today’s loads"
                : "Search loads, drivers, brokers, trucks..."
            }
            className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
            autoComplete="off"
            spellCheck={false}
          />
          {alphMode ? (
            <span className="hidden rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#2563EB] sm:inline">
              Alph
            </span>
          ) : null}
          <kbd className="hidden rounded-md border border-[#EAEAEA] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-slate-500 sm:inline">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[min(420px,50vh)] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="px-3 py-8 text-center">
              <p className="text-[14px] font-medium text-slate-700">
                Search everything or ask Alph
              </p>
              <p className="mt-1 text-[13px] text-slate-500">
                Try &quot;Find Truck 105&quot;, &quot;Open John Smith&quot;, or
                &quot;Generate IFTA&quot;
              </p>
              <div className="mx-auto mt-4 flex max-w-sm flex-wrap justify-center gap-1.5">
                {[
                  "Show unpaid invoices",
                  "Show loads in Texas",
                  "Generate payroll",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuery(example)}
                    className="rounded-lg bg-[#F5F7FA] px-2.5 py-1 text-[12px] font-medium text-[#475569] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigateTo("/alph")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#F5F7FA] px-3 py-2 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
                Open Alph Command Center
              </button>
            </div>
          ) : isPending && flatRows.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-slate-500">
              {alphMode ? "Alph is thinking..." : "Searching..."}
            </p>
          ) : flatRows.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-slate-500">
              No results for &quot;{query}&quot;
            </p>
          ) : (
            <>
              {alphMode && alphResult ? (
                <div className="mb-2">
                  <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]">
                    Alph
                  </p>
                  <ul className="space-y-0.5">
                    {flatRows
                      .filter((row) => row.kind === "alph")
                      .map((item) => {
                        renderIndex += 1;
                        const index = renderIndex;
                        const isActive = index === activeIndex;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              data-active={isActive}
                              onClick={() =>
                                navigateTo(item.href, {
                                  alph: item.result,
                                  queryText: query,
                                })
                              }
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                isActive
                                  ? "bg-[#EFF6FF] text-[#1E3A8A]"
                                  : "text-slate-800 hover:bg-[#F8FAFC]"
                              }`}
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  isActive
                                    ? "bg-white text-[#2563EB]"
                                    : "bg-[#EFF6FF] text-[#2563EB]"
                                }`}
                              >
                                <Sparkles className="h-4 w-4" strokeWidth={2} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[14px] font-medium">
                                  {item.title}
                                </span>
                                {item.subtitle ? (
                                  <span className="block truncate text-[12px] text-slate-500">
                                    {item.subtitle}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ) : null}

              {groupedResults.map((group) => (
                <div key={group.category} className="mb-2 last:mb-0">
                  <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      renderIndex += 1;
                      const index = renderIndex;
                      const isActive = index === activeIndex;

                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            data-active={isActive}
                            onClick={() => navigateTo(item.href)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                              isActive
                                ? "bg-[#EFF6FF] text-[#1E3A8A]"
                                : "text-slate-800 hover:bg-[#F8FAFC]"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isActive
                                  ? "bg-white text-[#1E3A8A]"
                                  : "bg-[#F1F5F9] text-slate-600"
                              }`}
                            >
                              {CATEGORY_ICONS[item.category]}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-medium">
                                {item.title}
                              </span>
                              {item.subtitle ? (
                                <span className="block truncate text-[12px] text-slate-500">
                                  {item.subtitle}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#F1F5F9] px-4 py-2.5 text-[11px] text-slate-400">
          <span>
            {alphMode
              ? "Alph · natural language commands"
              : "Loads · Drivers · Brokers · Invoices · Trucks · Documents"}
          </span>
          <span className="hidden sm:inline">↑↓ navigate · ↵ open</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function useCommandPaletteShortcut(onOpen: () => void) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);
}
