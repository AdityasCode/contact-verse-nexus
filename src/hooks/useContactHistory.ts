
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ContactHistoryEntry {
  id: string;
  contact_id: string;
  changed_by: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  changed_at: string;
}

export const useContactHistory = (contactId?: string) => {
  const [history, setHistory] = useState<ContactHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user || !contactId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_history')
        .select('*')
        .eq('contact_id', contactId)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact history:', error);
        return;
      }

      setHistory(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contactId) {
      fetchHistory();
    }
  }, [contactId, user]);

  const addHistoryEntry = async (
    contactId: string,
    fieldName: string,
    oldValue?: string,
    newValue?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contact_history')
        .insert({
          contact_id: contactId,
          changed_by: user.id,
          field_name: fieldName,
          old_value: oldValue || null,
          new_value: newValue || null,
        });

      if (error) {
        console.error('Error adding history entry:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    history,
    loading,
    addHistoryEntry,
    refetchHistory: fetchHistory
  };
};
