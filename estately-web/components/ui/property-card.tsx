interface PropertyCardProps {
  imageUrl: string;
  price: string;
  title: string;
  location: string;
  meta: string;
}

export function PropertyCard({ imageUrl, price, title, location, meta }: PropertyCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-estate-soft transition hover:-translate-y-1 hover:shadow-estate">
      <div
        aria-label={title}
        className="h-56 bg-cover bg-center"
        role="img"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="p-5">
        <p className="text-2xl font-semibold text-charcoal-950">{price}</p>
        <h3 className="mt-2 text-lg font-semibold text-charcoal-900">{title}</h3>
        <p className="mt-1 text-sm text-stone-500">{location}</p>
        <p className="mt-4 border-t border-stone-100 pt-4 text-sm font-medium text-stone-600">
          {meta}
        </p>
      </div>
    </article>
  );
}
