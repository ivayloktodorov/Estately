'use client';

import { useRouter } from 'next/navigation';
import { MouseEvent, useState, useTransition } from 'react';
import { toggleFavoriteAction } from '@/lib/favorites/actions';

interface FavoriteButtonProps {
  propertyId: number;
  initialIsFavorited: boolean;
  isAuthenticated: boolean;
  propertyTitle: string;
}

export function FavoriteButton({
  propertyId,
  initialIsFavorited,
  isAuthenticated,
  propertyTitle,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [error, setError] = useState<string | null>(null);

  const label = isFavorited
    ? `Remove ${propertyTitle} from favorites`
    : `Save ${propertyTitle} to favorites`;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const nextIsFavorited = !isFavorited;
    setIsFavorited(nextIsFavorited);
    setError(null);

    startTransition(async () => {
      const result = await toggleFavoriteAction(propertyId, nextIsFavorited);

      if (result.status === 'error') {
        setIsFavorited(result.isFavorited);
        setError(result.message ?? 'Unable to update favorites.');
        return;
      }

      setIsFavorited(result.isFavorited);
    });
  };

  return (
    <div className="absolute left-3 top-3 z-10">
      <button
        type="button"
        aria-label={label}
        aria-pressed={isFavorited}
        disabled={isPending}
        onClick={handleClick}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/95 text-lg text-estate-700 shadow-estate-soft backdrop-blur transition hover:scale-105 hover:bg-white focus:outline-none focus:ring-4 focus:ring-estate-700/20 disabled:cursor-wait disabled:opacity-70"
      >
        <span aria-hidden="true">{isFavorited ? '♥' : '♡'}</span>
      </button>
      {error ? (
        <p className="mt-2 max-w-44 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-estate-soft">
          {error}
        </p>
      ) : null}
    </div>
  );
}
