interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-widest text-estate-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-charcoal-950">
        {title}
      </h2>
      {description ? <p className="mt-5 text-lg leading-relaxed text-stone-600">{description}</p> : null}
    </div>
  );
}
