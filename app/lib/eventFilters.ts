export interface EventFilterState {
  tab: "upcoming" | "past";
  category: string;
  when: string;
  city: string;
  price: string;
  view: "list" | "grid";
}

export const CATEGORY_VALUES = [
  "all",
  "software",
  "hardware",
  "gaming",
  "music",
  "sports",
  "extra",
] as const;

export const WHEN_VALUES = ["all", "today", "week", "weekend", "month"] as const;
export const CITY_VALUES = ["all", "kathmandu", "lalitpur", "bhaktapur", "pokhara", "remote"] as const;
export const PRICE_VALUES = ["all", "free", "paid"] as const;
export const VIEW_VALUES = ["list", "grid"] as const;

export function readEventFilters(sp: URLSearchParams): EventFilterState {
  const cat = sp.get("cat");
  const when = sp.get("when");
  const city = sp.get("city");
  const price = sp.get("price");
  const view = sp.get("view");
  return {
    tab: sp.get("tab") === "past" ? "past" : "upcoming",
    category: (CATEGORY_VALUES as readonly string[]).includes(cat || "") ? (cat as string) : "all",
    when: (WHEN_VALUES as readonly string[]).includes(when || "") ? (when as string) : "all",
    city: (CITY_VALUES as readonly string[]).includes(city || "") ? (city as string) : "all",
    price: (PRICE_VALUES as readonly string[]).includes(price || "") ? (price as string) : "all",
    view: view === "list" ? "list" : "grid",
  };
}
