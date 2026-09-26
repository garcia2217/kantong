// A tiny, offline stand-in for the Telegram bot, used by the landing page demo.
// The real bot uses an LLM; this only needs to handle the obvious cases well
// enough that a visitor's first try works.

export interface DemoCategory {
  name: string;
  icon: string;
  type: "expense" | "income";
}

export interface DemoEntry {
  description: string;
  amount: number;
  wallet: string;
  category: DemoCategory;
}

const CATEGORY_KEYWORDS: ReadonlyArray<{ category: DemoCategory; words: readonly string[] }> = [
  {
    category: { name: "Salary", icon: "💰", type: "income" },
    words: ["gaji", "salary", "bonus", "thr", "payday", "freelance"],
  },
  {
    category: { name: "Dining Out", icon: "🍜", type: "expense" },
    words: [
      "makan", "kopi", "coffee", "lunch", "dinner", "breakfast", "sarapan", "nasi", "bakso",
      "mie", "boba", "snack", "jajan", "gofood", "grabfood", "starbucks", "mcd", "kfc", "martabak",
    ],
  },
  {
    category: { name: "Transport", icon: "🛵", type: "expense" },
    words: [
      "grab", "gojek", "ojek", "ojol", "bensin", "parkir", "tol", "busway", "krl", "mrt",
      "taxi", "taksi", "bus", "kereta", "train", "fuel", "gas",
    ],
  },
  {
    category: { name: "Groceries", icon: "🛒", type: "expense" },
    words: ["indomaret", "alfamart", "sayur", "belanja", "groceries", "supermarket", "pasar"],
  },
  {
    category: { name: "Bills", icon: "💡", type: "expense" },
    words: ["listrik", "pln", "pulsa", "internet", "wifi", "token", "pdam", "kos", "rent"],
  },
  {
    category: { name: "Entertainment", icon: "🎬", type: "expense" },
    words: ["netflix", "spotify", "bioskop", "cinema", "movie", "nonton", "game", "konser"],
  },
  {
    category: { name: "Shopping", icon: "🛍️", type: "expense" },
    words: ["shopee", "tokopedia", "baju", "sepatu", "clothes", "shoes", "skincare"],
  },
];

const OTHER_CATEGORY: DemoCategory = { name: "Other", icon: "🧾", type: "expense" };

const WALLET_NAMES: Record<string, string> = {
  gopay: "GoPay",
  ovo: "OVO",
  dana: "DANA",
  shopeepay: "ShopeePay",
  bca: "BCA",
  mandiri: "Mandiri",
  bri: "BRI",
  bni: "BNI",
  jago: "Jago",
  cash: "Cash",
  tunai: "Cash",
};

const MULTIPLIERS: Record<string, number> = {
  rb: 1_000,
  ribu: 1_000,
  k: 1_000,
  jt: 1_000_000,
  juta: 1_000_000,
};

const AMOUNT_PATTERN = /(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta)?(?![a-z])/i;
const WALLET_PATTERN = /\b(?:pake|pakai|via|dari|pay|with|using)\s+([a-z]+)/i;

function parseAmount(raw: string, suffix: string | undefined): number {
  if (suffix) {
    // "8,5jt" and "1.5jt" are decimals once a unit is attached.
    return Math.round(parseFloat(raw.replace(",", ".")) * MULTIPLIERS[suffix.toLowerCase()]);
  }
  const whole = parseInt(raw.replace(/[.,]/g, ""), 10);
  // "kopi 25" almost always means 25 thousand.
  return whole < 1_000 ? whole * 1_000 : whole;
}

function findCategory(text: string): DemoCategory {
  const words = new Set(text.toLowerCase().split(/[^a-z]+/));
  const match = CATEGORY_KEYWORDS.find(({ words: keywords }) =>
    keywords.some((word) => words.has(word)),
  );
  return match?.category ?? OTHER_CATEGORY;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Returns null when the message has no usable amount. */
export function parseDemoMessage(message: string): DemoEntry | null {
  const amountMatch = message.match(AMOUNT_PATTERN);
  if (!amountMatch) return null;

  const amount = parseAmount(amountMatch[1], amountMatch[2]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const walletMatch = message.match(WALLET_PATTERN);
  const wallet = (walletMatch && WALLET_NAMES[walletMatch[1].toLowerCase()]) ?? "Cash";

  const description = message
    .replace(amountMatch[0], "")
    .replace(walletMatch?.[0] ?? "", "")
    .replace(/\s+/g, " ")
    .trim();

  const category = findCategory(message);

  return {
    description: capitalize(description) || category.name,
    amount,
    wallet,
    category,
  };
}
