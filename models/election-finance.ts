export type ElectionFinanceTransaction = {
  date: string | null;
  price: number;
  category: string;
  purpose?: string;
  note?: string;
};

export type ElectionFinanceData = ElectionFinanceTransaction[];
