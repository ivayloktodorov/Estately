'use client';

import { useActionState } from 'react';
import { updatePropertyAction } from '@/app/dashboard/properties/actions';
import { LISTING_TYPES, PROPERTY_TYPES } from '@/lib/properties/constants';
import type { PropertyActionState } from '@/lib/properties/types';
import type { DashboardProperty } from '@/lib/dashboard/properties';

interface EditPropertyFormProps {
  property: DashboardProperty;
}

interface FormFieldProps {
  error?: string;
  children: React.ReactNode;
  label: string;
  name: string;
}

function FormField({ children, error, label, name }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-charcoal-950" htmlFor={name}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm text-red-700" id={`${name}-error`}>
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

function optionLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function EditPropertyForm({ property }: EditPropertyFormProps) {
  const initialState: PropertyActionState = {
    status: 'idle',
    message: '',
    fields: {
      title: property.title,
      description: property.description,
      price: property.price,
      city: property.city,
      address: property.address,
      propertyType: property.propertyType,
      listingType: property.listingType,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      areaSqm: property.areaSqm.toString(),
    },
  };
  const [state, formAction, pending] = useActionState(updatePropertyAction, initialState);
  const fields = state.fields ?? initialState.fields;

  return (
    <form action={formAction} className="space-y-8">
      <input name="propertyId" type="hidden" value={property.id} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormField error={state.errors?.title} label="Property title" name="title">
            <input
              aria-describedby={state.errors?.title ? 'title-error' : undefined}
              aria-invalid={Boolean(state.errors?.title)}
              className={inputClass(Boolean(state.errors?.title))}
              defaultValue={fields?.title}
              id="title"
              name="title"
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
              defaultValue={fields?.description}
              id="description"
              name="description"
              required
            />
          </FormField>
        </div>

        <FormField error={state.errors?.price} label="Price" name="price">
          <input
            aria-describedby={state.errors?.price ? 'price-error' : undefined}
            aria-invalid={Boolean(state.errors?.price)}
            className={inputClass(Boolean(state.errors?.price))}
            defaultValue={fields?.price}
            id="price"
            min="1"
            name="price"
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
            defaultValue={fields?.city ?? ''}
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
              defaultValue={fields?.address}
              id="address"
              name="address"
              required
              type="text"
            />
          </FormField>
        </div>

        <FormField error={state.errors?.propertyType} label="Property type" name="propertyType">
          <select
            aria-describedby={state.errors?.propertyType ? 'propertyType-error' : undefined}
            aria-invalid={Boolean(state.errors?.propertyType)}
            className={selectClass(Boolean(state.errors?.propertyType))}
            defaultValue={fields?.propertyType ?? ''}
            id="propertyType"
            name="propertyType"
            required
          >
            <option value="">Select property type</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {optionLabel(type)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField error={state.errors?.listingType} label="Listing type" name="listingType">
          <select
            aria-describedby={state.errors?.listingType ? 'listingType-error' : undefined}
            aria-invalid={Boolean(state.errors?.listingType)}
            className={selectClass(Boolean(state.errors?.listingType))}
            defaultValue={fields?.listingType ?? 'sale'}
            id="listingType"
            name="listingType"
            required
          >
            {LISTING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'sale' ? 'For sale' : 'For rent'}
              </option>
            ))}
          </select>
        </FormField>

        <FormField error={state.errors?.bedrooms} label="Bedrooms" name="bedrooms">
          <input
            aria-describedby={state.errors?.bedrooms ? 'bedrooms-error' : undefined}
            aria-invalid={Boolean(state.errors?.bedrooms)}
            className={inputClass(Boolean(state.errors?.bedrooms))}
            defaultValue={fields?.bedrooms}
            id="bedrooms"
            min="0"
            name="bedrooms"
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
            defaultValue={fields?.bathrooms}
            id="bathrooms"
            min="0"
            name="bathrooms"
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
            defaultValue={fields?.areaSqm}
            id="areaSqm"
            min="1"
            name="areaSqm"
            required
            step="1"
            type="number"
          />
        </FormField>
      </div>

      {state.status === 'error' ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <button
        className="h-12 w-full rounded-lg bg-charcoal-950 px-5 font-semibold text-white shadow-estate-soft transition hover:bg-charcoal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400 md:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Saving changes...' : 'Save changes'}
      </button>
    </form>
  );
}
