'use client';

interface PriceRangeInputsProps {
  className?: string;
  minPrice: string;
  maxPrice: string;
  onChange: (name: string, value: string) => void;
}

export function PriceRangeInputs({ className = '', minPrice, maxPrice, onChange }: PriceRangeInputsProps) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-charcoal-950">
        Min price
        <input
          type="number"
          min="0"
          inputMode="numeric"
          name="minPrice"
          value={minPrice}
          onChange={(event) => onChange('minPrice', event.target.value)}
          placeholder="100000"
          className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-charcoal-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-estate-700 focus:ring-4 focus:ring-estate-700/10"
        />
      </label>
      <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-charcoal-950">
        Max price
        <input
          type="number"
          min="0"
          inputMode="numeric"
          name="maxPrice"
          value={maxPrice}
          onChange={(event) => onChange('maxPrice', event.target.value)}
          placeholder="300000"
          className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-charcoal-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-estate-700 focus:ring-4 focus:ring-estate-700/10"
        />
      </label>
    </div>
  );
}
