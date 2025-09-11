import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchParams } = new URL(req.url)
    const endpoint = searchParams.get('endpoint')
    const apiKey = searchParams.get('apiKey')
    
    if (!endpoint || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint or apiKey parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the NewsAPI URL
    const newsApiUrl = `https://newsapi.org/v2/${endpoint}&apiKey=${apiKey}`
    
    // Fetch from NewsAPI
    const response = await fetch(newsApiUrl, {
      headers: {
        'User-Agent': 'LearnRoadmapGenie/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in news-proxy:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch news data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

