
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, 
  ArrowLeft, 
  Sun, 
  Moon, 
  LogOut, 
  Plus,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useReminders } from '@/hooks/useReminders';
import { ReminderForm } from '@/components/ReminderForm';

const Reminders = () => {
  const { theme, toggleTheme, updateUserMetadata } = useTheme();
  const { signOut } = useAuth();
  const { reminders, loading, toggleComplete, deleteReminder } = useReminders();
  const [showForm, setShowForm] = useState(false);

  const handleThemeToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    
    try {
      await updateUserMetadata({ theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const incompleteReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Reminders</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Reminder
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="incomplete" className="space-y-6">
          <TabsList>
            <TabsTrigger value="incomplete">
              Incomplete ({incompleteReminders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedReminders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incomplete">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading reminders...</p>
                </div>
              ) : incompleteReminders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No incomplete reminders
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You're all caught up! Create a new reminder to get started.
                    </p>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Reminder
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                incompleteReminders.map((reminder) => (
                  <Card key={reminder.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={reminder.completed}
                            onCheckedChange={(checked) => 
                              toggleComplete(reminder.id, checked as boolean)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                              {reminder.title}
                            </h3>
                            {reminder.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(reminder.remind_at)}</span>
                              </div>
                              {reminder.contact && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {reminder.contact.first_name} {reminder.contact.last_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {completedReminders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No completed reminders
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Completed reminders will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedReminders.map((reminder) => (
                  <Card key={reminder.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={reminder.completed}
                            onCheckedChange={(checked) => 
                              toggleComplete(reminder.id, checked as boolean)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-through">
                              {reminder.title}
                            </h3>
                            {reminder.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(reminder.remind_at)}</span>
                              </div>
                              {reminder.contact && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {reminder.contact.first_name} {reminder.contact.last_name}
                                  </span>
                                </div>
                              )}
                              <Badge variant="secondary">Completed</Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Reminder Form Modal */}
      {showForm && (
        <ReminderForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Reminders;
