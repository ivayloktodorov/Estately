'use client';

interface FilterSelectOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  className?: string;
  label: string;
  name: string;
  value: string;
  placeholder: string;
  options: FilterSelectOption[];
  onChange: (name: string, value: string) => void;
}

export function FilterSelect({
  className = '',
  label,
  name,
  value,
  placeholder,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 text-sm font-semibold text-charcoal-950 ${className}`}>
      {label}
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-charcoal-950 shadow-sm outline-none transition focus:border-estate-700 focus:ring-4 focus:ring-estate-700/10"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
