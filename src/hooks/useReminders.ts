
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  remind_at: string;
  completed: boolean;
  contact_id?: string;
  created_by: string;
  created_at: string;
  contact?: {
    first_name: string;
    last_name: string;
  };
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          contact:contacts(first_name, last_name)
        `)
        .eq('created_by', user.id)
        .order('remind_at', { ascending: false });

      if (error) {
        console.error('Error fetching reminders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch reminders",
          variant: "destructive",
        });
        return;
      }

      setReminders(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const createReminder = async (reminderData: {
    title: string;
    description?: string;
    remind_at: string;
    contact_id?: string;
  }) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminderData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reminder:', error);
        return { success: false, error: error.message };
      }

      toast({
        title: "Reminder Created",
        description: "Your reminder has been created successfully.",
      });

      fetchReminders();
      return { success: true, data };
    } catch (error: any) {
      console.error('Error:', error);
      return { success: false, error: error.message };
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ completed })
        .eq('id', id);

      if (error) {
        console.error('Error updating reminder:', error);
        toast({
          title: "Error",
          description: "Failed to update reminder",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: completed ? "Reminder Completed" : "Reminder Reopened",
        description: completed ? "Reminder marked as complete." : "Reminder marked as incomplete.",
      });

      fetchReminders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reminder:', error);
        toast({
          title: "Error",
          description: "Failed to delete reminder",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Reminder Deleted",
        description: "Reminder has been deleted successfully.",
      });

      fetchReminders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    reminders,
    loading,
    createReminder,
    toggleComplete,
    deleteReminder,
    refetchReminders: fetchReminders
  };
};
