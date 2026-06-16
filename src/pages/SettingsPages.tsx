import { Check, Copy, Edit3, GripHorizontal, Plus, X } from "lucide-react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { currencyOptions } from "../lib/subscriptions";
import type { CurrencyCode } from "../lib/subscriptions";
import { usePreferences } from "../i18n";
import type { LanguageCode, ThemePreference } from "../i18n";
import { getOrderedAccountMethodOptions, loadAccountStore, saveAccountMethodOrder, saveAccountStore } from "../lib/accountStore";
import type { AccountEntry, AccountStore } from "../lib/accountStore";
import { currencyDisplayLabel, exchangeRateDate, formatExchangeAmount, formatMoneyFromCny } from "../lib/format";
import { aiPricingData, aiPricingUpdatedAt } from "../lib/aiPricing";
import type { AiPricingPlatform } from "../lib/aiPricing";
import { CurrencyLabel, FlagIcon, PaymentIcon } from "../components/icons";
import { ExchangeCurrencySelect } from "../components/selects";
import { cn } from "../lib/utils";

export type SettingsTab = "basic" | "accounts" | "exchange" | "aiPricing";

export function SettingsPage({ activeTab }: { activeTab: SettingsTab }) {
  if (activeTab === "exchange") return <ExchangeSettings />;
  if (activeTab === "accounts") return <AccountSettings />;
  if (activeTab === "aiPricing") return <AiPricingSettings />;
  return <BasicSettings />;
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-h-12 grid-cols-[140px_1fr] items-center gap-4 border-b border-border last:border-b-0">
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="flex justify-end">{children}</div>
    </div>
  );
}

function BasicSettings() {
  const { language, setLanguage, theme, setTheme, displayCurrency, setDisplayCurrency, t } = usePreferences();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  function resetAllData() {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <Card className="gap-0 px-5">
      <FieldRow label={t("settings.language")}>
        <ToggleGroup
          type="single"
          value={language}
          onValueChange={(value) => {
            if (value) setLanguage(value as LanguageCode);
          }}
          variant="outline"
          size="sm"
          spacing={0}
        >
          <ToggleGroupItem className="w-20 data-[state=on]:bg-zinc-200 data-[state=on]:text-zinc-950 dark:data-[state=on]:bg-white dark:data-[state=on]:text-zinc-950" value="zh">
            {t("settings.language.zh")}
          </ToggleGroupItem>
          <ToggleGroupItem className="w-20 data-[state=on]:bg-zinc-200 data-[state=on]:text-zinc-950 dark:data-[state=on]:bg-white dark:data-[state=on]:text-zinc-950" value="en">
            {t("settings.language.en")}
          </ToggleGroupItem>
        </ToggleGroup>
      </FieldRow>
      <FieldRow label={t("settings.theme")}>
        <ToggleGroup
          type="single"
          value={theme}
          onValueChange={(value) => {
            if (value) setTheme(value as ThemePreference);
          }}
          variant="outline"
          size="sm"
          spacing={0}
        >
          <ToggleGroupItem className="w-20 data-[state=on]:bg-zinc-200 data-[state=on]:text-zinc-950 dark:data-[state=on]:bg-white dark:data-[state=on]:text-zinc-950" value="system">
            {t("settings.theme.system")}
          </ToggleGroupItem>
          <ToggleGroupItem className="w-16 data-[state=on]:bg-zinc-200 data-[state=on]:text-zinc-950 dark:data-[state=on]:bg-white dark:data-[state=on]:text-zinc-950" value="light">
            {t("settings.theme.light")}
          </ToggleGroupItem>
          <ToggleGroupItem className="w-16 data-[state=on]:bg-zinc-200 data-[state=on]:text-zinc-950 dark:data-[state=on]:bg-white dark:data-[state=on]:text-zinc-950" value="dark">
            {t("settings.theme.dark")}
          </ToggleGroupItem>
        </ToggleGroup>
      </FieldRow>
      <FieldRow label={t("settings.displayCurrency")}>
        <ExchangeCurrencySelect className="w-36" variant="boxed" value={displayCurrency} onValueChange={setDisplayCurrency} />
      </FieldRow>
      <FieldRow label={t("settings.resetData")}>
        <Button variant="destructive" size="sm" onClick={() => setIsResetConfirmOpen(true)}>
          {t("settings.resetData.button")}
        </Button>
      </FieldRow>
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-lg border border-border bg-background p-5 shadow-lg">
            <div className="text-sm font-semibold">{t("settings.resetData.confirmTitle")}</div>
            <div className="mt-2 text-xs text-muted-foreground">{t("settings.resetData.confirmBody")}</div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
                {t("settings.resetData.cancel")}
              </Button>
              <Button variant="destructive" size="sm" onClick={resetAllData}>
                {t("settings.resetData.confirmButton")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function ExchangeSettings() {
  const { t } = usePreferences();
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>("CNY");
  const [baseAmount, setBaseAmount] = useState("100");
  const amount = Number(baseAmount) || 0;
  const baseRate = currencyOptions.find((currency) => currency.value === baseCurrency)?.unitPerCny ?? 1;

  function convertedAmount(target: CurrencyCode) {
    const targetRate = currencyOptions.find((currency) => currency.value === target)?.unitPerCny ?? 1;
    return (amount / baseRate) * targetRate;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{t("exchange.baseCurrency")}</div>
            <div className="mt-1 text-xs text-muted-foreground">{t("exchange.rateDate")} {exchangeRateDate}</div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              className="w-20 text-right"
              inputMode="decimal"
              value={baseAmount}
              onChange={(event) => setBaseAmount(parseDecimalTextInput(event.target.value))}
            />
            <ExchangeCurrencySelect className="w-36" variant="boxed" value={baseCurrency} onValueChange={setBaseCurrency} />
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("exchange.currency")}</TableHead>
              <TableHead className="text-right">{t("exchange.amount")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencyOptions
              .filter((currency) => currency.value !== baseCurrency)
              .map((currency) => (
                <TableRow key={currency.value}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FlagIcon countryCode={currency.countryCode} />
                      <CurrencyLabel label={currencyDisplayLabel(currency, t)} code={currency.value} className="font-medium" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatExchangeAmount(convertedAmount(currency.value))}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

const aiPricingPlatformLabels: Record<AiPricingPlatform, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
};

type AiTabGeom = { w: number; h: number; tabTop: number; tabBottom: number; tabLeft: number; tabWidth: number };

// Build a single continuous outline for the whole panel *including* the active
// tab "bump", so the tab and content card are one shape (no two-element seam).
// Concave "ears" connect the tab sides to the panel top edge, Chrome-tab style.
function buildAiTabPath(g: AiTabGeom): string {
  const ear = 10; // ear (cove) radius
  const rt = 9; // tab top corner radius
  const rc = 14; // panel corner radius
  const w = Math.round(g.w);
  const h = Math.round(g.h);
  const pTop = Math.round(g.tabBottom); // panel top edge = active tab bottom
  const aL = Math.round(g.tabLeft);
  const aR = Math.round(g.tabLeft + g.tabWidth);
  const L = 0.5;
  const R = w - 0.5;
  const B = h - 0.5;
  const T = Math.round(g.tabTop) + 0.5; // tab top edge
  const hasLeftEar = aL > L + ear + 1;
  const hasRightEar = aR < R - ear - 1;

  const d: string[] = [];
  d.push(`M ${L} ${pTop}`);
  if (hasLeftEar) {
    d.push(`L ${aL - ear} ${pTop}`);
    d.push(`A ${ear} ${ear} 0 0 0 ${aL} ${pTop - ear}`); // concave ear up
    d.push(`L ${aL} ${T + rt}`);
    d.push(`A ${rt} ${rt} 0 0 1 ${aL + rt} ${T}`); // tab top-left
  } else {
    d.push(`L ${L} ${T + rt}`);
    d.push(`A ${rt} ${rt} 0 0 1 ${L + rt} ${T}`);
  }
  const topRight = hasRightEar ? aR : R;
  d.push(`L ${topRight - rt} ${T}`);
  d.push(`A ${rt} ${rt} 0 0 1 ${topRight} ${T + rt}`); // tab top-right
  if (hasRightEar) {
    d.push(`L ${aR} ${pTop - ear}`);
    d.push(`A ${ear} ${ear} 0 0 0 ${aR + ear} ${pTop}`); // concave ear down
    d.push(`L ${R} ${pTop}`);
  }
  d.push(`L ${R} ${B - rc}`);
  d.push(`A ${rc} ${rc} 0 0 1 ${R - rc} ${B}`); // bottom-right
  d.push(`L ${L + rc} ${B}`);
  d.push(`A ${rc} ${rc} 0 0 1 ${L} ${B - rc}`); // bottom-left
  d.push(`L ${L} ${pTop}`);
  d.push("Z");
  return d.join(" ");
}

function AiPricingSettings() {
  const { language, displayCurrency, t } = usePreferences();
  const [platform, setPlatform] = useState<AiPricingPlatform>("chatgpt");
  const [planIndexByPlatform, setPlanIndexByPlatform] = useState<Record<AiPricingPlatform, number>>({
    chatgpt: 0,
    claude: 0,
    gemini: 0,
  });
  const plans = aiPricingData[platform];
  const planIndex = Math.min(planIndexByPlatform[platform], plans.length - 1);
  const plan = plans[planIndex];

  const planButtonRefs = useRef<(HTMLElement | null)[]>([]);
  const [planButtonWidth, setPlanButtonWidth] = useState<number>();

  useLayoutEffect(() => {
    setPlanButtonWidth(undefined);
    const frame = requestAnimationFrame(() => {
      const widths = planButtonRefs.current.filter((el): el is HTMLElement => el != null).map((el) => el.getBoundingClientRect().width);
      if (widths.length) setPlanButtonWidth(Math.max(...widths));
    });
    return () => cancelAnimationFrame(frame);
  }, [platform, language]);

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<AiPricingPlatform, HTMLButtonElement | null>>({ chatgpt: null, claude: null, gemini: null });
  const [tabPath, setTabPath] = useState("");
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      const tab = tabRefs.current[platform];
      if (!container || !tab) return;
      const cb = container.getBoundingClientRect();
      const tb = tab.getBoundingClientRect();
      setSvgSize({ w: cb.width, h: cb.height });
      setTabPath(
        buildAiTabPath({
          w: cb.width,
          h: cb.height,
          tabTop: tb.top - cb.top,
          tabBottom: tb.bottom - cb.top,
          tabLeft: tb.left - cb.left,
          tabWidth: tb.width,
        }),
      );
    };
    compute();
    const observer = new ResizeObserver(compute);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [platform, language]);

  return (
    <div ref={containerRef} className="relative h-full">
      <svg
        className="pointer-events-none absolute inset-0"
        width={svgSize.w}
        height={svgSize.h}
        viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
        fill="none"
        aria-hidden
      >
        <path d={tabPath} fill="var(--card)" stroke="var(--border)" strokeWidth={1} />
      </svg>

      <div className="relative flex h-full flex-col">
        <div className="flex items-end justify-between gap-3 pr-3">
          <div className="flex gap-5">
            {(Object.keys(aiPricingData) as AiPricingPlatform[]).map((value) => (
              <button
                key={value}
                ref={(el) => {
                  tabRefs.current[value] = el;
                }}
                type="button"
                onClick={() => setPlatform(value)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold transition-colors",
                  platform === value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {aiPricingPlatformLabels[value]}
              </button>
            ))}
          </div>
          <div className="pb-1.5 text-xs text-muted-foreground">{t("aiPricing.updatedAt")} {aiPricingUpdatedAt}</div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          <ToggleGroup
          type="single"
          value={String(planIndex)}
          onValueChange={(value) => {
            if (value) setPlanIndexByPlatform((prev) => ({ ...prev, [platform]: Number(value) }));
          }}
          variant="outline"
          size="sm"
          spacing={0}
          className="flex-wrap justify-start"
        >
          {plans.map((p, index) => (
            <ToggleGroupItem
              key={p.nameEn}
              ref={(el) => {
                planButtonRefs.current[index] = el;
              }}
              style={planButtonWidth ? { width: planButtonWidth } : undefined}
              className="settings-segment-button -mt-px -ml-px h-7 rounded-none border! border-border! px-3 data-[state=on]:bg-zinc-200 data-[state=on]:text-zinc-950 dark:data-[state=on]:bg-white dark:data-[state=on]:text-zinc-950"
              value={String(index)}
            >
              {language === "en" ? p.nameEn : p.nameZh}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 tabular-nums">{t("aiPricing.rank")}</TableHead>
                <TableHead>{t("aiPricing.region")}</TableHead>
                <TableHead className="text-right">{t("aiPricing.original")}</TableHead>
                <TableHead className="text-right">{t("aiPricing.price")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.regions.map((region, index) => (
                <TableRow key={region.countryCode}>
                  <TableCell className="tabular-nums text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FlagIcon countryCode={region.countryCode} />
                      <span>{language === "en" ? region.countryEn : region.countryZh}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{region.original}</TableCell>
                  <TableCell className="text-right font-semibold">{formatMoneyFromCny(region.priceCny, displayCurrency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </div>
      </div>
    </div>
  );
}

function parseDecimalTextInput(value: string) {
  return value
    .replace(/。/g, ".")
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1")
    .replace(/^(\d*\.?\d{0,2}).*$/, "$1");
}

function AccountSettings() {
  const { t } = usePreferences();
  const [store, setStore] = useState<AccountStore>(loadAccountStore);
  const [addingMethod, setAddingMethod] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");
  const [addNote, setAddNote] = useState("");
  const [editingKey, setEditingKey] = useState<{ method: string; index: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editNote, setEditNote] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [orderedMethods, setOrderedMethods] = useState(getOrderedAccountMethodOptions);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragIndexRef = useRef<number | null>(null);
  const orderRef = useRef(orderedMethods);
  orderRef.current = orderedMethods;

  const allMethods = orderedMethods;
  const noNoteLabel = t("account.noNote");
  const notePlaceholder = t("account.notePlaceholder");

  function handleDragHandlePointerDown(index: number, event: ReactPointerEvent) {
    event.preventDefault();
    window.getSelection()?.removeAllRanges();
    dragIndexRef.current = index;
    setDragIndex(index);
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    function handlePointerMove(event: PointerEvent) {
      const dragIdx = dragIndexRef.current;
      if (dragIdx === null) return;
      for (let i = 0; i < cardRefs.current.length; i++) {
        if (i === dragIdx) continue;
        const el = cardRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const crossedUp = i < dragIdx && event.clientY < midpoint;
        const crossedDown = i > dragIdx && event.clientY > midpoint;
        if (crossedUp || crossedDown) {
          setOrderedMethods((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragIdx, 1);
            next.splice(i, 0, moved);
            return next;
          });
          dragIndexRef.current = i;
          setDragIndex(i);
          break;
        }
      }
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      dragIndexRef.current = null;
      setDragIndex(null);
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      saveAccountMethodOrder(orderRef.current.map((method) => method.value));
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function isEnabled(method: string) {
    return store[method] !== undefined;
  }

  function toggleMethod(method: string) {
    setStore((prev) => {
      const next = { ...prev };
      if (next[method] !== undefined) {
        delete next[method];
      } else {
        next[method] = [];
      }
      saveAccountStore(next);
      return next;
    });
    setAddingMethod(null);
    setEditingKey(null);
  }

  function startAdding(method: string) {
    setEditingKey(null);
    setAddingMethod(method);
    setAddValue("");
    setAddNote("");
  }

  function cancelAdding() {
    setAddingMethod(null);
    setAddValue("");
    setAddNote("");
  }

  function addAccount(method: string) {
    const value = addValue.trim();
    if (!value) return;
    setStore((prev) => {
      const current = prev[method] ?? [];
      if (current.some((e) => e.value === value)) return prev;
      const next = { ...prev, [method]: [...current, { value, note: addNote.trim() }] };
      saveAccountStore(next);
      return next;
    });
    cancelAdding();
  }

  function startEditing(method: string, index: number, entry: AccountEntry) {
    setAddingMethod(null);
    setEditingKey({ method, index });
    setEditValue(entry.value);
    setEditNote(entry.note);
  }

  function cancelEditing() {
    setEditingKey(null);
  }

  function saveEdit(method: string, index: number) {
    const value = editValue.trim();
    if (!value) { cancelEditing(); return; }
    setStore((prev) => {
      const current = prev[method] ?? [];
      const next = current.map((e, i) => i === index ? { value, note: editNote.trim() } : e);
      const updated = { ...prev, [method]: next };
      saveAccountStore(updated);
      return updated;
    });
    cancelEditing();
  }

  function removeAccount(method: string, index: number) {
    setStore((prev) => {
      const next = { ...prev, [method]: (prev[method] ?? []).filter((_, i) => i !== index) };
      saveAccountStore(next);
      return next;
    });
  }

  function copyAccount(key: string, value: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      {allMethods.map((method, index) => {
        const enabled = isEnabled(method.value);
        const accounts = store[method.value] ?? [];
        const isAdding = addingMethod === method.value;

        return (
          <Card
            key={method.value}
            ref={(el) => { cardRefs.current[index] = el; }}
            className={cn(
              "gap-0 p-0 overflow-hidden transition-all",
              dragIndex === index && "opacity-60 scale-[1.02] shadow-lg border-2 border-blue-500 ring-2 ring-blue-500/40 z-10",
            )}
          >
            {/* Drag handle bar */}
            <div
              className={cn(
                "flex h-4 w-full shrink-0 touch-none items-center justify-center bg-muted text-muted-foreground/60",
                dragIndex !== null ? "cursor-grabbing" : "cursor-grab",
              )}
              onPointerDown={(event) => handleDragHandlePointerDown(index, event)}
            >
              <GripHorizontal className="h-3.5 w-3.5" />
            </div>

            {/* Method header */}
            <div className={cn("flex items-start justify-between px-4 pb-3 bg-muted", enabled && "border-b border-border")}>
              <div className="flex flex-1 items-center gap-2.5">
                <PaymentIcon path={method.iconPath} />
                <span className={cn("text-sm font-semibold", !enabled && "text-muted-foreground")}>
                  {t(`account.${method.value}`)}
                </span>
                {enabled && accounts.length > 0 && (
                  <span className="text-xs text-muted-foreground">{accounts.length}</span>
                )}
              </div>
              <div className="flex flex-1 items-center justify-end gap-2">
                {enabled && (
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
                    onClick={() => isAdding ? cancelAdding() : startAdding(method.value)}
                  >
                    {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </button>
                )}
                <Switch checked={enabled} onCheckedChange={() => toggleMethod(method.value)} />
              </div>
            </div>

            {/* Account rows */}
            {enabled && accounts.map((entry, idx) => {
              const isEditingThis = editingKey?.method === method.value && editingKey?.index === idx;
              const copyKey = `${method.value}-${idx}`;
              const isCopied = copiedKey === copyKey;
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5",
                    idx < accounts.length - 1 && "border-b border-border",
                  )}
                >
                  {isEditingThis ? (
                    <>
                      <Input
                        autoFocus
                        className="h-8 w-24 shrink-0 text-sm"
                        placeholder={notePlaceholder}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(method.value, idx);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <Input
                        className="h-8 flex-1 text-sm"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(method.value, idx);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <Button className="h-8 px-3 text-xs" size="sm" onClick={() => saveEdit(method.value, idx)}>
                        {t("common.save")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">
                        {entry.note.trim() || noNoteLabel}
                      </span>
                      <span className="flex-1 min-w-0 truncate text-sm text-foreground">{entry.value}</span>
                      <button
                        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition hover:bg-muted hover:text-foreground"
                        title={isCopied ? t("common.copied") : t("common.copy")}
                        onClick={() => copyAccount(copyKey, entry.value)}
                      >
                        {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <button
                        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition hover:bg-muted hover:text-foreground"
                        onClick={() => startEditing(method.value, idx, entry)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition hover:bg-muted hover:text-foreground"
                        onClick={() => removeAccount(method.value, idx)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}

            {/* Inline add input */}
            {enabled && isAdding && (
              <div className={cn("flex items-center gap-2 px-4 py-2.5", accounts.length > 0 && "border-t border-border")}>
                <Input
                  autoFocus
                  className="h-8 w-24 shrink-0 text-sm"
                  placeholder={notePlaceholder}
                  value={addNote}
                  onChange={(e) => setAddNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addAccount(method.value);
                    if (e.key === "Escape") cancelAdding();
                  }}
                />
                <Input
                  className="h-8 flex-1 text-sm"
                  placeholder={t("settings.account.addPlaceholder")}
                  value={addValue}
                  onChange={(e) => setAddValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addAccount(method.value);
                    if (e.key === "Escape") cancelAdding();
                  }}
                />
                <Button className="h-8 px-3 text-xs" size="sm" onClick={() => addAccount(method.value)}>
                  {t("settings.account.add")}
                </Button>
              </div>
            )}

            {/* Empty hint when enabled but no accounts */}
            {enabled && accounts.length === 0 && !isAdding && (
              <div className="px-4 py-2.5 text-xs text-muted-foreground">
                {t("settings.account.hint").split("，")[0]}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
