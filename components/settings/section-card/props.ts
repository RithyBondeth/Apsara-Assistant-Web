import { LucideIcon } from "lucide-react";

export interface ISectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind classes for the icon tile. */
  accent?: string;
  children: React.ReactNode;
}
