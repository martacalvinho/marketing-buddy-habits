-- Create platform_streaks table for tracking streaks per marketing platform
CREATE TABLE public.platform_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.platform_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for platform_streaks
CREATE POLICY "Users can view their own platform streaks" 
ON public.platform_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own platform streaks" 
ON public.platform_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform streaks" 
ON public.platform_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_platform_streaks_updated_at
BEFORE UPDATE ON public.platform_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_platform_streaks_user_platform ON public.platform_streaks(user_id, platform);