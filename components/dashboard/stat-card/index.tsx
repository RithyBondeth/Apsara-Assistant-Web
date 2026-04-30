import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IStatCardProps } from "./props";

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClassName,
}: IStatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold leading-none tracking-tight">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
