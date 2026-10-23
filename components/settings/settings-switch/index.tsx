"use client";

/** A labelled checkbox row, the way every settings card presents an on/off. */
export default function SettingsSwitch({
  id,
  checked,
  onChange,
  label,
  help,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  help?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
    >
      <input
        id={id}
        className="mt-0.5 size-4 accent-primary"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block font-medium">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-muted-foreground">{help}</span>}
      </span>
    </label>
  );
}
