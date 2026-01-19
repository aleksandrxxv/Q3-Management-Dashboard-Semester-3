'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

type NavItem = {
    label: string;
    href: string;
};

type NavSection = {
    label: string;
    items: NavItem[];
};

const sections: NavSection[] = [
    {
        label: 'Machines',
        items: [
            { label: 'Overview', href: '/admin' },
            { label: 'Historical Data', href: '/admin/historical' },
        ],
    },
    {
        label: 'Maintenance',
        items: [
            { label: 'Calendar', href: '/admin/maintenance/calendar' },
            { label: 'Preventive Planning', href: '/admin/maintenance/planning' },
        ],
    },
    {
        label: 'System',
        items: [{ label: 'Notifications', href: '/admin/notifications' }],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex h-screen w-72 flex-col border-r border-slate-200 bg-slate-50/80 backdrop-blur">
            {/* Logo / brand */}
            <div className="px-6 pt-8 pb-5 border-b border-slate-200 bg-white">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                        <Image
                            src="/logo.svg"
                            alt="Q3 Maintenance Software"
                            width={140}
                            height={32}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                    </div>
                    <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
      Admin Console
    </span>
                </div>
            </div>


            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {sections.map((section) => (
                    <div key={section.label} className="space-y-2">
                        <p className="px-3 text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                            {section.label}
                        </p>
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const active =
                                    item.href === '/admin'
                                        ? pathname === '/admin'
                                        : pathname.startsWith(item.href);

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={[
                                                'flex items-center justify-between rounded-xl px-3 py-2 text-sm transition',
                                                active
                                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                                            ].join(' ')}
                                        >
                                            <span>{item.label}</span>
                                            {active && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Bottom area */}
            <div className="border-t border-slate-200 px-4 py-4 bg-white/80">
                <button
                    type="button"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 flex items-center justify-between hover:bg-white transition"
                >
                    <span>Factory View Mode</span>
                    <span className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
            ⏻
          </span>
                </button>
            </div>
        </aside>
    );
}
