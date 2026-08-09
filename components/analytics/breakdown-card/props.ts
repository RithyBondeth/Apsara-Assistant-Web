export interface IBreakdownRow {
  /** Stable identity. Labels are not usable as keys — two deleted products
   *  resolve to the same text, and React then duplicates or drops rows. */
  key: string;
  label: string;
  value: number;
  /** Optional badge styling, so a status keeps the colour it has elsewhere. */
  badgeClass?: string;
}

export interface IBreakdownCardProps {
  title: string;
  rows: IBreakdownRow[];
  /** Shown after the number — "units", say. */
  unit?: string;
  empty: string;
  /** Only for lowercase enum labels like statuses and platforms. Product and
   *  customer names must not be touched: CSS capitalize would render
   *  "iPhone case" as "IPhone Case". */
  capitalizeLabels?: boolean;
}
