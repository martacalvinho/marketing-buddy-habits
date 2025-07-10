-- Add website_analysis_id foreign key to tasks table to support multi-website functionality
ALTER TABLE public.tasks 
ADD COLUMN website_analysis_id UUID REFERENCES public.website_analyses(id);

-- Create index for better query performance
CREATE INDEX idx_tasks_website_analysis_id ON public.tasks(website_analysis_id);

-- Update existing tasks to reference the user's first website analysis (if any)
UPDATE public.tasks 
SET website_analysis_id = (
  SELECT wa.id 
  FROM public.website_analyses wa 
  WHERE wa.user_id = tasks.user_id 
  ORDER BY wa.created_at ASC 
  LIMIT 1
)
WHERE website_analysis_id IS NULL;