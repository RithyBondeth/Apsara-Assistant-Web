import type { Metadata } from "next";
import Link from "next/link";
import LegalProse from "@/components/legal/legal-prose";
import { CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from "@/utils/constants/legal.constant";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Apsara Assistant.",
};

export default function TermsPage() {
  return (
    <LegalProse title="Terms of Service" effective={LEGAL_EFFECTIVE_DATE}>
      <p>
        These terms apply to anyone who creates an Apsara Assistant account or works in one. By using
        Apsara you agree to them. If you use it for a business, you agree on that business&rsquo;s behalf.
      </p>

      <h2>The service</h2>
      <p>
        Apsara answers your customers on the Facebook Pages and Telegram bots you connect, using the
        products and shop information you provide, and helps you manage orders, stock and payments.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give accurate details and keep your password private. You are responsible for what happens in your account, including what your staff do.</li>
        <li>Only connect Pages, bots and payment accounts you are entitled to use.</li>
      </ul>

      <h2>Your customers and their data</h2>
      <ul>
        <li>You are responsible for having the right to message your customers and to process their information, and for answering their requests about it.</li>
        <li>You must follow the rules of Meta, Telegram and any payment provider you connect.</li>
      </ul>

      <h2>The AI assistant</h2>
      <p>
        Replies are written by an AI model from the information you give it. It can make mistakes. Keep
        your catalogue and shop information accurate, and check conversations it hands to you. Apsara
        never confirms an order or a payment on its own — those remain your decision.
      </p>

      <h2>Payments</h2>
      <p>
        Money your customers pay — by bank transfer, KHQR or card — moves between them and you, through
        your own bank or payment provider. Apsara does not hold or receive those funds, and payment
        disputes are between you, your customer and that provider. Fees for Apsara itself, if any, are
        those shown on our pricing page when you choose a plan.
      </p>

      <h2>Acceptable use</h2>
      <p>Do not use Apsara to send spam, sell illegal goods, deceive customers, or interfere with the service or other shops.</p>

      <h2>Ending</h2>
      <p>
        You can delete your account at any time from Settings; that deletes your shop&rsquo;s data, as
        described in our <Link href="/privacy">Privacy Policy</Link>. We may suspend or close accounts that
        break these terms.
      </p>

      <h2>Liability</h2>
      <p>
        Apsara is provided as it is. To the extent the law allows, we are not liable for indirect losses,
        lost sales, or what the AI assistant says, and our total liability is limited to what you paid us
        in the three months before the claim.
      </p>

      <h2>Law and changes</h2>
      <p>
        These terms are governed by the laws of the Kingdom of Cambodia. We will update the date above
        when they change and tell you of significant changes. Questions:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalProse>
  );
}
