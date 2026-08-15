import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentResult({
  outcome,
  orderId,
}: {
  outcome: "success" | "cancelled";
  orderId?: string;
}) {
  const success = outcome === "success";
  const Icon = success ? CheckCircle2 : XCircle;

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
              {success ? "Payment submitted" : "Payment cancelled"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {success
                ? "The shop will confirm your payment after Stripe notifies it securely."
                : "You were not charged. Ask the shop for a new payment link when you are ready."}
            </p>
            {orderId && (
              <p className="text-xs text-muted-foreground">
                Order reference: {orderId}
              </p>
            )}
          </div>
          <Link className="text-sm font-medium text-primary hover:underline" href="/">
            Return to Apsara Assistant
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
