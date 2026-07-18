export interface DateRange {
  start: Date;
  end: Date;
}

const months: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

export function getDateRange(message: string): DateRange | null {
  const text = message.toLowerCase();
  const now = new Date();

  // Hari ini
  if (text.includes("hari ini")) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Besok
  if (text.includes("besok")) {
    const start = new Date(now);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Minggu ini
  if (text.includes("minggu ini")) {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Minggu depan
  if (text.includes("minggu depan")) {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Bulan ini
  if (text.includes("bulan ini")) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Bulan depan
  if (text.includes("bulan depan")) {
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Nama bulan (Oktober, November, dst.)
  for (const [monthName, monthIndex] of Object.entries(months)) {
    if (text.includes(monthName)) {
      const yearMatch = text.match(/\b(20\d{2})\b/);

      const year = yearMatch ? Number(yearMatch[1]) : now.getFullYear();

      const start = new Date(year, monthIndex, 1);

      const end = new Date(year, monthIndex + 1, 0);

      end.setHours(23, 59, 59, 999);

      return { start, end };
    }
  }

  return null;
}
