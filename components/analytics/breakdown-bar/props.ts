export interface IBreakdownRow {
  label: string;
  value: number;
  /** Tailwind classes for the bar fill. */
  className?: string;
}

export interface IBreakdownBarProps {
  rows: IBreakdownRow[];
  emptyLabel: string;
}
