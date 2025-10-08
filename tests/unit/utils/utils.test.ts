import { cn, formatCurrency, formatDate } from "@/shared/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names and removes duplicates", () => {
      expect(cn("btn", false && "hidden", "btn", "active")).toBe("btn active");
    });
  });

  describe("formatCurrency", () => {
    it("formats numbers with ₽ and grouping", () => {
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
      }).format(125000);
      expect(formatCurrency(125000)).toBe(formatted);
    });

    it("returns fallback for undefined values", () => {
      expect(formatCurrency(undefined)).toBe("По договорённости");
    });

    it("keeps zero value", () => {
      expect(formatCurrency(0)).toBe("0\u00A0₽");
    });
  });

  describe("formatDate", () => {
    it("formats date instances", () => {
      const date = new Date("2024-02-10T12:00:00Z");
      expect(formatDate(date)).toMatch(/10\sфев\.?\s2024/i);
    });

    it("formats ISO strings", () => {
      expect(formatDate("2023-08-01T00:00:00.000Z")).toMatch(/01\sавг\.?\s2023/i);
    });

    it("returns empty string for nullish", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
    });
  });
});
