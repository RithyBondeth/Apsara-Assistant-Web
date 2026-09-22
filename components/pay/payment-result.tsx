"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

export default function PaymentResult({
  outcome,
  orderId,
}: {
  outcome: "success" | "cancelled";
  orderId?: string;
}) {
  const success = outcome === "success";
  const Icon = success ? CheckCircle2 : XCircle;
  const t = useAppT("pay");

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md text-center">
        <CardContent className="space-y-4 py-10">
          <Icon
            aria-hidden="true"
            className={`mx-auto h-12 w-12 ${success ? "text-green-600" : "text-muted-foreground"}`}
          />
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">
              {success ? t.successTitle : t.cancelledTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {success ? t.successBody : t.cancelledBody}
            </p>
            {orderId && (
              <p className="text-xs text-muted-foreground">
                {fmt(t.reference, { id: orderId })}
              </p>
            )}
          </div>
          <Link className="text-sm font-medium text-primary hover:underline" href="/">
            {t.return}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
