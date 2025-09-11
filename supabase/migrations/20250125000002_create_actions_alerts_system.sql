-- Create actions and alerts system for Skillora
-- This migration creates tables for managing user actions, alerts, and AI-generated insights

-- Create user_actions table
CREATE TABLE IF NOT EXISTS user_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('action', 'alert', 'reminder', 'achievement', 'recommendation')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_text VARCHAR(100),
    action_url TEXT,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed', 'expired')),
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skill_insights table for AI-generated insights
CREATE TABLE IF NOT EXISTS user_skill_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('skill_gap', 'learning_recommendation', 'career_opportunity', 'progress_milestone', 'market_trend')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    source_data JSONB DEFAULT '{}',
    is_actionable BOOLEAN DEFAULT true,
    generated_by VARCHAR(50) DEFAULT 'deepseek_ai',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create user_learning_activity table to track learning progress
CREATE TABLE IF NOT EXISTS user_learning_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('course_completed', 'skill_practiced', 'project_uploaded', 'assessment_taken', 'goal_achieved')),
    platform VARCHAR(100),
    skill_name VARCHAR(100),
    course_name VARCHAR(255),
    progress_percentage DECIMAL(5,2),
    time_spent_minutes INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_goals table for tracking user goals
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('skill_mastery', 'career_change', 'project_completion', 'certification', 'job_application')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    current_progress DECIMAL(5,2) DEFAULT 0,
    target_progress DECIMAL(5,2) DEFAULT 100,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    skills_required TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_status ON user_actions(status);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_skill_insights_user_id ON user_skill_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_insights_type ON user_skill_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_user_skill_insights_created_at ON user_skill_insights(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_learning_activity_user_id ON user_learning_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_activity_type ON user_learning_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_learning_activity_created_at ON user_learning_activity(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_created_at ON user_goals(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own actions" ON user_actions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions" ON user_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions" ON user_actions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actions" ON user_actions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own skill insights" ON user_skill_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill insights" ON user_skill_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own learning activity" ON user_learning_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning activity" ON user_learning_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goals" ON user_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON user_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON user_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON user_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_actions_updated_at BEFORE UPDATE ON user_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate AI insights based on user data
CREATE OR REPLACE FUNCTION generate_skill_insights(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    user_skills TEXT[];
    recent_activity JSONB;
    skill_gaps TEXT[];
    recommendations TEXT[];
BEGIN
    -- Get user's current skills from profiles table
    SELECT skills INTO user_skills
    FROM profiles
    WHERE user_id = p_user_id;
    
    -- Get recent learning activity
    SELECT jsonb_agg(
        jsonb_build_object(
            'activity_type', activity_type,
            'skill_name', skill_name,
            'created_at', created_at,
            'progress', progress_percentage
        )
    ) INTO recent_activity
    FROM user_learning_activity
    WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '30 days';
    
    -- This function would typically call an external AI service
    -- For now, we'll create placeholder insights
    -- In production, this would be replaced with actual AI analysis
    
    -- Insert skill gap insights
    INSERT INTO user_skill_insights (user_id, insight_type, title, description, confidence_score, source_data)
    VALUES (
        p_user_id,
        'skill_gap',
        'JavaScript ES6+ Skills Gap Detected',
        'Based on your recent activity, consider learning modern JavaScript features like async/await, destructuring, and modules.',
        0.85,
        jsonb_build_object('skills_analyzed', user_skills, 'activity_data', recent_activity)
    );
    
    -- Insert learning recommendations
    INSERT INTO user_skill_insights (user_id, insight_type, title, description, confidence_score, source_data)
    VALUES (
        p_user_id,
        'learning_recommendation',
        'React Hooks Mastery Path',
        'Your React skills show good fundamentals. Consider diving deeper into custom hooks and advanced patterns.',
        0.78,
        jsonb_build_object('current_skills', user_skills, 'recommended_focus', 'React Hooks')
    );
    
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired actions
CREATE OR REPLACE FUNCTION cleanup_expired_actions()
RETURNS VOID AS $$
BEGIN
    UPDATE user_actions
    SET status = 'expired'
    WHERE expires_at < NOW()
    AND status = 'pending';
    
    DELETE FROM user_skill_insights
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (this would be set up in Supabase dashboard)
-- SELECT cron.schedule('cleanup-expired-actions', '0 2 * * *', 'SELECT cleanup_expired_actions();');

-- Insert some sample data for testing
INSERT INTO user_actions (user_id, type, priority, title, description, action_text, action_url, category, status)
SELECT 
    auth.uid(),
    'action',
    'high',
    'Complete GitHub Profile Setup',
    'Connect your GitHub account to get personalized skill analysis and project insights.',
    'Connect GitHub',
    'https://github.com',
    'Profile Setup',
    'pending'
WHERE auth.uid() IS NOT NULL;

INSERT INTO user_actions (user_id, type, priority, title, description, action_text, action_url, category, status)
SELECT 
    auth.uid(),
    'recommendation',
    'medium',
    'New Course Recommendation',
    'Based on your skills, we recommend "Advanced React Patterns" course.',
    'View Course',
    'https://example.com/course',
    'Learning',
    'pending'
WHERE auth.uid() IS NOT NULL;

INSERT INTO user_actions (user_id, type, priority, title, description, category, status)
SELECT 
    auth.uid(),
    'achievement',
    'low',
    'Skill Milestone Reached!',
    'You''ve completed 5 JavaScript courses this month. Great progress!',
    'Achievement',
    'completed'
WHERE auth.uid() IS NOT NULL;

