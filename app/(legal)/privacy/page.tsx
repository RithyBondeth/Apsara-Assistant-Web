import type { Metadata } from "next";
import Link from "next/link";
import LegalProse from "@/components/legal/legal-prose";
import { CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from "@/utils/constants/legal.constant";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Apsara Assistant collects, why, who it is shared with, and how to have it deleted.",
};

export default function PrivacyPage() {
  return (
    <LegalProse title="Privacy Policy" effective={LEGAL_EFFECTIVE_DATE}>
      <p>
        Apsara Assistant (&ldquo;Apsara&rdquo;, &ldquo;we&rdquo;) is software that answers a shop&rsquo;s
        customers on Facebook Messenger and Telegram, and helps the shop manage its catalogue, orders and
        payments. This policy explains what we collect, why, who it goes to, and how to have it removed.
      </p>

      <h2>Two kinds of people</h2>
      <ul>
        <li>
          <strong>Sellers</strong> — shops that create an Apsara account, and the staff they add. For their
          account data, we decide how it is used.
        </li>
        <li>
          <strong>Customers</strong> — people who message a shop that uses Apsara. The shop decides how
          its customers&rsquo; information is used; we process it on the shop&rsquo;s behalf. Questions
          about a particular shop&rsquo;s use are best asked of that shop first.
        </li>
      </ul>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Seller accounts:</strong> name, business name, email, a hashed password, shop details
          the seller writes (address, hours, delivery and policies), settings, and the Telegram chat the
          seller links for alerts.
        </li>
        <li>
          <strong>Shop data:</strong> products, prices, stock, photos, payment QR codes, KHQR settings,
          orders, purchase orders, returns and suppliers.
        </li>
        <li>
          <strong>Customer conversations:</strong> the messages a customer sends a shop&rsquo;s connected
          Page or bot, the name and platform ID Messenger or Telegram provides, and photos, voice notes and
          files they send — including payment receipts.
        </li>
        <li>
          <strong>Connection credentials:</strong> access tokens for the seller&rsquo;s Page, bot and (if
          used) Stripe account and Bakong API, stored encrypted.
        </li>
        <li>
          <strong>Technical data:</strong> request logs with IP addresses, and records of failed sign-ins
          and sign-ups used to stop abuse.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To answer customers on the shop&rsquo;s behalf, using the shop&rsquo;s own catalogue and information.</li>
        <li>To record orders, check payment receipts and KHQR payments, and tell customers when their order changes.</li>
        <li>To alert sellers on Telegram or by email when a customer needs them.</li>
        <li>To keep accounts secure and the service running, and to investigate problems.</li>
      </ul>
      <p>We do not sell personal information, and we do not use it for advertising.</p>

      <h2>Who it is shared with</h2>
      <p>Only the services needed to do the above:</p>
      <ul>
        <li><strong>OpenAI</strong> — conversation text and catalogue to write replies; receipt images to read the amount paid.</li>
        <li><strong>Meta (Messenger) and Telegram</strong> — to receive and send the shop&rsquo;s messages.</li>
        <li><strong>Stripe</strong> — only when a shop takes card payments through its own Stripe account.</li>
        <li><strong>National Bank of Cambodia (Bakong)</strong> — the code of a KHQR payment, to check whether it was paid.</li>
        <li><strong>Hosting, storage and email providers</strong> that run the service on our behalf.</li>
      </ul>
      <p>We may also disclose information where the law requires it.</p>

      <h2>How long we keep it</h2>
      <p>
        For as long as the seller&rsquo;s account exists. Closing the account deletes the shop and
        everything in it. Abuse-prevention records are kept for a short window and then deleted.
      </p>

      <h2>Deleting data</h2>
      <ul>
        <li><strong>Sellers</strong> can delete their account and all of its data from Settings.</li>
        <li><strong>Customers</strong> can ask the shop to delete their conversation, or follow the steps on our <Link href="/data-deletion">data deletion page</Link>.</li>
      </ul>

      <h2>Security</h2>
      <p>
        Data is sent over HTTPS, passwords are hashed, and third-party credentials are encrypted at rest.
        Customer photos and files are only available to the shop they were sent to.
      </p>

      <h2>Children</h2>
      <p>Apsara is a tool for businesses and is not directed at children.</p>

      <h2>Changes and contact</h2>
      <p>
        We will update the date above when this policy changes, and tell sellers of significant changes.
        Questions or requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalProse>
  );
}
