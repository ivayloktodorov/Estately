import { Container } from '@/components/ui/container';

export default function Loading() {
  return (
    <main className="py-12 bg-cream-50">
      <Container>
        {/* Gallery Skeleton */}
        <div className="mb-12 space-y-4 animate-pulse">
          <div className="w-full bg-stone-200 rounded-2xl aspect-video" />
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-stone-200 rounded-lg aspect-square"
              />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12 animate-pulse">
            {/* Header */}
            <div className="space-y-4">
              <div className="h-12 bg-stone-200 rounded-lg w-3/4" />
              <div className="h-8 bg-stone-200 rounded-lg w-1/3" />
              <div className="h-6 bg-stone-200 rounded-lg w-1/4" />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="h-6 bg-stone-200 rounded-lg" />
              <div className="h-6 bg-stone-200 rounded-lg" />
              <div className="h-6 bg-stone-200 rounded-lg w-2/3" />
            </div>

            {/* Features Grid */}
            <div className="space-y-4">
              <div className="h-6 bg-stone-200 rounded-lg w-1/3" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-stone-200 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-stone-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
