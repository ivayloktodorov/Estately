import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/demo', label: 'Demo' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/docs/api', label: 'API Docs' },
  { href: '/docs/database-schema', label: 'Database Schema' },
  { href: '/docs/requirements', label: 'Requirements' },
  { href: '/docs/architecture', label: 'Architecture' },
  { href: '/docs/project-health', label: 'Project Health' },
  { href: '/docs/production-readiness', label: 'Production Readiness' },
  { href: '/docs/local-setup', label: 'Local Setup' },
  { href: '/docs/deployment', label: 'Deployment' },
];

const socialLinks = ['Instagram', 'LinkedIn', 'X'];

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-charcoal-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Link className="text-2xl font-bold hover:text-estate-600 transition" href="/">
                Estately
              </Link>
              <p className="mt-4 max-w-md text-sm leading-6 text-stone-400">
                A modern real estate platform for discovering homes, saving favorites, and managing
                your property search with confidence.
              </p>
            </div>
            <nav aria-label="Footer navigation">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-300">
                Explore
              </h2>
              <div className="mt-6 space-y-3">
                {footerLinks.map((link) => (
                  <Link
                    className="block text-sm text-stone-400 hover:text-white transition"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-300">
                Social
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    aria-label={`${link} placeholder`}
                    className="rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-400 transition hover:border-stone-500 hover:text-white"
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
