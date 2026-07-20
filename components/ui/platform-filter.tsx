"use client";

import { PLATFORMS } from "@/utils/constants/platforms.constant";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";

interface IPlatformFilterProps {
  /** "" means no filter — every channel. */
  value: PlatformId | "";
  onChange: (value: PlatformId | "") => void;
  allLabel: string;
}

/**
 * Channel picker shared by the lists that can be filtered by platform.
 *
 * Options come from the shared PLATFORMS constant rather than a local array —
 * hardcoded platform lists are exactly what caused the "facebook" vs
 * "messenger" mismatch that silently duplicated customers.
 */
export default function PlatformFilter({
  value,
  onChange,
  allLabel,
}: IPlatformFilterProps) {
  return (
    <select
      value={value}
      aria-label={allLabel}
      onChange={(e) => onChange(e.target.value as PlatformId | "")}
      className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <option value="">{allLabel}</option>
      {PLATFORMS.map((platform) => (
        // Brand names are deliberately not translated.
        <option key={platform.id} value={platform.id}>
          {platform.name}
        </option>
      ))}
    </select>
  );
}
