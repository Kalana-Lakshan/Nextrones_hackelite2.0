# Skillora Real-Time Actions & Alerts Setup

## 🚀 Quick Setup Guide

### 1. Database Migration
Run the SQL migrations in your Supabase dashboard in this order:
1. `20250125000002_create_actions_alerts_system.sql` - Creates the actions and alerts tables
2. `20250125000003_add_missing_profile_fields.sql` - Adds missing profile fields for AI analysis

### 2. Environment Variables
Add these to your `.env` file:
```env
# DeepSeek AI Configuration
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Get DeepSeek API Key
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up for an account
3. Create an API key
4. Add it to your environment variables

### 4. Enable Real-Time in Supabase
1. Go to your Supabase dashboard
2. Navigate to Database → Replication
3. Enable real-time for these tables:
   - `user_actions`
   - `user_skill_insights`
   - `user_learning_activity`
   - `user_goals`

## 🔧 How It Works

### Real-Time Updates
- The system uses Supabase real-time subscriptions
- Actions and alerts update automatically when data changes
- No page refresh needed for live updates

### AI Analysis
- DeepSeek AI analyzes user profile and learning activity
- Generates personalized insights and recommendations
- Creates actionable items based on user data

### Profile Requirements
- Users need to complete their profile with skills, interests, and goals
- The system will prompt users to complete their profile if missing
- AI analysis requires at least some profile data to work effectively

## 🎯 Features

### Actions & Alerts
- **Real-time updates** via Supabase subscriptions
- **AI-generated insights** using DeepSeek
- **Priority-based categorization** (high, medium, low)
- **Interactive actions** (complete, dismiss, follow links)
- **Achievement tracking** and progress display

### Profile Setup
- **Guided profile completion** with interactive form
- **Skill, interest, and goal management**
- **Experience level selection**
- **Automatic profile creation** for new users

### AI Integration
- **Skill gap analysis** based on user data
- **Learning recommendations** personalized to user profile
- **Career opportunity insights** aligned with goals
- **Progress milestone detection** and celebration

## 🐛 Troubleshooting

### "Profile needed" Error
This error occurs when:
1. User profile is missing required fields
2. Profile has no skills, interests, or goals
3. Database migration hasn't been run

**Solution:**
1. Run the database migrations
2. Complete your profile using the "Complete Profile" button
3. Add at least one skill, interest, or goal

### AI Analysis Not Working
Check:
1. DeepSeek API key is correctly set
2. User has completed profile with some data
3. Network connection is working
4. API key has sufficient credits

### Real-Time Updates Not Working
Verify:
1. Real-time is enabled in Supabase dashboard
2. Tables have proper RLS policies
3. User is authenticated
4. WebSocket connection is established

## 📊 Database Schema

### Key Tables
- `user_actions` - Stores user actions, alerts, and reminders
- `user_skill_insights` - AI-generated insights and recommendations
- `user_learning_activity` - Tracks learning progress and activities
- `user_goals` - Manages user goals and targets
- `profiles` - Enhanced with new fields for AI analysis

### Real-Time Subscriptions
- All tables have real-time subscriptions enabled
- Changes trigger automatic UI updates
- No manual refresh needed

## 🎉 Success Indicators

You'll know the system is working when:
1. Actions and alerts appear in real-time
2. AI analysis button generates new insights
3. Profile setup form appears for incomplete profiles
4. Actions can be completed and dismissed
5. Real-time updates work without page refresh

## 🔄 Next Steps

1. **Test the system** by completing your profile
2. **Generate AI insights** using the analysis button
3. **Complete some actions** to see real-time updates
4. **Add learning activities** to trigger automatic analysis
5. **Customize the AI prompts** in `deepseekService.ts` for your needs

The system is now ready to provide intelligent, real-time personalized guidance for your users!

