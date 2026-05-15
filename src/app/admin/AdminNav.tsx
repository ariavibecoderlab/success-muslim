'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/ads', label: 'Ads' },
  { href: '/admin/analytics', label: 'Analytics' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive ? 'bg-primary-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href="/app/today"
        className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 mt-4"
      >
        Back to App
      </Link>
    </nav>
  );
}
