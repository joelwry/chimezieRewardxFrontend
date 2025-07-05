"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart3, Coins, Home, LogOut, Settings, Sparkles, Wallet } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter();

  const [user] = useState({
    name: "Alex Johnson",
    username: "alexj",
    avatar: "/placeholder.svg?height=40&width=40",
  })

  const handleLogout = () => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("Access token cleared from cookies.");
    router.push("/login"); 
  };

  const menuItems = [
    { title: "Dashboard", icon: Home, path: "/dashboard" },
    { title: "Tasks", icon: Sparkles, path: "/tasks" },
    { title: "Wallet", icon: Wallet, path: "/wallet" },
    { title: "Transactions", icon: Coins, path: "/transactions" },
    { title: "Activity", icon: Activity, path: "/activity" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="bg-gradient-to-b from-background/80 to-background/60 border-r shadow-lg min-w-[18rem] max-w-[20rem] flex flex-col justify-between h-screen px-4 py-6"
      style={{ minHeight: '100vh' }}
    >
      <div className="flex flex-col items-center w-full">
        <SidebarHeader className="bg-transparent mb-6">
          <div className="flex flex-col items-center gap-2 px-2 py-1">
            <Coins className="h-10 w-10 text-primary drop-shadow-lg" />
            <span className="text-2xl font-bold tracking-tight">RewardX</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator className="my-4" />
        <SidebarContent className="bg-transparent w-full">
          <SidebarMenu className="flex flex-col gap-3 w-full">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title} className="w-full">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path}
                  tooltip={item.title}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:shadow-md ${pathname === item.path ? 'bg-primary/20 text-primary font-semibold shadow' : ''}`}
                >
                  <Link href={item.path} className="flex items-center gap-3 w-full">
                    <item.icon className="h-6 w-6" />
                    <span className="text-base">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </div>
      <SidebarFooter className="bg-transparent mt-8">
        <SidebarSeparator className="my-4" />
        <SidebarMenu className="flex flex-col gap-3 w-full">
          {/* <SidebarMenuItem>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/40 w-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
              </div>
            </div>
          </SidebarMenuItem> */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout" className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-destructive/10 transition-all">
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
