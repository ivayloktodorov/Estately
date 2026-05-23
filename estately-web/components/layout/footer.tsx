import Link from 'next/link';

const exploreLinks = [
  { href: '/', label: 'Home' },
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const socialLinks = ['Instagram', 'LinkedIn', 'X'];

interface FooterLink {
  href: string;
  label: string;
}

function FooterNavColumn({
  ariaLabel,
  links,
  title,
}: {
  ariaLabel: string;
  links: FooterLink[];
  title: string;
}) {
  return (
    <nav aria-label={ariaLabel}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-300">
        {title}
      </h2>
      <div className="mt-5 space-y-2.5">
        {links.map((link) => (
          <Link
            className="block rounded-md py-1 text-sm leading-5 text-stone-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-600 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-charcoal-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.75fr_0.75fr] lg:gap-12">
            <div>
              <Link
                aria-label="Estately home"
                className="inline-flex rounded-md text-2xl font-bold text-white transition hover:text-estate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-600 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950"
                href="/"
              >
                Estately
              </Link>
              <p className="mt-4 max-w-md text-sm leading-6 text-stone-400">
                A modern real estate platform for discovering homes, saving favorites, and managing
                your property search with confidence.
              </p>
            </div>
            <FooterNavColumn ariaLabel="Explore navigation" links={exploreLinks} title="Explore" />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-300">
                Social
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    aria-label={`${link} placeholder`}
                    className="rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-400 transition hover:border-estate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-600 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950"
                    href="#"
                    key={link}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-stone-800 pt-8 text-sm text-stone-400">
            <p>&copy; {new Date().getFullYear()} Estately. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
