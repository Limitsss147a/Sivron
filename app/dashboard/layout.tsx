'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { NotificationBell } from '@/components/notification-bell'
import { MobileNav } from '@/components/mobile-nav'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  Building2,
  ScrollText,
  BellRing,
  LogOut,
  ChevronUp,
  Settings,
  Archive,
} from 'lucide-react'

const userMenuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Pengajuan RKA/DPA', href: '/dashboard/budgets', icon: FileText },
  { title: 'Notifikasi', href: '/dashboard/notifications', icon: BellRing },
]

const adminMenuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Verifikasi RKA/DPA', href: '/dashboard/review', icon: ClipboardCheck },
  { title: 'Pengajuan RKA/DPA', href: '/dashboard/budgets', icon: FileText },
  { title: 'Notifikasi', href: '/dashboard/notifications', icon: BellRing },
]

const adminManagementItems = [
  { title: 'Kelola Pengguna', href: '/dashboard/users', icon: Users },
  { title: 'Kelola Instansi', href: '/dashboard/institutions', icon: Building2 },
  { title: 'Kelola Pengajuan', href: '/dashboard/manage-budgets', icon: Archive },
  { title: 'Audit Log', href: '/dashboard/audit-log', icon: ScrollText },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, isLoading, isAdmin } = useProfile()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Force a hard reload to clear SWR cache and any lingering React state
    window.location.href = '/auth/login'
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  const menuItems = isAdmin ? adminMenuItems : userMenuItems
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        {/* Sidebar Header - Brand */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">E-Budgeting</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Sistem Anggaran
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Main Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.href === '/dashboard'
                          ? pathname === '/dashboard'
                          : pathname.startsWith(item.href)
                      }
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin Management Section */}
          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminManagementItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Sidebar Footer - User */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {profile?.full_name || 'User'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {isAdmin ? 'Administrator' : profile?.institution?.name || 'User'}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-56"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.position || (isAdmin ? 'Administrator' : 'User')}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        {/* Top header bar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 flex-1">
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            <Separator orientation="vertical" className="mx-2 h-4 hidden md:block" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground md:hidden">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                E-Budgeting
              </h2>
              <Separator orientation="vertical" className="mx-1 h-3 hidden sm:block" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex text-right mr-1 sm:mr-2">
              <p className="text-xs font-medium leading-none truncate max-w-[80px] sm:max-w-[150px]">
                Halo, {profile?.full_name?.split(' ')[0] || 'User'}
              </p>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </div>
      </SidebarInset>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </SidebarProvider>
  )
}
