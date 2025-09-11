-- Create GitHub integration tables for Skillora
-- This migration creates tables for storing GitHub user data, repositories, and contributions

-- Create github_users table
CREATE TABLE IF NOT EXISTS public.github_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    github_id BIGINT NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    public_repos INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    html_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create github_repositories table
CREATE TABLE IF NOT EXISTS public.github_repositories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    github_user_id UUID NOT NULL REFERENCES public.github_users(id) ON DELETE CASCADE,
    repo_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    description TEXT,
    html_url TEXT,
    stargazers_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    language VARCHAR(100),
    languages JSONB DEFAULT '{}',
    topics TEXT[] DEFAULT '{}',
    is_fork BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    pushed_at TIMESTAMP WITH TIME ZONE,
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create github_contributions table
CREATE TABLE IF NOT EXISTS public.github_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    github_user_id UUID NOT NULL REFERENCES public.github_users(id) ON DELETE CASCADE,
    repo_id BIGINT NOT NULL,
    commit_count INTEGER DEFAULT 0,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    contribution_period DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(github_user_id, repo_id, contribution_period)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_github_users_user_id ON public.github_users(user_id);
CREATE INDEX IF NOT EXISTS idx_github_users_github_id ON public.github_users(github_id);
CREATE INDEX IF NOT EXISTS idx_github_users_username ON public.github_users(username);

CREATE INDEX IF NOT EXISTS idx_github_repositories_github_user_id ON public.github_repositories(github_user_id);
CREATE INDEX IF NOT EXISTS idx_github_repositories_repo_id ON public.github_repositories(repo_id);
CREATE INDEX IF NOT EXISTS idx_github_repositories_language ON public.github_repositories(language);
CREATE INDEX IF NOT EXISTS idx_github_repositories_stargazers_count ON public.github_repositories(stargazers_count DESC);

CREATE INDEX IF NOT EXISTS idx_github_contributions_github_user_id ON public.github_contributions(github_user_id);
CREATE INDEX IF NOT EXISTS idx_github_contributions_repo_id ON public.github_contributions(repo_id);
CREATE INDEX IF NOT EXISTS idx_github_contributions_period ON public.github_contributions(contribution_period);

-- Enable RLS on all tables
ALTER TABLE public.github_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_contributions ENABLE ROW LEVEL SECURITY;

-- GitHub users policies
CREATE POLICY "Users can view their own GitHub data" 
ON public.github_users FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GitHub data" 
ON public.github_users FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub data" 
ON public.github_users FOR UPDATE 
USING (auth.uid() = user_id);

-- GitHub repositories policies
CREATE POLICY "Users can view repositories for their GitHub account" 
ON public.github_repositories FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.github_users 
        WHERE github_users.id = github_repositories.github_user_id 
        AND github_users.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert repositories for their GitHub account" 
ON public.github_repositories FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.github_users 
        WHERE github_users.id = github_repositories.github_user_id 
        AND github_users.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update repositories for their GitHub account" 
ON public.github_repositories FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.github_users 
        WHERE github_users.id = github_repositories.github_user_id 
        AND github_users.user_id = auth.uid()
    )
);

-- GitHub contributions policies
CREATE POLICY "Users can view contributions for their GitHub account" 
ON public.github_contributions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.github_users 
        WHERE github_users.id = github_contributions.github_user_id 
        AND github_users.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert contributions for their GitHub account" 
ON public.github_contributions FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.github_users 
        WHERE github_users.id = github_contributions.github_user_id 
        AND github_users.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update contributions for their GitHub account" 
ON public.github_contributions FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.github_users 
        WHERE github_users.id = github_contributions.github_user_id 
        AND github_users.user_id = auth.uid()
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_github_users_updated_at 
    BEFORE UPDATE ON public.github_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_repositories_updated_at 
    BEFORE UPDATE ON public.github_repositories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_contributions_updated_at 
    BEFORE UPDATE ON public.github_contributions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
