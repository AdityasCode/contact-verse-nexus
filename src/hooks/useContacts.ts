
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_at: string;
  created_by: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to fetch contacts",
          variant: "destructive",
        });
        return;
      }

      setContacts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchTerm]);

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error);
        toast({
          title: "Error",
          description: "Failed to delete contact",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Contact deleted",
        description: "The contact has been removed from your list.",
      });
      
      fetchContacts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    contacts,
    loading,
    searchTerm,
    setSearchTerm,
    deleteContact,
    refetchContacts: fetchContacts
  };
};
