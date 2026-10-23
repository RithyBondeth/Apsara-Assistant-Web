/** Readable long-form text for the legal pages, without a typography plugin. */
export default function LegalProse({
  title,
  effective,
  children,
}: {
  title: string;
  effective: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">Effective {effective}</p>
      </header>
      {children}
    </article>
  );
}
