
import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface ContactCsvData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  is_favorite: string; // CSV stores as string, we'll convert to boolean
}

export const useCsvUtils = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useAuth();

  const exportContacts = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('first_name, last_name, email, phone, company, notes, is_favorite')
        .eq('created_by', user.id)
        .order('first_name');

      if (error) {
        console.error('Error fetching contacts for export:', error);
        toast({
          title: "Export Failed",
          description: "Failed to fetch contacts for export",
          variant: "destructive",
        });
        return;
      }

      if (!contacts || contacts.length === 0) {
        toast({
          title: "No Contacts",
          description: "No contacts to export",
          variant: "destructive",
        });
        return;
      }

      // Convert contacts to CSV format
      const csvData = contacts.map(contact => ({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        notes: contact.notes || '',
        is_favorite: contact.is_favorite ? 'true' : 'false'
      }));

      const csv = Papa.unparse(csvData, {
        header: true,
        columns: ['first_name', 'last_name', 'email', 'phone', 'company', 'notes', 'is_favorite']
      });

      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${contacts.length} contacts to CSV`,
      });
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting contacts",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importContacts = async (file: File) => {
    if (!user) return;
    
    setIsImporting(true);
    try {
      Papa.parse<ContactCsvData>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              console.error('CSV parse errors:', results.errors);
              toast({
                title: "Import Failed",
                description: "Failed to parse CSV file",
                variant: "destructive",
              });
              return;
            }

            const contactsToInsert = results.data.map(row => ({
              first_name: row.first_name?.trim() || '',
              last_name: row.last_name?.trim() || '',
              email: row.email?.trim() || '',
              phone: row.phone?.trim() || null,
              company: row.company?.trim() || null,
              notes: row.notes?.trim() || null,
              is_favorite: row.is_favorite === 'true',
              created_by: user.id
            })).filter(contact => contact.first_name && contact.last_name && contact.email);

            if (contactsToInsert.length === 0) {
              toast({
                title: "Import Failed",
                description: "No valid contacts found in CSV file",
                variant: "destructive",
              });
              return;
            }

            const { error } = await supabase
              .from('contacts')
              .insert(contactsToInsert);

            if (error) {
              console.error('Error inserting contacts:', error);
              toast({
                title: "Import Failed",
                description: "Failed to import contacts to database",
                variant: "destructive",
              });
              return;
            }

            toast({
              title: "Import Successful",
              description: `Successfully imported ${contactsToInsert.length} contacts`,
            });

            // Refresh the page to show the new contacts
            window.location.reload();
          } catch (error) {
            console.error('Error processing import:', error);
            toast({
              title: "Import Failed",
              description: "An error occurred while importing contacts",
              variant: "destructive",
            });
          } finally {
            setIsImporting(false);
          }
        },
        error: (error) => {
          console.error('CSV parse error:', error);
          toast({
            title: "Import Failed",
            description: "Failed to read CSV file",
            variant: "destructive",
          });
          setIsImporting(false);
        }
      });
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: "Import Failed",
        description: "An error occurred while importing contacts",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importContacts(file);
      }
    };
    input.click();
  };

  return {
    exportContacts,
    handleImportClick,
    isExporting,
    isImporting
  };
};
