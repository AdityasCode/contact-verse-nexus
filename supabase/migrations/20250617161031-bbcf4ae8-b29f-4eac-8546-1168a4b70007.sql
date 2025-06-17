
-- Create ui_texts table for dynamic UI text
CREATE TABLE public.ui_texts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settings table for app configuration
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create validation_rules table for form validation
CREATE TABLE public.validation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'required', 'email', 'min_length', 'max_length', 'regex'
  rule_value TEXT, -- for min/max length, regex patterns
  error_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create error_logs table for global error tracking
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.ui_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access on config tables
CREATE POLICY "Anyone can read ui_texts" ON public.ui_texts FOR SELECT USING (true);
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Anyone can read validation_rules" ON public.validation_rules FOR SELECT USING (true);

-- Create policy for error_logs - users can insert their own errors
CREATE POLICY "Users can insert their own error logs" ON public.error_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can read their own error logs" ON public.error_logs FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Insert default UI texts
INSERT INTO public.ui_texts (key, value, description) VALUES
('auth_error', 'Authentication failed. Please check your credentials and try again.', 'Error message for authentication failures'),
('rate_limit', 'Too many requests. Please wait before trying again.', 'Rate limit error message'),
('session_expired', 'Your session has expired. Please log in again.', 'Session expiration message'),
('empty_contacts', 'No contacts found. Start by adding your first contact!', 'Message when no contacts exist'),
('no_search_results', 'No contacts match your search criteria.', 'Message when search returns no results'),
('not_found', 'The requested contact was not found.', 'Contact not found error'),
('global_error', 'An unexpected error occurred. Please refresh the page and try again.', 'Global error boundary message'),
('404_title', 'Page Not Found', '404 page title'),
('404_body', 'The page you are looking for does not exist.', '404 page body text'),
('login_title', 'Welcome Back', 'Login page title'),
('login_subtitle', 'Sign in to your Contact Manager account', 'Login page subtitle'),
('signup_title', 'Create Account', 'Signup page title'),
('signup_subtitle', 'Join Contact Manager to organize your contacts', 'Signup page subtitle'),
('email_label', 'Email Address', 'Email input label'),
('password_label', 'Password', 'Password input label'),
('signin_button', 'Sign In', 'Sign in button text'),
('signup_button', 'Create Account', 'Sign up button text'),
('contact_added', 'Contact added successfully!', 'Success message for adding contact'),
('contact_updated', 'Contact updated successfully!', 'Success message for updating contact'),
('contact_deleted', 'Contact deleted successfully!', 'Success message for deleting contact');

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
('default_landing', '/', 'Default landing page URL after login'),
('not_found_redirect', '/', 'Redirect URL for 404 errors'),
('PAGE_SIZE', '25', 'Number of contacts per page'),
('login_url', '/login', 'Login page URL'),
('contacts_url', '/contacts', 'Contacts list URL');

-- Insert default validation rules
INSERT INTO public.validation_rules (field_name, rule_type, rule_value, error_message) VALUES
('email', 'required', NULL, 'Email is required'),
('email', 'email', NULL, 'Please enter a valid email address'),
('first_name', 'required', NULL, 'First name is required'),
('last_name', 'required', NULL, 'Last name is required'),
('password', 'required', NULL, 'Password is required'),
('password', 'min_length', '6', 'Password must be at least 6 characters long');
