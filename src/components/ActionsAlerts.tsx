import { useEffect, useState } from "react";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Target, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Star,
  ArrowRight,
  X,
  Sparkles,
  RefreshCw,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActionsAlerts } from "@/hooks/useActionsAlerts";
import { ProfileSetupPrompt } from "@/components/ProfileSetupPrompt";

interface ActionsAlertsProps {
  onActionsCountChange?: (count: number) => void;
}

export const ActionsAlerts = ({ onActionsCountChange }: ActionsAlertsProps) => {
  const {
    pendingActions,
    completedActions,
    loading,
    aiAnalyzing,
    completeAction,
    dismissAction,
    generateAIInsights,
    refreshData
  } = useActionsAlerts();
  
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  // Notify parent component about actions count changes
  useEffect(() => {
    onActionsCountChange?.(pendingActions.length);
  }, [pendingActions.length, onActionsCountChange]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'action':
        return <Target className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'achievement':
        return <Star className="h-4 w-4" />;
      case 'recommendation':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'action':
        return 'bg-blue-100 text-blue-800';
      case 'alert':
        return 'bg-orange-100 text-orange-800';
      case 'reminder':
        return 'bg-purple-100 text-purple-800';
      case 'achievement':
        return 'bg-green-100 text-green-800';
      case 'recommendation':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleAction = async (actionId: string) => {
    await completeAction(actionId);
  };

  const handleDismiss = async (actionId: string) => {
    await dismissAction(actionId);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading actions...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show profile setup prompt if profile is incomplete
  if (showProfileSetup) {
    return (
      <div className="space-y-3">
        <ProfileSetupPrompt onComplete={() => {
          setShowProfileSetup(false);
          setProfileIncomplete(false);
          refreshData();
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with AI Analysis Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Actions & Alerts</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateAIInsights}
          disabled={aiAnalyzing}
          className="gap-2"
        >
          {aiAnalyzing ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {aiAnalyzing ? 'Analyzing...' : 'AI Analysis'}
        </Button>
      </div>

      {/* Pending Actions */}
      <div className="space-y-2">
        {pendingActions.length > 0 ? (
          pendingActions.slice(0, 2).map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-full ${getTypeColor(action.type)}`}>
                    {getIcon(action.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-xs text-foreground truncate">
                        {action.title}
                      </h4>
                      <Badge variant={getPriorityColor(action.priority)} className="text-xs px-1 py-0">
                        {action.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {action.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(action.created_at)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {action.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {action.action_text && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs px-2"
                            onClick={() => {
                              if (action.action_url) {
                                window.open(action.action_url, '_blank');
                              }
                              handleAction(action.id);
                            }}
                          >
                            {action.action_text}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDismiss(action.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">All caught up! No pending actions.</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIInsights}
                disabled={aiAnalyzing}
                className="gap-2"
              >
                {aiAnalyzing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Generate New Insights
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileSetup(true)}
                className="gap-2"
              >
                <User className="h-3 w-3" />
                Complete Profile
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      {completedActions.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-1">Recent Achievements</h4>
          <div className="space-y-1">
            {completedActions.slice(0, 1).map((action) => (
              <div key={action.id} className="flex items-center gap-2 p-1.5 bg-green-50 rounded text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-700 truncate">{action.title}</span>
                <span className="text-green-600 ml-auto text-xs">
                  {formatTimestamp(action.completed_at || action.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Status */}
      {aiAnalyzing && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>AI is analyzing your data to generate personalized insights...</span>
        </div>
      )}
    </div>
  );
};