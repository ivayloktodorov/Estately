import Link from 'next/link';
import { getTranslations } from '@/lib/i18n';

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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-estate-200">
        {title}
      </h2>
      <div className="mt-5 space-y-2.5">
        {links.map((link) => (
          <Link
            className="block rounded-md py-1 text-sm leading-5 text-estate-100 transition hover:text-brand-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-estate-800"
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

export async function Footer() {
  const t = await getTranslations();
  const exploreLinks = [
    { href: '/sale', label: t.sale },
    { href: '/rent', label: t.rent },
    { href: '/about', label: t.about },
    { href: '/contact', label: t.contact },
  ];

  return (
    <footer className="border-t border-estate-600 bg-estate-700 text-white">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.75fr_0.75fr] lg:gap-12">
            <div>
              <Link
                aria-label="Estately home"
                className="inline-flex rounded-md text-2xl font-bold text-white transition hover:text-brand-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-estate-800"
                href="/"
              >
                Estately
              </Link>
              <p className="mt-4 max-w-md text-sm leading-6 text-estate-100">{t.footerDescription}</p>
            </div>
            <FooterNavColumn ariaLabel="Explore navigation" links={exploreLinks} title={t.search} />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-estate-200">
                Social
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    aria-label={`${link} placeholder`}
                    className="rounded-lg border border-estate-200/30 px-3 py-2 text-sm text-estate-100 transition hover:border-brand-pink hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-estate-800"
                    href="#"
                    key={link}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-estate-200/20 pt-8 text-sm text-estate-100">
            <p>&copy; {new Date().getFullYear()} Estately. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
