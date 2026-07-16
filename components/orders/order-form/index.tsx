"use client";

import { useMemo } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/utils/functions/currency";
import { IProduct } from "@/utils/interfaces/product/product.interface";
import { IOrderFormProps, OrderFormValues } from "./props";

const schema = z.object({
  customer_id: z.string().min(1, "Choose a customer"),
  delivery_address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, "Choose a product"),
        quantity: z.number().int().min(1, "At least 1"),
      })
    )
    .min(1, "Add at least one item"),
});

const SELECT_CLASS =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

/**
 * Live total. Indicative only — the server re-prices every line from the
 * product's current price when the order is created.
 */
function OrderTotal({
  control,
  productMap,
}: {
  control: Control<OrderFormValues>;
  productMap: Record<string, IProduct>;
}) {
  const items = useWatch({ control, name: "items" });

  const total = (items ?? []).reduce((sum, item) => {
    const product = productMap[item?.product_id];
    if (!product) return sum;
    return sum + parseFloat(product.price) * (Number(item.quantity) || 0);
  }, 0);

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <span className="text-sm text-muted-foreground">Estimated total</span>
      <span className="text-lg font-semibold">{formatCurrency(total)}</span>
    </div>
  );
}

export default function OrderForm({
  customers,
  products,
  onSubmit,
  loading,
  submitLabel = "Create order",
}: IOrderFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: "",
      delivery_address: "",
      notes: "",
      items: [{ product_id: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Customer + Delivery ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="customer_id">Customer *</Label>
          <select
            id="customer_id"
            className={SELECT_CLASS}
            disabled={loading}
            {...register("customer_id")}
          >
            <option value="">— Select a customer —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.customer_id && (
            <p className="text-xs text-destructive">
              {errors.customer_id.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="delivery_address">Delivery address</Label>
          <Input
            id="delivery_address"
            placeholder="St. 271, Phnom Penh"
            disabled={loading}
            {...register("delivery_address")}
          />
        </div>
      </div>

      {/* ── Line Items ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Items *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => append({ product_id: "", quantity: 1 })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add item
          </Button>
        </div>

        {fields.map((field, index) => (
          <OrderLineItem
            key={field.id}
            index={index}
            control={control}
            register={register}
            products={products}
            productMap={productMap}
            loading={loading}
            removable={fields.length > 1}
            onRemove={() => remove(index)}
            error={errors.items?.[index]}
          />
        ))}

        {errors.items?.root && (
          <p className="text-xs text-destructive">{errors.items.root.message}</p>
        )}
      </div>

      {/* ── Notes ──────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Delivery instructions, payment details…"
          disabled={loading}
          {...register("notes")}
        />
      </div>

      <OrderTotal control={control} productMap={productMap} />

      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : submitLabel}
      </Button>
    </form>
  );
}

/* --------------------------------- Methods --------------------------------- */

function OrderLineItem({
  index,
  control,
  register,
  products,
  productMap,
  loading,
  removable,
  onRemove,
  error,
}: {
  index: number;
  control: Control<OrderFormValues>;
  register: ReturnType<typeof useForm<OrderFormValues>>["register"];
  products: IProduct[];
  productMap: Record<string, IProduct>;
  loading?: boolean;
  removable: boolean;
  onRemove: () => void;
  error?: { product_id?: { message?: string }; quantity?: { message?: string } };
}) {
  const line = useWatch({ control, name: `items.${index}` });
  const product = productMap[line?.product_id];
  const quantity = Number(line?.quantity) || 0;

  // The server rejects the whole order if any line exceeds stock, so flag it here.
  const overStock = product ? quantity > product.stock : false;

  return (
    <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_7rem_7rem_auto] sm:items-start">
      {/* ── Product ────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <select
          aria-label={`Product for item ${index + 1}`}
          className={SELECT_CLASS}
          disabled={loading}
          {...register(`items.${index}.product_id`)}
        >
          <option value="">— Select a product —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({formatCurrency(p.price)})
            </option>
          ))}
        </select>
        {error?.product_id && (
          <p className="text-xs text-destructive">{error.product_id.message}</p>
        )}
        {overStock && (
          <p className="text-xs text-destructive">
            Only {product?.stock} in stock
          </p>
        )}
      </div>

      {/* ── Quantity ───────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Input
          type="number"
          min="1"
          aria-label={`Quantity for item ${index + 1}`}
          disabled={loading}
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
        />
        {error?.quantity && (
          <p className="text-xs text-destructive">{error.quantity.message}</p>
        )}
      </div>

      {/* ── Subtotal ───────────────────────────────────────────── */}
      <div className="flex h-9 items-center text-sm font-medium tabular-nums">
        {product ? (
          formatCurrency(parseFloat(product.price) * quantity)
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove item ${index + 1}`}
        disabled={loading || !removable}
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
