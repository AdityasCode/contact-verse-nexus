
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseConfig } from './useSupabaseConfig';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const { getText, getSetting } = useSupabaseConfig();
  const pageSize = parseInt(getSetting('PAGE_SIZE', '25'));

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .eq('created_by', session.user.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      query = query.range(startIndex, startIndex + pageSize - 1);

      const { data, error, count } = await query;
      
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
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, currentPage, pageSize]);

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
        title: "Success",
        description: getText('contact_deleted', 'Contact deleted successfully!'),
      });
      
      fetchContacts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    contacts,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    deleteContact,
    refetchContacts: fetchContacts
  };
};
