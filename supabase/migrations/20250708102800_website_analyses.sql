-- Create website_analyses table for storing multiple analyses with topics
CREATE TABLE public.website_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  website_url TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  analysis_topics TEXT[] NOT NULL DEFAULT '{}',
  market_opportunities INTEGER DEFAULT 0,
  action_items INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.website_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for website_analyses
CREATE POLICY "Users can view their own analyses" 
ON public.website_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
ON public.website_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
ON public.website_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON public.website_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_website_analyses_user_id ON public.website_analyses(user_id);
CREATE INDEX idx_website_analyses_created_at ON public.website_analyses(created_at DESC);
CREATE INDEX idx_website_analyses_topics ON public.website_analyses USING GIN(analysis_topics);
