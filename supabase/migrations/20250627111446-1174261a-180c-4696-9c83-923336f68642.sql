
-- Update the foreign key constraint to cascade deletes
-- First, drop the existing foreign key constraint
ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS reminders_contact_id_fkey;

-- Recreate the constraint with CASCADE DELETE
ALTER TABLE public.reminders 
ADD CONSTRAINT reminders_contact_id_fkey 
FOREIGN KEY (contact_id) 
REFERENCES public.contacts(id) 
ON DELETE CASCADE;
