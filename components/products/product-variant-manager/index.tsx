"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { IProductVariant, IProductVariantUpdate } from "@/utils/interfaces/product/product.interface";

interface Props {
  productId: string;
  variants: IProductVariant[];
}

function parseOptions(value: string): Record<string, string> | null {
  const result: Record<string, string> = {};
  const entries = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (!entries.length || entries.length > 5) return null;
  for (const entry of entries) {
    const separator = entry.indexOf("=");
    if (separator < 1) return null;
    const name = entry.slice(0, separator).trim();
    const optionValue = entry.slice(separator + 1).trim();
    if (!name || !optionValue || result[name]) return null;
    result[name] = optionValue;
  }
  return result;
}

function optionsText(variant: IProductVariant) {
  return Object.entries(variant.option_values)
    .map(([name, value]) => `${name}=${value}`)
    .join(", ");
}

export default function ProductVariantManager({ productId, variants }: Props) {
  const { loading, error, createVariant, updateVariant, deleteVariant, clearError } =
    useProductsStore();
  const [adding, setAdding] = useState(false);
  const [options, setOptions] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [threshold, setThreshold] = useState(5);
  const [localError, setLocalError] = useState<string | null>(null);

  async function add() {
    const optionValues = parseOptions(options);
    if (!optionValues) {
      setLocalError("Use options like Color=Red, Size=M.");
      return;
    }
    const ok = await createVariant(productId, {
      option_values: optionValues,
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      price,
      stock,
      low_stock_threshold: threshold,
    });
    if (ok) {
      setAdding(false);
      setOptions("");
      setSku("");
      setBarcode("");
      setPrice(0);
      setStock(0);
      setThreshold(5);
      setLocalError(null);
    }
  }

  async function remove(variant: IProductVariant) {
    if (!confirm(`Delete ${variant.name}? Existing order history will be protected.`)) return;
    await deleteVariant(productId, variant.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Sellable variants</p>
          <p className="text-xs text-muted-foreground">Stock, price, SKU, and alerts are tracked separately.</p>
        </div>
        <Button type="button" size="sm" variant="outline" disabled={loading || variants.length >= 100} onClick={() => { clearError(); setAdding(true); }}>
          <Plus /> Add variant
        </Button>
      </div>

      <div className="space-y-3">
        {variants.map((variant) => (
          <VariantRow
            key={variant.id}
            productId={productId}
            variant={variant}
            canDelete={variants.length > 1}
            loading={loading}
            onDelete={() => remove(variant)}
            onSave={updateVariant}
          />
        ))}
      </div>

      {adding && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <Label htmlFor="new-variant-options">Options *</Label>
          <Input id="new-variant-options" placeholder="Color=Red, Size=M" value={options} onChange={(event) => setOptions(event.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input aria-label="New variant SKU" placeholder="SKU (optional)" value={sku} onChange={(event) => setSku(event.target.value)} />
            <Input aria-label="New variant barcode" placeholder="Barcode (optional)" value={barcode} onChange={(event) => setBarcode(event.target.value)} />
            <Input aria-label="New variant price" type="number" min="0" step="0.01" placeholder="Price" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
            <Input aria-label="New variant opening stock" type="number" min="0" placeholder="Opening stock" value={stock} onChange={(event) => setStock(Number(event.target.value))} />
            <Input aria-label="New variant threshold" type="number" min="0" placeholder="Low-stock threshold" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={loading} onClick={add}><Plus /> Create variant</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {(localError || error) && <p role="alert" className="text-sm text-destructive">{localError || error}</p>}
    </div>
  );
}

function VariantRow({
  productId,
  variant,
  canDelete,
  loading,
  onDelete,
  onSave,
}: {
  productId: string;
  variant: IProductVariant;
  canDelete: boolean;
  loading: boolean;
  onDelete: () => void;
  onSave: (id: string, variantId: string, data: IProductVariantUpdate) => Promise<boolean>;
}) {
  const [options, setOptions] = useState(optionsText(variant));
  const [sku, setSku] = useState(variant.sku ?? "");
  const [barcode, setBarcode] = useState(variant.barcode ?? "");
  const [price, setPrice] = useState(Number(variant.price));
  const [threshold, setThreshold] = useState(variant.low_stock_threshold);
  const [localError, setLocalError] = useState<string | null>(null);

  async function save() {
    const optionValues = variant.is_default && !options.trim() ? {} : parseOptions(options);
    if (!optionValues) {
      setLocalError("Use options like Color=Red, Size=M.");
      return;
    }
    const ok = await onSave(productId, variant.id, {
      option_values: optionValues,
      sku: sku.trim() || null,
      barcode: barcode.trim() || null,
      price,
      low_stock_threshold: threshold,
    });
    if (ok) setLocalError(null);
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium">{variant.name}</p>
          <p className="text-xs text-muted-foreground">{variant.stock} available · {variant.reserved_stock} reserved</p>
        </div>
        <div className="flex gap-1">
          <Button type="button" size="xs" variant="outline" disabled={loading} onClick={() => onSave(productId, variant.id, { is_active: !variant.is_active })}>
            {variant.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button type="button" size="icon-xs" variant="destructive" aria-label={`Delete ${variant.name}`} disabled={loading || !canDelete} onClick={onDelete}><Trash2 /></Button>
        </div>
      </div>
      <Input aria-label={`Options for ${variant.name}`} placeholder="Color=Red, Size=M" value={options} onChange={(event) => setOptions(event.target.value)} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Input aria-label={`SKU for ${variant.name}`} placeholder="SKU" value={sku} onChange={(event) => setSku(event.target.value)} />
        <Input aria-label={`Barcode for ${variant.name}`} placeholder="Barcode" value={barcode} onChange={(event) => setBarcode(event.target.value)} />
        <Input aria-label={`Price for ${variant.name}`} type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
        <Input aria-label={`Threshold for ${variant.name}`} type="number" min="0" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
      </div>
      <Button type="button" size="sm" variant="outline" disabled={loading} onClick={save}><Save /> Save variant</Button>
      {localError && <p role="alert" className="text-xs text-destructive">{localError}</p>}
    </div>
  );
}
