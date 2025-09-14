// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GitHubUser {
  user_id: string;
  github_id: number;
  username: string;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  updated_at: string;
}

interface GitHubRepository {
  github_user_id: string;
  repo_id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  languages: Record<string, number>;
  topics: string[];
  is_fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  last_synced: string;
}

interface GitHubContribution {
  github_user_id: string;
  repo_id: number;
  commit_count: number;
  additions: number;
  deletions: number;
  contribution_period: string;
  updated_at: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, userId } = await req.json()

    if (!username || !userId) {
      console.error('Missing username or userId:', { username, userId });
      return new Response(
        JSON.stringify({ error: 'Username and userId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
  // @ts-ignore
  const supabaseUrl = typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_URL') : '';
  // @ts-ignore
  const supabaseKey = typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') : '';
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !user) {
      console.error('Invalid user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user', details: userError }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch GitHub user data
    const githubResponse = await fetch(`https://api.github.com/users/${username}`)
    if (!githubResponse.ok) {
      console.error('GitHub user not found:', username);
      return new Response(
        JSON.stringify({ error: 'GitHub user not found', details: await githubResponse.text() }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const githubUserData = await githubResponse.json()

    // Check if GitHub user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('github_users')
      .select('*')
      .eq('github_id', githubUserData.id)
      .single()
    if (existingUserError) {
      console.error('Error checking existing GitHub user:', existingUserError);
    }

    const githubUser: GitHubUser = {
      user_id: userId,
      github_id: githubUserData.id,
      username: githubUserData.login,
      avatar_url: githubUserData.avatar_url,
      bio: githubUserData.bio,
      public_repos: githubUserData.public_repos,
      followers: githubUserData.followers,
      following: githubUserData.following,
      html_url: githubUserData.html_url,
      updated_at: new Date().toISOString(),
    }

    let storedUser
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('github_users')
        .update(githubUser)
        .eq('id', existingUser.id)
        .select()
        .single()
      if (error) {
        console.error('Error updating GitHub user:', error);
        throw error
      }
      storedUser = data
    } else {
      // Insert new user
      const { data, error } = await supabase
        .from('github_users')
        .insert(githubUser)
        .select()
        .single()
      if (error) {
        console.error('Error inserting GitHub user:', error);
        throw error
      }
      storedUser = data
    }

    // Fetch and store repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=all`)
    if (reposResponse.ok) {
      const repositories = await reposResponse.json()
      for (const repo of repositories) {
        try {
          // Get languages for each repository
          const languagesResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`)
          const languages = languagesResponse.ok ? await languagesResponse.json() : {}

          // Get repository topics
          const topicsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/topics`, {
            headers: {
              'Accept': 'application/vnd.github.mercy-preview+json'
            }
          })
          const topicsData = topicsResponse.ok ? await topicsResponse.json() : { names: [] }

          const repository: GitHubRepository = {
            github_user_id: storedUser.id,
            repo_id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            languages: languages,
            topics: topicsData.names || [],
            is_fork: repo.fork,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            pushed_at: repo.pushed_at,
            last_synced: new Date().toISOString(),
          }

          // Upsert repository
          const { error: repoUpsertError } = await supabase
            .from('github_repositories')
            .upsert(repository, { onConflict: 'repo_id' })
          if (repoUpsertError) {
            console.error(`Error storing repository ${repo.name}:`, repoUpsertError);
          }
        } catch (repoError) {
          console.error(`Error processing repository ${repo.name}:`, repoError)
          continue
        }
      }
    } else {
      console.error('Error fetching repositories:', await reposResponse.text());
    }

    // Extract skills from GitHub data
    const skills = await extractSkillsFromGitHubData(supabase, storedUser.id)

    // Update user profile with GitHub connection and skills
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ 
        github_connected: true,
        github_url: `https://github.com/${username}`,
        skills: skills,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    if (profileUpdateError) {
      console.error('Error updating user profile:', profileUpdateError);
    }

    return new Response(
      JSON.stringify({
        message: 'GitHub data synced successfully',
        githubUser: storedUser,
        skills: skills
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('GitHub sync error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync GitHub data',
        details: error instanceof Error ? error.message : JSON.stringify(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function extractSkillsFromGitHubData(supabase: any, githubUserId: string): Promise<string[]> {
  try {
    // Get repositories and their languages
    const { data: repositories } = await supabase
      .from('github_repositories')
      .select('languages, topics, description')
      .eq('github_user_id', githubUserId)

    const skills = new Set<string>()

    repositories?.forEach((repo: any) => {
      // Add programming languages
      if (repo.languages) {
        Object.keys(repo.languages).forEach((lang: string) => {
          skills.add(lang.toLowerCase())
        })
      }

      // Add topics/technologies
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach((topic: string) => {
          skills.add(topic.toLowerCase())
        })
      }

      // Extract skills from repository description
      if (repo.description) {
        const techKeywords = extractTechKeywords(repo.description)
        techKeywords.forEach((keyword: string) => skills.add(keyword))
      }
    })

    return Array.from(skills)
  } catch (error) {
    console.error('Error extracting skills:', error)
    return []
  }
}

function extractTechKeywords(text: string): string[] {
  const techPatterns = [
    // Web Technologies
    /react/i, /vue/i, /angular/i, /svelte/i, /nextjs/i, /nuxt/i,
    /javascript/i, /typescript/i, /html/i, /css/i, /sass/i, /scss/i,
    /nodejs/i, /express/i, /fastify/i, /nestjs/i,
    
    // Databases
    /mongodb/i, /postgresql/i, /mysql/i, /redis/i, /sqlite/i, /supabase/i, /firebase/i,
    
    // Cloud & DevOps
    /aws/i, /azure/i, /gcp/i, /docker/i, /kubernetes/i, /terraform/i,
    /ci\/cd/i, /github actions/i, /jenkins/i,
    
    // Mobile
    /react native/i, /flutter/i, /swift/i, /kotlin/i, /ionic/i,
    
    // Data Science & AI
    /python/i, /machine learning/i, /deep learning/i, /tensorflow/i, /pytorch/i,
    /pandas/i, /numpy/i, /scikit-learn/i, /jupyter/i,
    
    // Other Technologies
    /api/i, /rest/i, /graphql/i, /microservices/i, /blockchain/i,
    /testing/i, /jest/i, /cypress/i, /selenium/i,
  ]

  const keywords: string[] = []
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      keywords.push(matches[0].toLowerCase())
    }
  })

  return keywords
}
