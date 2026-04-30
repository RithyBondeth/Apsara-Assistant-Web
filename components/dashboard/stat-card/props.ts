import { ElementType } from "react";

export interface IStatCardProps {
  icon: ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconClassName?: string;
}
