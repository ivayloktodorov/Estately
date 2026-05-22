interface PropertyCardProps {
  imageUrl: string;
  price: string;
  title: string;
  location: string;
  meta: string;
}

export function PropertyCard({ imageUrl, price, title, location, meta }: PropertyCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-estate-soft transition hover:shadow-estate hover:-translate-y-2">
      <div
        aria-label={title}
        className="h-64 bg-cover bg-center transition group-hover:scale-105"
        role="img"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="p-6">
        <p className="text-xl font-bold text-estate-700">{price}</p>
        <h3 className="mt-3 text-lg font-semibold text-charcoal-950">{title}</h3>
        <p className="mt-2 text-sm text-stone-600">{location}</p>
        <p className="mt-4 border-t border-stone-100 pt-4 text-sm font-medium text-stone-600">
          {meta}
        </p>
      </div>
    </article>
  );
}
