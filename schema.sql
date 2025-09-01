-- Create the employees table
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NULL,
  age integer NULL,
  address text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  daily_allowance integer NULL,
  CONSTRAINT employees_pkey PRIMARY KEY (id)
);

-- Create the attendance table
CREATE TABLE public.attendance (
  employee_id uuid NOT NULL,
  date date NOT NULL,
  status text NOT NULL,
  allowance integer NULL,
  CONSTRAINT attendance_pkey PRIMARY KEY (employee_id, date),
  CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) on your tables
-- This is a recommended security practice for Supabase.
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access to the data.
CREATE POLICY "Allow public read access" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.attendance FOR SELECT USING (true);

-- Create policies to allow anonymous users to insert, update, and delete.
-- For a public app, we use the 'anon' role.
-- For an app with logins, you would use 'authenticated'.
CREATE POLICY "Allow anonymous user access to insert" ON public.employees FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow anonymous user access to update" ON public.employees FOR UPDATE USING (auth.role() = 'anon');
CREATE POLICY "Allow anonymous user access to delete" ON public.employees FOR DELETE USING (auth.role() = 'anon');

CREATE POLICY "Allow anonymous user access to insert" ON public.attendance FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow anonymous user access to update" ON public.attendance FOR UPDATE USING (auth.role() = 'anon');
CREATE POLICY "Allow anonymous user access to delete" ON public.attendance FOR DELETE USING (auth.role() = 'anon');
