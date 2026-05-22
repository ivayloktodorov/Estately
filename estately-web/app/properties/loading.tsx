import { Container } from '@/components/ui/container';

export default function PropertiesLoading() {
  return (
    <main className="flex-1 py-12 md:py-16">
      <Container>
        <div className="mb-12 h-28 max-w-3xl animate-pulse rounded-2xl bg-stone-200" />
        <div className="mb-8 h-40 animate-pulse rounded-2xl bg-white shadow-estate-soft" />
        <div className="mb-8 h-5 w-40 animate-pulse rounded bg-stone-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[420px] animate-pulse rounded-xl border border-stone-200 bg-white shadow-estate-soft"
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
