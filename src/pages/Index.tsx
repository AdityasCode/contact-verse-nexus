import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserPlus, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../hooks/useAuth";

interface Stats {
  total: number;
  recent: number;
  favorites: number;
}

interface ActivityItem {
  contact_name: string;
  action: string;
  timestamp: string;
}

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Fetch stats when user is available
  useEffect(() => {
    if (!user) return;
    setLoadingStats(true);
    supabase
        .from<Stats>("contact_stats")
        .select("total, recent, favorites")
        .eq("user_id", user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching stats:", error);
          } else if (data) {
            setStats(data);
          }
        })
        .finally(() => setLoadingStats(false));
  }, [user]);

  // Fetch recent activity
  useEffect(() => {
    if (!user) return;
    setLoadingActivity(true);
    supabase
        .from<ActivityItem>("recent_activity")
        .select("contact_name, action, timestamp")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(10)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching activity:", error);
          } else if (data) {
            setActivity(data);
          }
        })
        .finally(() => setLoadingActivity(false));
  }, [user]);

  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Manager</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your contacts with ease</p>
            </div>
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to access your contacts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/login" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button variant="outline" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Manager</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-full">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your contacts.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? "..." : stats?.total ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">All your contacts</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Additions</CardTitle>
                <UserPlus className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? "..." : stats?.recent ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Added this week</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                <div className="h-4 w-4 text-yellow-500">★</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? "..." : stats?.favorites ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Marked as favorite</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="hover:shadow-lg transition-shadow mb-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your contacts efficiently</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/contacts/new" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add New Contact
                    </Button>
                  </Link>
                  <Link to="/contacts" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      View All Contacts
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates to your contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingActivity ? (
                      <div>Loading...</div>
                  ) : (
                      <div className="space-y-3">
                        {activity.length === 0 && <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity.</p>}
                        {activity.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                              <div
                                  className={`w-2 h-2 rounded-full ${
                                      item.action === 'Added' ? 'bg-green-500' :
                                          item.action === 'Favorited' ? 'bg-yellow-500' :
                                              'bg-blue-500'
                                  }`}
                              ></div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{item.action} {item.contact_name}</span>
                              <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
  );
};

export default Index;