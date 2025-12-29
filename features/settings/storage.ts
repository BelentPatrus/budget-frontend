export type SettingsData = {
  categories: string[];
  accounts: string[];
};

const KEY = "budgetapp.settings.v1";

export const DEFAULT_SETTINGS: SettingsData = {
  categories: ["Groceries", "Dining", "Gas", "Shopping", "Subscriptions", "Income", "Rent", "Other"],
  accounts: ["TD Chequing", "TD Visa", "Cash", "Savings"],
};

export function loadSettings(): SettingsData {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SettingsData>;

    const categories = Array.isArray(parsed.categories) ? parsed.categories.filter(Boolean) : DEFAULT_SETTINGS.categories;
    const accounts = Array.isArray(parsed.accounts) ? parsed.accounts.filter(Boolean) : DEFAULT_SETTINGS.accounts;

    return {
      categories: dedupeAndSort(categories),
      accounts: dedupeAndSort(accounts),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(data: SettingsData) {
  window.localStorage.setItem(
    KEY,
    JSON.stringify({
      categories: dedupeAndSort(data.categories),
      accounts: dedupeAndSort(data.accounts),
    })
  );
}

export function resetSettings() {
  window.localStorage.setItem(KEY, JSON.stringify(DEFAULT_SETTINGS));
}

export function dedupeAndSort(items: string[]) {
  return Array.from(new Set(items.map((s) => s.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
