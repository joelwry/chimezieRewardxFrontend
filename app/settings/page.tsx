"use client"

import { useState } from "react"
import { CreditCard, Key, Moon, Shield, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProfile = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm">
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Alex Johnson" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="alexj" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="alex@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue="Crypto enthusiast and reward hunter" />
              </div>
              <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Connected Accounts</CardTitle>
              <CardDescription>Manage your connected accounts and wallets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border space-y-2 sm:space-y-0">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Crypto Wallet</p>
                    <p className="text-sm text-muted-foreground">0x1a2b...9s0t</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Disconnect
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                Connect New Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Theme</CardTitle>
              <CardDescription>Manage your theme preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === "light" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => setTheme("light")}
                >
                  <div className="flex items-center justify-center mb-3">
                    <Sun className="h-8 w-8 text-yellow-500" />
                  </div>
                  <p className="text-center font-medium">Light</p>
                </div>
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === "dark" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="flex items-center justify-center mb-3">
                    <Moon className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-center font-medium">Dark</p>
                </div>
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === "system" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => setTheme("system")}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="relative">
                      <Sun className="h-8 w-8 text-yellow-500" />
                      <Moon className="h-8 w-8 text-blue-500 absolute top-0 left-0 opacity-50" />
                    </div>
                  </div>
                  <p className="text-center font-medium">System</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Interface Settings</CardTitle>
              <CardDescription>Customize your interface preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use a more compact user interface</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Glassmorphism Effects</Label>
                  <p className="text-sm text-muted-foreground">Enable blur and transparency effects</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="w-full sm:w-auto">Update Password</Button>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label>Two-Factor Authentication</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Protect your account with 2FA</p>
                </div>
                <Switch />
              </div>
              <Button variant="outline" className="w-full">
                <Key className="h-4 w-4 mr-2" /> Setup 2FA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Notification Types</CardTitle>
              <CardDescription>Choose which types of notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Tasks</Label>
                  <p className="text-sm text-muted-foreground">When new tasks are available</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reward Earned</Label>
                  <p className="text-sm text-muted-foreground">When you earn rewards from tasks</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Wallet Updates</Label>
                  <p className="text-sm text-muted-foreground">When there are changes to your wallet</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Announcements</Label>
                  <p className="text-sm text-muted-foreground">Important updates about the platform</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
