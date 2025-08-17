import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import type { Account, Category, Transaction } from "../types";
import {
  todayISO,
  startOfMonthISO,
  endOfMonthISO,
  addDaysISO,
} from "../utils/date";

type DateRange = { start: string; end: string };

type Store = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[]; // already filtered by date on the server
  dateRange: DateRange;
  setDateRange: (r: DateRange) => void;
  setPreset: (p: "today" | "7d" | "month") => void;
  refreshAll: () => Promise<void>;
  accountById: Record<string, Account>;
  categoryById: Record<string, Category>;
  addTransaction: (t: NewTxn) => Promise<void>;
  addAccount: (a: NewAccount) => Promise<void>;
  addCategory: (c: NewCategory) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (t: EditTxn) => Promise<void>;
  updateAccount: (a: EditAccount) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateCategory: (c: EditCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
};

type NewAccount = {
  name: string;
  type: "credit" | "debit" | "cash";
  last4?: string;
  currency?: string;
};

type NewCategory = { name: string; color?: string };

type NewTxn = {
  accountId: string;
  categoryId: string;
  amountDollars: string;
  date: string; // 'YYYY-MM-DD'
  merchant?: string;
  notes?: string;
};

type EditTxn = NewTxn & { id: string };
type EditAccount = NewAccount & { id: string };
type EditCategory = NewCategory & { id: string };

type BudgetPeriod = { id: string; month: string; currency: string };
type BudgetAllocation = {
  id: string;
  period_id: string;
  category_id: string;
  planned_cents: number;
  rollover: boolean;
  is_sinking: boolean;
  carryover_cents: number;
};
type Income = {
  id: string;
  period_id: string;
  source: string;
  received_at: string; // 'YYYY-MM-DD'
  amount_cents: number;
  account_id?: string | null;
};

const mapTxn = (r: any) => ({
  id: r.id,
  accountId: r.account_id,
  categoryId: r.category_id,
  amountCents: r.amount_cents,
  currency: r.currency,
  date: r.date, // 'YYYY-MM-DD'
  merchant: r.merchant ?? undefined,
  notes: r.notes ?? undefined,
});

const Ctx = createContext<Store | null>(null);

export const StoreProvider = ({ children }: { children?: React.ReactNode }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTx] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonthISO(),
    end: endOfMonthISO(),
  });

  const accountById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts]
  );
  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );
  const [period, setPeriod] = useState<BudgetPeriod | null>(null);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  async function fetchAccounts() {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("name");
    if (error) throw error;
    setAccounts(data as Account[]);
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    setCategories(data as Category[]);
  }

  async function fetchTransactions() {
    const { start, end } = dateRange;
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id, account_id, category_id, amount_cents, currency, date, merchant, notes"
      )
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false });
    if (error) throw error;
    setTx((data ?? []).map(mapTxn));
  }

  async function ensurePeriodForMonth(monthISO: string) {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) throw new Error("Not signed in");

    // Call the helper function — or do a simple upsert if you prefer
    const { data, error } = await supabase.rpc("ensure_budget_period", {
      p_user: uid,
      p_month: monthISO,
    });
    if (error) throw error;

    const { data: p, error: e2 } = await supabase
      .from("budget_periods")
      .select("*")
      .eq("id", data)
      .single();
    if (e2) throw e2;
    setPeriod(p as BudgetPeriod);
  }

  async function fetchAllocations(periodId: string) {
    const { data, error } = await supabase
      .from("budget_allocations")
      .select("*")
      .eq("period_id", periodId)
      .order("category_id");
    if (error) throw error;
    setAllocations(data as BudgetAllocation[]);
  }

  async function fetchIncomes(periodId: string) {
    const { data, error } = await supabase
      .from("incomes")
      .select("*")
      .eq("period_id", periodId)
      .order("received_at");
    if (error) throw error;
    setIncomes(data as Income[]);
  }

  useEffect(() => {
    const m = dateRange.start.slice(0, 7) + "-01"; // first of month
    (async () => {
      await ensurePeriodForMonth(m);
    })().catch(console.error);
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    if (!period?.id) return;
    fetchAllocations(period.id).catch(console.error);
    fetchIncomes(period.id).catch(console.error);
  }, [period?.id]);

  async function setPlanned(categoryId: string, dollars: string) {
    if (!period) throw new Error("No budget period");
    const planned_cents = Math.round(parseFloat(dollars || "0") * 100);
    const { data, error } = await supabase
      .from("budget_allocations")
      .upsert(
        {
          period_id: period.id,
          category_id: categoryId,
          planned_cents,
        },
        { onConflict: "period_id,category_id" }
      )
      .select();
    if (error) throw error;
    await fetchAllocations(period.id);
  }

  async function addIncome(input: {
    source: string;
    date: string;
    amountDollars: string;
    accountId?: string;
  }) {
    if (!period) throw new Error("No budget period");
    const amount_cents = Math.round(
      parseFloat(input.amountDollars || "0") * 100
    );
    const { error } = await supabase.from("incomes").insert([
      {
        period_id: period.id,
        source: input.source.trim(),
        received_at: input.date,
        amount_cents,
        account_id: input.accountId ?? null,
      },
    ]);
    if (error) throw error;
    await fetchIncomes(period.id);
  }

  const spentByCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of transactions) {
      // your app stores outflows as negative cents; invert for "spent"
      const spent = t.amountCents < 0 ? -t.amountCents : 0;
      m.set(t.categoryId, (m.get(t.categoryId) ?? 0) + spent);
    }
    return m;
  }, [transactions]);

  const incomeTotal = incomes.reduce((s, i) => s + i.amount_cents, 0);
  const plannedTotal = allocations.reduce((s, a) => s + a.planned_cents, 0);
  const unassigned = incomeTotal - plannedTotal;

  const refreshAll = async () => {
    await Promise.all([fetchAccounts(), fetchCategories()]);
    await fetchTransactions();
  };

  useEffect(() => {
    refreshAll().catch(console.error);
  }, []);

  useEffect(() => {
    fetchTransactions().catch(console.error);
  }, [dateRange.start, dateRange.end]);

  const setPreset = (p: "today" | "7d" | "month") => {
    if (p === "today") {
      const t = todayISO();
      setDateRange({ start: t, end: t });
    } else if (p === "7d") {
      const end = todayISO();
      const start = addDaysISO(end, -6);
      setDateRange({ start, end });
    } else {
      setDateRange({ start: startOfMonthISO(), end: endOfMonthISO() });
    }
  };

  const addTransaction = async (t: NewTxn) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) throw new Error("Not signed in");

    const amount_cents = Math.round(parseFloat(t.amountDollars || "0") * 100);
    const currency = accountById[t.accountId]?.currency || "CAD";

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: uid,
        account_id: t.accountId,
        category_id: t.categoryId,
        amount_cents,
        currency,
        date: t.date, // already local YYYY-MM-DD
        merchant: t.merchant?.trim() || null,
        notes: t.notes?.trim() || null,
      },
    ]);

    if (error) throw error;
    await fetchTransactions(); // refresh current range
  };

  const addAccount = async (a: NewAccount) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) throw new Error("Not signed in");
    const { error } = await supabase.from("accounts").insert([
      {
        user_id: uid,
        name: a.name.trim(),
        type: a.type,
        last4: a.last4?.slice(-4) || null,
        currency: a.currency || "CAD",
      },
    ]);
    if (error) throw error;
    await fetchAccounts(); // refresh the list
  };

  const addCategory = async (c: NewCategory) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) throw new Error("Not signed in");
    const { error } = await supabase.from("categories").insert([
      {
        user_id: uid,
        name: c.name.trim(),
        color: c.color?.trim() || null,
      },
    ]);
    if (error) throw error;
    await fetchCategories();
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    await fetchTransactions();
  };

  const updateTransaction = async (t: EditTxn) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) throw new Error("Not signed in");

    const amount_cents = Math.round(parseFloat(t.amountDollars || "0") * 100);
    const currency = accountById[t.accountId]?.currency || "CAD";

    const { error } = await supabase.from("transactions").upsert(
      [
        {
          id: t.id, // <-- use PK so it updates instead of inserts
          user_id: uid, // <-- needed so RLS passes on upsert
          account_id: t.accountId,
          category_id: t.categoryId,
          amount_cents,
          currency,
          date: t.date,
          merchant: t.merchant?.trim() || null,
          notes: t.notes?.trim() || null,
        },
      ],
      { onConflict: "id" } // merge on the primary key
    );

    if (error) throw error;
    await fetchTransactions();
  };

  // --- Accounts ---
  const updateAccount = async (a: EditAccount) => {
    const { error } = await supabase
      .from("accounts")
      .update({
        name: a.name.trim(),
        type: a.type,
        last4: a.last4?.slice(-4) || null,
        currency: a.currency || "CAD",
      })
      .eq("id", a.id);

    if (error) throw error;
    await fetchAccounts(); // refresh list
    await fetchTransactions(); // in case currency/type affects views
  };

  const deleteAccount = async (id: string) => {
    // destructive: remove all transactions on this account
    const delTx = await supabase
      .from("transactions")
      .delete()
      .eq("account_id", id);
    if (delTx.error) throw delTx.error;

    const delAcct = await supabase.from("accounts").delete().eq("id", id);
    if (delAcct.error) throw delAcct.error;

    await refreshAll();
  };

  // --- Categories ---
  const updateCategory = async (c: EditCategory) => {
    const { error } = await supabase
      .from("categories")
      .update({
        name: c.name.trim(),
        color: c.color?.trim() || null,
      })
      .eq("id", c.id);

    if (error) throw error;
    await fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    // non-destructive: keep transactions, null the category
    const upd = await supabase
      .from("transactions")
      .update({ category_id: null })
      .eq("category_id", id);
    if (upd.error) throw upd.error;

    const del = await supabase.from("categories").delete().eq("id", id);
    if (del.error) throw del.error;

    await fetchCategories();
    await fetchTransactions();
  };

  const value = useMemo(
    () => ({
      accounts,
      categories,
      transactions,
      dateRange,
      setDateRange,
      setPreset,
      deleteTransaction,
      refreshAll,
      accountById,
      categoryById,
      addTransaction,
      updateTransaction,
      addAccount,
      addCategory,
      updateAccount,
      deleteAccount,
      updateCategory,
      deleteCategory,
      // Add these budget-related values:
      period,
      allocations,
      incomes,
      addIncome,
      setPlanned,
      spentByCategory,
      incomeTotal,
      plannedTotal,
      unassigned,
    }),
    [
      accounts,
      categories,
      transactions,
      dateRange,
      accountById,
      categoryById,
      // Add these dependencies:
      period,
      allocations,
      incomes,
      spentByCategory,
      incomeTotal,
      plannedTotal,
      unassigned,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useStore = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
