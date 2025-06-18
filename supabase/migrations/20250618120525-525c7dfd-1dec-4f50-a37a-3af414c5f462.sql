
-- Create contact_history table to track changes to contacts
CREATE TABLE public.contact_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see history for their own contacts
ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view history for contacts they own
CREATE POLICY "Users can view history for their own contacts" 
  ON public.contact_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE contacts.id = contact_history.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

-- Create policy that allows users to insert history for their own contacts
CREATE POLICY "Users can create history for their own contacts" 
  ON public.contact_history 
  FOR INSERT 
  WITH CHECK (
    changed_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE contacts.id = contact_history.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

-- Add RLS policies for reminders table (ensure users can only access their own reminders)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own reminders
CREATE POLICY "Users can view their own reminders" 
  ON public.reminders 
  FOR SELECT 
  USING (auth.uid() = created_by);

-- Create policy that allows users to create their own reminders
CREATE POLICY "Users can create their own reminders" 
  ON public.reminders 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Create policy that allows users to update their own reminders
CREATE POLICY "Users can update their own reminders" 
  ON public.reminders 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policy that allows users to delete their own reminders
CREATE POLICY "Users can delete their own reminders" 
  ON public.reminders 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Enable pg_cron extension for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
