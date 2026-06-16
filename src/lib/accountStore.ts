import { accountMethodOptions } from "../lib/subscriptions";
import type { AccountMethod } from "../lib/subscriptions";

export const accountStorageKey = "jiojio.accounts.v1";
export const accountMethodOrderStorageKey = "jiojio.accountMethodOrder.v1";

export type AccountEntry = { value: string; note: string };
export type AccountStore = Record<string, AccountEntry[]>;

// Methods added after the initial release should be enabled by default for existing users too.
const methodsEnabledByDefault = ["microsoft", "alipay", "douyin"];

export function loadAccountStore(): AccountStore {
  try {
    const raw = localStorage.getItem(accountStorageKey);
    if (!raw) {
      const defaults: AccountStore = {};
      for (const method of accountMethodOptions) {
        defaults[method.value] = [];
      }
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    // Migrate old string[] format to AccountEntry[], and old "gmail" key to "google"
    const result: AccountStore = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        const entries = value.map((item) =>
          typeof item === "string" ? { value: item, note: "" } : item
        );
        const targetKey = key === "gmail" ? "google" : key;
        result[targetKey] = [...(result[targetKey] ?? []), ...entries];
      }
    }
    for (const method of methodsEnabledByDefault) {
      if (result[method] === undefined) {
        result[method] = [];
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function saveAccountStore(store: AccountStore) {
  localStorage.setItem(accountStorageKey, JSON.stringify(store, null, 2));
}

export function loadAccountMethodOrder(): AccountMethod[] {
  const defaultOrder = accountMethodOptions.map((option) => option.value);
  try {
    const raw = localStorage.getItem(accountMethodOrderStorageKey);
    if (!raw) return defaultOrder;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultOrder;
    const stored = parsed.filter((value): value is AccountMethod => defaultOrder.includes(value));
    const missing = defaultOrder.filter((value) => !stored.includes(value));
    return [...stored, ...missing];
  } catch {
    return defaultOrder;
  }
}

export function saveAccountMethodOrder(order: AccountMethod[]) {
  localStorage.setItem(accountMethodOrderStorageKey, JSON.stringify(order));
}

export function getOrderedAccountMethodOptions(): typeof accountMethodOptions {
  const order = loadAccountMethodOrder();
  return order
    .map((value) => accountMethodOptions.find((option) => option.value === value))
    .filter((option): option is (typeof accountMethodOptions)[number] => option !== undefined);
}
