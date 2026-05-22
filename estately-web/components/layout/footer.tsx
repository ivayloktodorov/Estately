import Link from 'next/link';
import { Container } from '@/components/ui/container';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const socialLinks = ['Instagram', 'LinkedIn', 'X'];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link className="text-2xl font-semibold" href="/">
              Estately
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              A modern real estate platform for discovering homes, saving favorites, and managing
              your property search with confidence.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
              Explore
            </h2>
            <div className="mt-4 grid gap-3">
              {footerLinks.map((link) => (
                <Link className="text-sm text-slate-300 hover:text-white" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
              Social
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  aria-label={`${link} placeholder`}
                  className="rounded-md border border-white/15 px-3 py-2 text-sm text-slate-300 transition hover:border-white/40 hover:text-white"
                  href="#"
                  key={link}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Estately. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
