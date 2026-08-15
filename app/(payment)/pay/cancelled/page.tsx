import type { Metadata } from "next";
import PaymentResult from "@/components/pay/payment-result";

export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default async function PaymentCancelledPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { order } = await searchParams;
  return <PaymentResult outcome="cancelled" orderId={typeof order === "string" ? order : undefined} />;
}
