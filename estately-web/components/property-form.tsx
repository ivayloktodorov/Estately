'use client';

import { useActionState } from 'react';
import { createPropertyAction } from '@/lib/properties/actions';
import { LISTING_TYPES, PROPERTY_TYPES } from '@/lib/properties/constants';
import type { PropertyActionState } from '@/lib/properties/types';

const initialState: PropertyActionState = {
  status: 'idle',
  message: '',
};

interface FormFieldProps {
  error?: string;
  children: React.ReactNode;
  label: string;
  name: string;
}

function FormField({ children, error, label, name }: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-charcoal-950" htmlFor={name}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm text-red-700" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(hasError?: boolean): string {
  return `h-12 w-full rounded-lg border bg-white px-4 text-base text-charcoal-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-700 focus:ring-red-100'
      : 'border-stone-300 focus:border-estate-700 focus:ring-cream-200'
  }`;
}

function selectClass(hasError?: boolean): string {
  return `${inputClass(hasError)} appearance-none`;
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  defaultValue?: string;
  error?: string;
  label: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
}

function SelectField({
  defaultValue,
  error,
  label,
  name,
  options,
  placeholder = 'Select an option',
}: SelectFieldProps) {
  return (
    <FormField error={error} label={label} name={name}>
      <select
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={selectClass(Boolean(error))}
        defaultValue={defaultValue ?? ''}
        id={name}
        name={name}
        required
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

function PropertyTypeSelect({
  defaultValue,
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  return (
    <SelectField
      defaultValue={defaultValue}
      error={error}
      label="Property type"
      name="propertyType"
      options={PROPERTY_TYPES.map((type) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type,
      }))}
      placeholder="Select property type"
    />
  );
}

function ListingTypeSelect({
  defaultValue,
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  return (
    <SelectField
      defaultValue={defaultValue ?? 'sale'}
      error={error}
      label="Listing type"
      name="listingType"
      options={LISTING_TYPES.map((type) => ({
        label: type === 'sale' ? 'For sale' : 'For rent',
        value: type,
      }))}
    />
  );
}

export function PropertyForm() {
  const [state, formAction, pending] = useActionState(createPropertyAction, initialState);

  return (
    <form action={formAction} className="space-y-8" encType="multipart/form-data">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormField error={state.errors?.title} label="Property title" name="title">
            <input
              aria-describedby={state.errors?.title ? 'title-error' : undefined}
              aria-invalid={Boolean(state.errors?.title)}
              className={inputClass(Boolean(state.errors?.title))}
              defaultValue={state.fields?.title}
              id="title"
              name="title"
              placeholder="Beautiful modern apartment in Sofia"
              required
              type="text"
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField error={state.errors?.description} label="Description" name="description">
            <textarea
              aria-describedby={state.errors?.description ? 'description-error' : undefined}
              aria-invalid={Boolean(state.errors?.description)}
              className={`${inputClass(Boolean(state.errors?.description))} min-h-36 resize-y py-3`}
              defaultValue={state.fields?.description}
              id="description"
              name="description"
              placeholder="Describe the property, finishes, nearby amenities, and standout details."
              required
            />
          </FormField>
        </div>

        <FormField error={state.errors?.price} label="Price" name="price">
          <input
            aria-describedby={state.errors?.price ? 'price-error' : undefined}
            aria-invalid={Boolean(state.errors?.price)}
            className={inputClass(Boolean(state.errors?.price))}
            defaultValue={state.fields?.price}
            id="price"
            min="1"
            name="price"
            placeholder="250000"
            required
            step="0.01"
            type="number"
          />
        </FormField>

        <FormField error={state.errors?.city} label="City" name="city">
          <select
            aria-describedby={state.errors?.city ? 'city-error' : undefined}
            aria-invalid={Boolean(state.errors?.city)}
            className={selectClass(Boolean(state.errors?.city))}
            defaultValue={state.fields?.city ?? ''}
            id="city"
            name="city"
            required
          >
            <option value="">Select a city</option>
            <option value="Sofia">Sofia</option>
            <option value="Varna">Varna</option>
            <option value="Burgas">Burgas</option>
            <option value="Plovdiv">Plovdiv</option>
          </select>
        </FormField>

        <div className="md:col-span-2">
          <FormField error={state.errors?.address} label="Address" name="address">
            <input
              aria-describedby={state.errors?.address ? 'address-error' : undefined}
              aria-invalid={Boolean(state.errors?.address)}
              className={inputClass(Boolean(state.errors?.address))}
              defaultValue={state.fields?.address}
              id="address"
              name="address"
              placeholder="123 Vitosha Boulevard"
              required
              type="text"
            />
          </FormField>
        </div>

        <PropertyTypeSelect
          defaultValue={state.fields?.propertyType}
          error={state.errors?.propertyType}
        />

        <ListingTypeSelect
          defaultValue={state.fields?.listingType}
          error={state.errors?.listingType}
        />

        <FormField error={state.errors?.bedrooms} label="Bedrooms" name="bedrooms">
          <input
            aria-describedby={state.errors?.bedrooms ? 'bedrooms-error' : undefined}
            aria-invalid={Boolean(state.errors?.bedrooms)}
            className={inputClass(Boolean(state.errors?.bedrooms))}
            defaultValue={state.fields?.bedrooms}
            id="bedrooms"
            min="0"
            name="bedrooms"
            placeholder="2"
            required
            step="1"
            type="number"
          />
        </FormField>

        <FormField error={state.errors?.bathrooms} label="Bathrooms" name="bathrooms">
          <input
            aria-describedby={state.errors?.bathrooms ? 'bathrooms-error' : undefined}
            aria-invalid={Boolean(state.errors?.bathrooms)}
            className={inputClass(Boolean(state.errors?.bathrooms))}
            defaultValue={state.fields?.bathrooms}
            id="bathrooms"
            min="0"
            name="bathrooms"
            placeholder="1"
            required
            step="1"
            type="number"
          />
        </FormField>

        <FormField error={state.errors?.areaSqm} label="Square meters" name="areaSqm">
          <input
            aria-describedby={state.errors?.areaSqm ? 'areaSqm-error' : undefined}
            aria-invalid={Boolean(state.errors?.areaSqm)}
            className={inputClass(Boolean(state.errors?.areaSqm))}
            defaultValue={state.fields?.areaSqm}
            id="areaSqm"
            min="1"
            name="areaSqm"
            placeholder="85"
            required
            step="1"
            type="number"
          />
        </FormField>
      </div>

      <FormField error={state.errors?.images} label="Upload Images" name="images">
        <input
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={state.errors?.images ? 'images-error' : undefined}
          aria-invalid={Boolean(state.errors?.images)}
          className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-charcoal-950 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-estate-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          id="images"
          multiple
          name="images"
          type="file"
        />
        <p className="mt-2 text-xs text-slate-500">
          Add up to 10 JPG, PNG, or WEBP photos. The first image becomes the cover.
        </p>
      </FormField>

      {state.status === 'error' ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <button
        className="h-12 w-full rounded-lg bg-estate-700 px-5 font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400 md:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Creating property...' : 'Create property'}
      </button>
    </form>
  );
}
