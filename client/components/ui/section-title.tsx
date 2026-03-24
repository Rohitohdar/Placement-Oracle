type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-violet-200/80">
        {eyebrow}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h1>
      <p className="max-w-2xl text-base leading-7 text-slate-200/80 md:text-lg">
        {description}
      </p>
    </div>
  );
}
