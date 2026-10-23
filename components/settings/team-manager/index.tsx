"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, UserPlus, UserX, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaffStore } from "@/stores/apis/staff/staff.store";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

export default function TeamManager() {
  const t = useAppT("settings").team;
  const { members, loading, error, fetchMembers, addStaff, resendInvite, setActive, clearError } =
    useStaffStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function invite(event: FormEvent) {
    event.preventDefault();
    clearError();
    setNotice(null);
    const target = email.trim();
    if (await addStaff({ email: target, full_name: name.trim() })) {
      setNotice(fmt(t.invited, { email: target }));
      setEmail("");
      setName("");
    }
  }

  async function resend(id: string, to: string) {
    setNotice(null);
    if (await resendInvite(id)) setNotice(fmt(t.invited, { email: to }));
  }

  async function toggle(id: string, active: boolean, who: string) {
    if (!active && !confirm(fmt(t.confirmRemove, { name: who }))) return;
    setNotice(null);
    await setActive(id, active);
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-y rounded-lg border">
          {members.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {member.full_name}
                  <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                    {member.role === "owner" ? t.owner : t.staff}
                  </Badge>
                  {!member.is_active && <Badge variant="outline">{t.removed}</Badge>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              {member.role === "staff" && (
                <div className="flex gap-1">
                  {member.is_active && (
                    <Button size="xs" variant="ghost" disabled={loading}
                            onClick={() => resend(member.id, member.email)}>
                      <Mail /> {t.resend}
                    </Button>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={loading}
                    className={member.is_active ? "text-destructive hover:text-destructive" : undefined}
                    onClick={() => toggle(member.id, !member.is_active, member.full_name)}
                  >
                    {member.is_active ? <><UserX /> {t.remove}</> : <><UserCheck /> {t.restore}</>}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={invite} className="space-y-3 rounded-lg border p-3">
          <p className="text-sm font-medium">{t.addTitle}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">{t.name}</Label>
              <Input id="staff-name" value={name} required maxLength={200}
                     onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">{t.email}</Label>
              <Input id="staff-email" type="email" value={email} required
                     onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t.addHelp}</p>
          <Button type="submit" size="sm" disabled={loading || !email.trim() || !name.trim()}>
            <UserPlus /> {t.add}
          </Button>
        </form>

        {notice && <p role="status" className="text-sm text-green-600">{notice}</p>}
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
