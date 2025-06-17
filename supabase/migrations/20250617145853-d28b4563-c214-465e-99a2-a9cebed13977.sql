
-- Enable Row Level Security on the contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own contacts
CREATE POLICY "Users can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() = created_by);

-- Policy for users to insert their own contacts
CREATE POLICY "Users can create their own contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Policy for users to update their own contacts
CREATE POLICY "Users can update their own contacts" 
ON public.contacts 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Policy for users to delete their own contacts
CREATE POLICY "Users can delete their own contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() = created_by);

-- Make created_by column not nullable for security
ALTER TABLE public.contacts ALTER COLUMN created_by SET NOT NULL;
