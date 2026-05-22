import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <main className="py-24 bg-cream-50">
      <Container>
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-estate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9m0 0a9 9 0 0 1-9 9 9 9 0 0 1-9-9m9 9v-7m0 0h-3m3 0h3"
              />
            </svg>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-charcoal-950 mb-2">
            Property Not Found
          </h1>
          <p className="text-stone-600 mb-8">
            The property you're looking for doesn't exist or has been removed. 
            Let's get you back on track.
          </p>

          {/* CTA */}
          <Link
            href="/properties"
            className="inline-block bg-estate-700 hover:bg-estate-800 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 mb-4"
          >
            Browse All Properties
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/"
            className="inline-block text-estate-700 hover:text-estate-800 font-semibold transition"
          >
            Return Home
          </Link>
        </div>
      </Container>
    </main>
  );
}
