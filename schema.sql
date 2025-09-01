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
-- You might want to restrict this further based on your app's needs.
-- For a production app, you'd likely want to base this on user authentication.
CREATE POLICY "Allow public read access" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.attendance FOR SELECT USING (true);

-- Create policies to allow authenticated users to perform all actions.
-- This is a common setup, but you should tailor policies to your security requirements.
CREATE POLICY "Allow all access for authenticated users" ON public.employees FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all access for authenticated users" ON public.attendance FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
