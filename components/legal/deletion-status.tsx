"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { PRIVACY_API } from "@/utils/constants/apis/privacy.api.constant";

interface IDeletionStatus {
  confirmation_code: string;
  status: string;
  customers_erased: number;
}

/** Look up a confirmation code Meta showed the person who asked. */
export default function DeletionStatus({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [result, setResult] = useState<IDeletionStatus | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function lookUp(value: string) {
    if (!value.trim()) return;
    setLoading(true);
    setMissing(false);
    setResult(null);
    try {
      const { data } = await api.get<IDeletionStatus>(PRIVACY_API.DELETION_STATUS(value.trim()));
      setResult(data);
    } catch {
      setMissing(true);
    } finally {
      setLoading(false);
    }
  }

  // Arriving from the link Meta gave them: look the code up straight away.
  // State is only set from the answer, never synchronously in the effect.
  useEffect(() => {
    if (!initialCode) return;
    let live = true;
    api.get<IDeletionStatus>(PRIVACY_API.DELETION_STATUS(initialCode.trim()))
      .then(({ data }) => { if (live) setResult(data); })
      .catch(() => { if (live) setMissing(true); });
    return () => { live = false; };
  }, [initialCode]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void lookUp(code);
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <form onSubmit={submit} className="flex gap-2">
        <Input
          aria-label="Confirmation code"
          placeholder="Confirmation code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono"
        />
        <Button type="submit" disabled={loading || !code.trim()}>Check</Button>
      </form>
      {result && (
        <p role="status" className="text-sm">
          Request <span className="font-mono">{result.confirmation_code}</span> is{" "}
          <strong>{result.status}</strong>.{" "}
          {result.customers_erased > 0
            ? `Your conversations were deleted from ${result.customers_erased} shop${result.customers_erased === 1 ? "" : "s"}.`
            : "No conversations linked to your Facebook account were found. Shops identify you differently in Messenger, so if you wrote to a shop, ask it directly or email us as described above."}
        </p>
      )}
      {missing && (
        <p role="alert" className="text-sm text-destructive">No request was found with that code.</p>
      )}
    </div>
  );
}
