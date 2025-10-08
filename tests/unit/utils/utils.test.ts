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
      const formatted = formatDate(date);
      expect(formatted).toMatch(/10/);
      expect(formatted).toMatch(/фев/i);
      expect(formatted).toMatch(/2024/);
    });

    it("formats ISO strings", () => {
      const formatted = formatDate("2023-08-01T00:00:00.000Z");
      expect(formatted).toMatch(/01/);
      expect(formatted).toMatch(/авг/i);
      expect(formatted).toMatch(/2023/);
    });

    it("returns empty string for nullish", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
    });
  });
});
