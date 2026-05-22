'use client';

interface PropertySearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function PropertySearchBar({ value, onChange }: PropertySearchBarProps) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-semibold text-charcoal-950">
      Search
      <input
        type="search"
        name="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title, city, address..."
        className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-charcoal-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-estate-700 focus:ring-4 focus:ring-estate-700/10"
      />
    </label>
  );
}
