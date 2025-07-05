"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, BadgeCheck, Calendar, ChevronDown, Clock, Filter, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

function getCookie(name: string) {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch activities from API
  useEffect(() => {
    async function fetchActivities() {
      setLoading(true)
      setError(null)
      const token = getCookie("access_token")
      if (!token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/?page=${page}`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch activities")
        const data = await res.json()
        // If paginated, data.results; else data is array
        let newActivities = Array.isArray(data) ? data : data.results || []
        if (page === 1) {
          setActivities(newActivities)
        } else {
          setActivities((prev) => [...prev, ...newActivities])
        }
        setHasMore(newActivities.length > 0 && (!data.count || activities.length + newActivities.length < data.count))
      } catch (err: any) {
        setError(err.message || "Failed to load activities")
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Group activities by date
  const groupedActivities = activities.reduce((acc: any, activity: any) => {
    const date = activity.completed_at ? new Date(activity.completed_at).toLocaleDateString() : "No Date"
    if (!acc[date]) acc[date] = []
    acc[date].push(activity)
    return acc
  }, {})
  const activityDays = Object.entries(groupedActivities).map(([date, acts]) => ({ date, activities: acts as any[] }))

  // Filter activities based on search and filters
  const filteredActivity = activityDays
    .map((day) => {
      const filteredActivities = day.activities.filter((activity: any) => {
        // Filter by search query
        const matchesSearch = searchQuery === "" || 
          (activity.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (activity.task?.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
        // Filter by type
        const matchesType =
          filterType === "all" ||
          (filterType === "tasks" && activity.task?.type === "survey") ||
          (filterType === "deposits" && activity.task?.type === "deposit") ||
          (filterType === "staking" && (activity.task?.type === "invest" || activity.task?.type === "lock"))
        
        return matchesSearch && matchesType
      })
      return {
        ...day,
        activities: filteredActivities,
      }
    })
    .filter((day) => day.activities.length > 0)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "survey":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
            <BadgeCheck className="w-5 h-5 text-green-500" />
          </div>
        )
      case "deposit":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
            <ArrowDown className="w-5 h-5 text-blue-500" />
          </div>
        )
      case "invest":
      case "lock":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10">
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-500/10">
            <ArrowUp className="w-5 h-5 text-gray-500" />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
          <p className="text-muted-foreground">Track your rewards and task history</p>
        </div>
      </div>

      <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Your recent activity and rewards</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search activity..."
                  className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                    <SelectItem value="deposits">Deposits</SelectItem>
                    <SelectItem value="staking">Investments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="m-0">
              <div className="space-y-6">
                {loading ? (
                  <div className="p-8 text-center">Loading activities...</div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500">{error}</div>
                ) : filteredActivity.length > 0 ? (
                  filteredActivity.map((day) => (
                    <Collapsible key={day.date} defaultOpen>
                      <div className="flex items-center gap-2 mb-2">
                        <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary">
                          <ChevronDown className="h-4 w-4" />
                          <h3 className="text-lg font-medium">{day.date}</h3>
                        </CollapsibleTrigger>
                        <Badge variant="outline">{day.activities.length} activities</Badge>
                      </div>
                      <CollapsibleContent>
                        <div className="ml-6 border-l pl-6 space-y-6">
                          {day.activities.map((activity: any) => (
                            <div key={activity.id} className="flex gap-4">
                              {getActivityIcon(activity.task?.type)}
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{activity.task?.title || "No Title"}</h4>
                                  <span className="text-sm text-muted-foreground">{activity.completed_at ? new Date(activity.completed_at).toLocaleTimeString() : ""}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{activity.task?.description || "No description"}</p>
                                {activity.reward_earned && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                  >
                                    +₦{Number(activity.reward_earned).toLocaleString()}
                                  </Badge>
                                )}
                                {activity.amount && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                                  >
                                    +₦{Number(activity.amount).toLocaleString()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No activities found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
                {hasMore && !loading && (
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="stats" className="m-0">
              {/* You can keep or update the stats tab as needed, or fetch real stats from backend */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activities.filter((a) => a.completed).length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Rewards Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{activities.reduce((sum, a) => sum + Number(a.reward_earned || 0), 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Reward per Task</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{(activities.length ? (activities.reduce((sum, a) => sum + Number(a.reward_earned || 0), 0) / activities.length).toFixed(2) : 0)}</div>
                  </CardContent>
                </Card>
                {/* You can add more stats as needed */}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
