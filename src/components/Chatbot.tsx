import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Maximize2, Minimize2, X, ArrowLeft, Plus, MessageSquare, Trash2, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserKnowledgeProfile } from '@/hooks/useUserKnowledgeProfile';
import { useChatbotInteractions } from '@/hooks/useChatbotInteractions';
import { useJobsApi } from '@/hooks/useJobsApi';
import { useRoadmapAi } from '@/hooks/useRoadmapAi';
import { useSavedChats } from '@/hooks/useSavedChats';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Chatbot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { knowledgeProfile, profile, loading: profileLoading } = useUserKnowledgeProfile();
  const { logInteraction } = useChatbotInteractions();
  const { getJobMarketInsights, getJobsBySkills } = useJobsApi();
  const { generatePersonalizedRoadmap, loading: roadmapLoading } = useRoadmapAi();
  const { savedChats, loading: chatsLoading, saveChat, updateChat, deleteChat } = useSavedChats();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [jobData, setJobData] = useState<any>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize personalized greeting
  useEffect(() => {
    if (!profileLoading && !initialized) {
      const generatePersonalizedGreeting = () => {
        const userName = profile?.full_name || 'there';
        const userSkills = knowledgeProfile?.skills || profile?.skills || [];
        const careerGoals = knowledgeProfile?.career_goals || [];
        const experienceLevel = knowledgeProfile?.experience_level || 'beginner';
        
        let greeting = `Hello ${userName}! 👋 I'm your AI Career Assistant. `;
        
        if (userSkills.length > 0) {
          greeting += `I can see you're interested in ${userSkills.slice(0, 3).join(', ')}`;
          if (userSkills.length > 3) {
            greeting += ` and ${userSkills.length - 3} other skills`;
          }
          greeting += '. ';
        }
        
        if (careerGoals.length > 0) {
          greeting += `I notice your career goals include ${careerGoals.slice(0, 2).join(' and ')}. `;
        }
        
        greeting += `As a ${experienceLevel} professional, I'm here to help you with career guidance, skill development, job search strategies, interview preparation, and creating personalized learning roadmaps. What would you like to work on today?`;
        
        return greeting;
      };

      const greeting = generatePersonalizedGreeting();
      
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      }]);
      
      setInitialized(true);
      
      // Log the initial greeting
      logInteraction('assistant', greeting);
    }
  }, [profileLoading, initialized, profile, knowledgeProfile, logInteraction]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Log user message
    await logInteraction('user', messageContent);

    // Check if this is a roadmap request
    if (isRoadmapRequest(messageContent)) {
      try {
        const roadmapResponse = await generateRoadmapFromChat(messageContent);
        
        // Add roadmap response to chat
        const newRoadmapMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: roadmapResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, newRoadmapMessage]);

        // Log the interaction
        await logInteraction('assistant', roadmapResponse, {
          responseMetadata: {
            isRoadmapGeneration: true,
            roadmapGenerated: true,
            userProfile: {
              skills: knowledgeProfile?.skills || profile?.skills || [],
              interests: knowledgeProfile?.interests || [],
              goals: knowledgeProfile?.career_goals || [],
              experience: knowledgeProfile?.experience_level || 'beginner'
            }
          }
        });

        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error generating roadmap:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while generating your roadmap. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
    }

    // Fetch relevant job data if the message is job-related
    await fetchRelevantJobData(messageContent);

    try {
      // Make direct API call to OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://learn-roadmap-genie.vercel.app",
          "X-Title": "Learn Roadmap Genie",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "system",
              content: `You are an AI Career Assistant with access to real-time job market data. You have access to the user's profile information:

USER PROFILE:
- Name: ${profile?.full_name || 'Not provided'}
- Skills: ${(knowledgeProfile?.skills || profile?.skills || []).join(', ') || 'Not specified'}
- Career Goals: ${(knowledgeProfile?.career_goals || []).join(', ') || 'Not specified'}
- Experience Level: ${knowledgeProfile?.experience_level || 'Not specified'}
- Preferred Locations: ${(knowledgeProfile?.preferred_locations || []).join(', ') || 'Not specified'}

${jobData ? `CURRENT JOB MARKET DATA (as of ${new Date(jobData.timestamp).toLocaleString()}):
- Total Available Jobs: ${jobData.insights.totalJobs}
- Top Companies Hiring: ${jobData.insights.topCompanies.join(', ')}
- In-Demand Skills: ${jobData.insights.inDemandSkills.join(', ')}
- Job Trends: ${jobData.insights.jobTrends.join(', ')}

RECENT JOB LISTINGS:
${jobData.jobs.map((job: any, index: number) => `
${index + 1}. ${job.title} at ${job.company}
   Location: ${job.location}
   Skills Required: ${job.skills?.join(', ') || 'Not specified'}
   ${job.salary ? `Salary: ${job.salary}` : ''}
   ${job.url ? `Apply: ${job.url}` : ''}
`).join('')}` : ''}

INSTRUCTIONS:
- Use the real-time job market data to provide current, relevant career advice
- Reference specific companies and job opportunities when appropriate
- Highlight in-demand skills and market trends
- Provide actionable recommendations based on current job openings
- Be specific about salary expectations and job requirements when data is available
- Always prioritize the most recent and relevant information
- If users ask about learning paths, roadmaps, or study plans, mention that you can generate personalized roadmaps by asking "generate a roadmap for [career goal]"
- You can generate roadmaps for any career including: Business Analyst, Data Scientist, Software Developer, UX Designer, Product Manager, etc.
- When users say things like "I want to be a business analyst" or "generate a roadmap I want to be a business analyst", automatically generate a personalized roadmap and convert it to todo items`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: inputValue.trim()
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const completion = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: completion.choices[0].message.content || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Log assistant response
      await logInteraction('assistant', assistantMessage.content, {
        responseMetadata: {
          model: 'deepseek/deepseek-r1:free',
          timestamp: assistantMessage.timestamp.toISOString(),
          jobDataUsed: jobData ? true : false,
          jobDataTimestamp: jobData?.timestamp
        }
      });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Log error response
      await logInteraction('assistant', errorMessage.content, {
        responseMetadata: {
          error: true,
          timestamp: errorMessage.timestamp.toISOString()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const saveCurrentChat = async () => {
    if (messages.length === 0) return;
    
    const chatTitle = messages[0]?.content?.substring(0, 50) + '...' || 'New Chat';
    const chatId = await saveChat(chatTitle, messages);
    
    if (chatId) {
      setCurrentChatId(chatId);
      toast({
        title: "Chat saved successfully",
        description: "Your conversation has been saved to your account.",
      });
    } else {
      toast({
        title: "Failed to save chat",
        description: "There was an error saving your conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadChat = (chatId: string) => {
    const chat = savedChats.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const success = await deleteChat(chatId);
    
    if (success) {
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
      }
      toast({
        title: "Chat deleted",
        description: "The conversation has been permanently deleted.",
      });
    } else {
      toast({
        title: "Failed to delete chat",
        description: "There was an error deleting the conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  // Function to render message content with clickable links
  const renderMessageContent = (content: string) => {
    // Convert markdown-style links to clickable elements
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = content.split(linkRegex);
    
    return parts.map((part, index) => {
      if (index % 3 === 0) {
        // Regular text
        return <span key={index}>{part}</span>;
      } else if (index % 3 === 1) {
        // Link text
        const linkUrl = parts[index + 1];
        return (
          <button
            key={index}
            onClick={() => navigate(linkUrl)}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {part}
          </button>
        );
      }
      return null;
    });
  };

  // Auto-save chat when messages change (if we have a current chat)
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const chatTitle = messages[0]?.content?.substring(0, 50) + '...' || 'New Chat';
      updateChat(currentChatId, chatTitle, messages);
    }
  }, [messages, currentChatId, updateChat]);

  // Function to detect if user is asking for roadmap generation
  const isRoadmapRequest = (message: string): boolean => {
    const roadmapKeywords = [
      'generate roadmap',
      'create roadmap',
      'make roadmap',
      'roadmap for',
      'learning roadmap',
      'career roadmap',
      'study roadmap',
      'roadmap to become',
      'roadmap to learn',
      'roadmap to get',
      'roadmap to achieve',
      'i want to be',
      'i want to become',
      'help me become',
      'guide me to become',
      'path to become',
      'roadmap to be',
      'learning path',
      'career path',
      'study plan',
      'how to become',
      'steps to become'
    ];
    
    const lowerMessage = message.toLowerCase();
    return roadmapKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Function to extract job/career goal from roadmap request
  const extractCareerGoal = (message: string): string => {
    const patterns = [
      /roadmap for (.+)/i,
      /roadmap to become (.+)/i,
      /roadmap to learn (.+)/i,
      /roadmap to get (.+)/i,
      /roadmap to achieve (.+)/i,
      /generate roadmap for (.+)/i,
      /create roadmap for (.+)/i,
      /i want to be (.+)/i,
      /i want to become (.+)/i,
      /help me become (.+)/i,
      /guide me to become (.+)/i,
      /path to become (.+)/i,
      /roadmap to be (.+)/i,
      /learning path for (.+)/i,
      /career path for (.+)/i,
      /study plan for (.+)/i,
      /how to become (.+)/i,
      /steps to become (.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If no specific goal found, return a default
    return 'Software Developer';
  };

  // Function to generate roadmap and convert to todos
  const generateRoadmapFromChat = async (userMessage: string) => {
    try {
      const careerGoal = extractCareerGoal(userMessage);
      
      // Get user's current skills and job market data
      const userSkills = knowledgeProfile?.skills || profile?.skills || [];
      const userInterests = knowledgeProfile?.interests || [];
      const userLocation = knowledgeProfile?.preferred_locations?.[0] || 'us';
      
      // Fetch job market insights
      let jobMarketData = null;
      if (userSkills.length > 0) {
        try {
          const insights = await getJobMarketInsights(userSkills, userInterests, userLocation);
          const jobs = await getJobsBySkills(userSkills, userLocation, 1);
          jobMarketData = { insights, jobs: jobs.slice(0, 3) };
        } catch (error) {
          console.error('Error fetching job market data:', error);
        }
      }

      // Prepare parameters for AI roadmap generation
      const roadmapParams = {
        jobData: {
          job: careerGoal,
          description: `A ${careerGoal} position`,
          requirements: [],
          skills: userSkills
        },
        userProfile: {
          name: profile?.full_name || 'User',
          skills: userSkills,
          experienceLevel: knowledgeProfile?.experience_level || 'beginner',
          careerGoals: knowledgeProfile?.career_goals || [careerGoal],
          graduationDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
          freeTimePerWeek: 10
        },
        jobMarketData
      };

      // Generate AI roadmap
      const roadmapItems = await generatePersonalizedRoadmap(roadmapParams);
      
      if (roadmapItems.length > 0) {
        // Save roadmap to database
        await saveRoadmapToDatabase(roadmapItems, careerGoal);
        
        // Convert to todos
        await convertRoadmapToTodos(roadmapItems);
        
        // Return formatted roadmap response
        return formatRoadmapResponse(roadmapItems, careerGoal);
      }
      
      return "I couldn't generate a roadmap at this time. Please try again later.";
    } catch (error) {
      console.error('Error generating roadmap:', error);
      return "I encountered an error while generating your roadmap. Please try again.";
    }
  };

  // Function to save roadmap to database
  const saveRoadmapToDatabase = async (roadmapItems: any[], careerGoal: string) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Create a comprehensive roadmap title and description
      const roadmapTitle = `AI-Generated ${careerGoal} Roadmap`;
      const roadmapDescription = `Personalized learning path to become a ${careerGoal}, generated based on your profile and current job market trends.`;

      // Save the complete roadmap to saved_roadmaps table
      const { data, error } = await supabase
        .from('saved_roadmaps')
        .insert({
          user_id: user.id,
          title: roadmapTitle,
          description: roadmapDescription,
          career_goal: careerGoal,
          roadmap_items: roadmapItems,
          is_ai_generated: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving roadmap:', error);
        throw error;
      }

      // Also save individual items to roadmap_items table for backward compatibility
      const roadmapItemsToInsert = roadmapItems.map((item: any) => ({
        user_id: user.id,
        title: item.title,
        description: item.description,
        category: item.category,
        platform: item.platform,
        estimated_weeks: Math.ceil(item.estimatedHours / 10), // Rough estimate
        order_index: item.id
      }));

      const { error: itemsError } = await supabase
        .from('roadmap_items')
        .insert(roadmapItemsToInsert);

      if (itemsError) {
        console.error('Error saving roadmap items:', itemsError);
        // Don't throw here as the main roadmap is already saved
      }

      toast({
        title: "Roadmap Saved!",
        description: "Your AI-generated roadmap has been saved to the Saved Roadmaps section.",
      });

      return data;
    } catch (error) {
      console.error('Error saving roadmap to database:', error);
      throw error;
    }
  };

  // Function to convert roadmap to todos
  const convertRoadmapToTodos = async (roadmapItems: any[]) => {
    try {
      const todos = roadmapItems.flatMap((item: any, index: number) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (index * 7)); // Start each item a week apart
        
        const completeDate = new Date(startDate);
        completeDate.setDate(completeDate.getDate() + 14); // Give 2 weeks to complete each item

        return [
          {
            user_id: profile?.id,
            title: `📚 Start: ${item.title}`,
            description: `Begin learning: ${item.description}`,
            due_date: startDate.toISOString().split('T')[0],
            priority: 'high',
            completed: false
          },
          {
            user_id: profile?.id,
            title: `✅ Complete: ${item.title}`,
            description: `Finish and master: ${item.description}`,
            due_date: completeDate.toISOString().split('T')[0],
            priority: 'medium',
            completed: false
          }
        ];
      });

      const { error } = await supabase
        .from('todos')
        .insert(todos);

      if (error) {
        console.error('Error creating todos:', error);
        throw error;
      }

      toast({
        title: "🎯 Roadmap Generated & Todo List Created!",
        description: `Created ${todos.length} actionable tasks from your roadmap. Check the Todo List and Saved Roadmaps sections!`,
        action: (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/todo-list')}
            >
              📋 Todo List
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/saved-roadmaps')}
            >
              🗺️ Roadmaps
            </Button>
          </div>
        ),
      });
    } catch (error) {
      console.error('Error converting roadmap to todos:', error);
    }
  };

  // Function to format roadmap response for chat
  const formatRoadmapResponse = (roadmapItems: any[], careerGoal: string): string => {
    let response = `🎯 **Personalized Roadmap to become ${careerGoal}**\n\n`;
    response += `I've created a comprehensive learning path tailored to your profile and current job market trends.\n\n`;
    
    roadmapItems.forEach((item, index) => {
      response += `**${index + 1}. ${item.title}**\n`;
      response += `📅 Timeline: ${item.deadline}\n`;
      response += `⏱️ Estimated: ${item.estimatedHours} hours\n`;
      response += `📚 Platform: ${item.platform}\n`;
      response += `🎯 Skills: ${item.skills.join(', ')}\n`;
      response += `📖 Description: ${item.description}\n\n`;
    });
    
    response += `✅ **What happens next:**\n`;
    response += `• Your roadmap has been saved to the Explore section\n`;
    response += `• ${roadmapItems.length * 2} actionable todo items have been created\n`;
    response += `• Each milestone has "Start" and "Complete" tasks with realistic deadlines\n`;
    response += `• The roadmap is personalized based on your skills and interests\n\n`;
    
    response += `🔗 **Quick Links:**\n`;
    response += `• 📋 [View Todo List](/todo-list) - Track your progress\n`;
    response += `• 🗺️ [View Saved Roadmaps](/saved-roadmaps) - See all your roadmaps\n`;
    response += `• 🎯 [Explore Section](/dashboard) - Access your learning materials\n\n`;
    
    response += `🚀 **Ready to start your journey to becoming a ${careerGoal}?** Click the links above to begin!`;
    
    return response;
  };

  const fetchRelevantJobData = async (userMessage: string) => {
    const userSkills = knowledgeProfile?.skills || profile?.skills || [];
    const userInterests = knowledgeProfile?.interests || [];
    const userLocation = knowledgeProfile?.preferred_locations?.[0] || 'us';

    // Check if the message is about jobs
    const jobKeywords = ['job', 'jobs', 'career', 'employment', 'hiring', 'recruitment', 'position', 'role', 'work'];
    const isJobRelated = jobKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (isJobRelated && userSkills.length > 0) {
      try {
        // Get job market insights
        const insights = await getJobMarketInsights(userSkills, userInterests, userLocation);
        
        // Get specific jobs by skills
        const jobs = await getJobsBySkills(userSkills, userLocation, 1);
        
        setJobData({
          insights,
          jobs: jobs.slice(0, 5), // Limit to 5 most relevant jobs
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching job data:', error);
      }
    }
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Career Assistant</h1>
              <p className="text-sm text-gray-500">
                {profile?.full_name ? `Personalized for ${profile.full_name}` : 'Your personal career development companion'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fullscreen Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200">
                <Button
                  onClick={startNewChat}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </div>

              {/* Saved Chats List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {chatsLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                      <p className="text-sm">Loading chats...</p>
                    </div>
                  ) : (
                    <>
                      {savedChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                            currentChatId === chat.id
                              ? 'bg-blue-100 text-blue-900'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => loadChat(chat.id)}
                        >
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {chat.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(chat.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {savedChats.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No saved chats yet</p>
                          <p className="text-xs">Start a conversation to save it</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 px-6 py-4"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {renderMessageContent(message.content)}
                    </div>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-green-100 text-green-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">Analyzing your career question...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Fullscreen Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about career development, skills, job search, or learning paths..."
                  disabled={isLoading}
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3"
                />
                {messages.length > 0 && !currentChatId && (
                  <Button
                    onClick={saveCurrentChat}
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-xl h-12 w-12"
                    title="Save this chat"
                  >
                    <Edit3 className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 rounded-xl h-12 w-12"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                💼 Your AI Career Assistant is here to help with professional development
                {jobData && (
                  <span className="block mt-1 text-green-600">
                    📊 Real-time job market data included
                  </span>
                )}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      <Card className="flex-1 flex flex-col border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Career Assistant</h2>
                <p className="text-sm text-blue-100 font-normal">
                  {profile?.full_name ? `Personalized for ${profile.full_name}` : 'Your personal career development companion'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 px-4"
          >
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-10 w-10 border-2 border-blue-200">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {renderMessageContent(message.content)}
                    </div>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-10 w-10 border-2 border-green-200">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-10 w-10 border-2 border-blue-200">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">Analyzing your career question...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t border-gray-200 bg-white p-4 rounded-b-lg">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about career development, skills, job search, or learning paths..."
                disabled={isLoading}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-12 w-12"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💼 Your AI Career Assistant is here to help with professional development
              {jobData && (
                <span className="block mt-1 text-green-600">
                  📊 Real-time job market data included
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
