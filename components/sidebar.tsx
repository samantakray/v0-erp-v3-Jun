"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Package,
  LayoutDashboard,
  Tag,
  ClipboardList,
  Settings,
  Users,
  BarChart3,
  LogOut,
  Diamond,
  Gem,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "SKU List",
      icon: Tag,
      href: "/skus",
      active: pathname === "/skus",
    },
    {
      label: "Order List",
      icon: ClipboardList,
      href: "/orders",
      active: pathname === "/orders",
    },
    {
      label: "Job List",
      icon: Briefcase,
      href: "/job_list",
      active: pathname === "/job_list",
    },
    {
      label: "Production",
      icon: Package,
      href: "/production",
      active: pathname === "/production",
    },
    {
      label: "Stone List",
      icon: Gem,
      href: "/stones",
      active: pathname === "/stones",
    },
    {
      label: "Diamond List",
      icon: Diamond,
      href: "/diamonds",
      active: pathname === "/diamonds",
    },
    {
      label: "Manufacturers",
      icon: Users,
      href: "/manufacturers",
      active: pathname === "/manufacturers",
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/reports",
      active: pathname === "/reports",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span>Jewelry ERP</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                  route.active ? "bg-muted text-foreground" : "",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  )
}
