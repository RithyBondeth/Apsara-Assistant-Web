import type { Metadata } from "next";
import LegalProse from "@/components/legal/legal-prose";
import DeletionStatus from "@/components/legal/deletion-status";
import { CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from "@/utils/constants/legal.constant";

export const metadata: Metadata = {
  title: "Data deletion",
  description: "How to have your data deleted from Apsara Assistant, and check a deletion request.",
};

export default async function DataDeletionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code } = await searchParams;

  return (
    <LegalProse title="Data deletion" effective={LEGAL_EFFECTIVE_DATE}>
      <h2>If you messaged a shop</h2>
      <p>Any of these removes your conversations — messages, photos, voice notes and files — and your name and contact details:</p>
      <ul>
        <li>
          <strong>Through Facebook:</strong> in Facebook, go to <em>Settings &amp; privacy → Settings →
          Apps and websites</em>, remove Apsara Assistant and choose to send a deletion request. You will
          get a confirmation code you can check below.
        </li>
        <li><strong>Ask the shop</strong> you wrote to. It can delete your details from its Apsara account.</li>
        <li>
          <strong>Email us</strong> at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the
          shop&rsquo;s name and how you contacted it. We act within 30 days.
        </li>
      </ul>
      <p>
        A shop keeps its record that a sale happened, because its accounts need it, but not who you are
        or where it was delivered.
      </p>

      <h2>If you have a seller account</h2>
      <p>
        Sign in, open <strong>Settings</strong>, and choose <strong>Delete account</strong>. This
        permanently deletes your shop and everything in it — catalogue, customers, conversations,
        orders, staff and connections. It cannot be undone.
      </p>

      <h2>Check a request</h2>
      <DeletionStatus initialCode={typeof code === "string" ? code : undefined} />
    </LegalProse>
  );
}
