'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListFilter, Settings, LogOut, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transacciones', icon: ListFilter },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
]

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-surface border-r border-border">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-balance rounded flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-sans font-semibold text-text-primary text-sm tracking-tight">
            Finanzas
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200',
                active
                  ? 'bg-balance text-white font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-text-secondary hover:text-expense hover:bg-expense-light transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
