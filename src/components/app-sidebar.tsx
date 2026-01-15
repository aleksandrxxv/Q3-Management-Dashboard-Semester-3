"use client"

import * as React from 'react'
import {Bell, Cog, Cpu, Shield, UserIcon, Wrench} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'

const menuItems = [
  { 
    icon: Cpu, 
    label: 'Machines', 
    href: '/dashboard/machines',
    subItems: [
      { label: 'All Machines', href: '/dashboard/machines' },
      { label: 'Historical Data', href: '/dashboard/machines/timeline' },
    ]
  },

  // Molds
  { 
    icon: Shield, 
    label: 'Molds', 
    href: '/dashboard/molds',
    subItems: [
      { label: 'Lifetime', href: '/dashboard/molds' },
    ]
  },

  {
    icon: Wrench,
    label: 'Maintenance',
    href: '/dashboard/maintenance',
    subItems: [
      { label: 'Calendar', href: '/dashboard/maintenance' },
      { label: 'Mechanics', href: '/dashboard/maintenance/mechanics' },
      { label: 'Preventive Planning', href: '/dashboard/maintenance/milestones' },
    ]
  },

  { 
    icon: Bell, 
    label: 'Notifications', 
    href: '/dashboard/notifications',
    badge: 3
  },
    {
        icon: UserIcon,
        label: 'Admin panel',
        href: '/admin',
    },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard/machines') {
      return pathname === '/dashboard/machines' || pathname === '/dashboard'
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <Sidebar className="border-r border-slate-200 bg-slate-50/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {/* Header with logo */}
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1.5">
            <Image
              src="/logo.svg"
              alt="Q3 Maintenance Software"
              width={140}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
              Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <nav className="px-3 py-4 space-y-6">
            {menuItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              
              return (
                <div key={item.href} className="space-y-1.5">
                  {/* Main nav item */}
                  <Link
                    href={item.href}
                    className={[
                      'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition',
                      active
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 min-w-5 px-1.5 text-[10px] font-semibold rounded-full"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      )}
                    </div>
                  </Link>

                  {/* Sub items */}
                  {item.subItems && (
                    <ul className="ml-7 space-y-0.5">
                      {item.subItems.map((subItem) => {
                        const subActive = pathname === subItem.href
                        return (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={[
                                'flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition',
                                subActive
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                                  : 'text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300',
                              ].join(' ')}
                            >
                              <span>{subItem.label}</span>
                              {subActive && (
                                <span className="h-1 w-1 rounded-full bg-orange-500" />
                              )}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80">
        <SidebarMenu className="px-3 py-3 space-y-2">
          <SidebarMenuItem>
            <Link
              href="/settings"
              className={[
                'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition',
                pathname === '/settings'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <Cog className="h-4 w-4" />
                <span>Settings</span>
              </div>
              {pathname === '/settings' && (
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              )}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-4 pb-4">
          <Link
            href="/factory"
            className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span>Factory View Mode</span>
            </div>
            <span className="h-5 w-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px]">
              ⏻
            </span>
          </Link>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
