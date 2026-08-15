import type { Metadata } from "next";
import PaymentResult from "@/components/pay/payment-result";

export const metadata: Metadata = { title: "Payment submitted", robots: { index: false } };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { order } = await searchParams;
  return <PaymentResult outcome="success" orderId={typeof order === "string" ? order : undefined} />;
}
