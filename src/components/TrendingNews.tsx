import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNewsApi } from "@/hooks/useNewsApi";
import { useUserKnowledgeProfile } from "@/hooks/useUserKnowledgeProfile";
import { NewsArticle } from "@/services/newsApiService";

export const TrendingNews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsData, setNewsData] = useState<{
    technology: NewsArticle[];
    ai: NewsArticle[];
    development: NewsArticle[];
    data: NewsArticle[];
    design: NewsArticle[];
    cloud: NewsArticle[];
  }>({
    technology: [],
    ai: [],
    development: [],
    data: [],
    design: [],
    cloud: []
  });
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);

  const { getCareerNews, loading } = useNewsApi();
  const { knowledgeProfile, profile } = useUserKnowledgeProfile();

  useEffect(() => {
    const fetchNews = async () => {
      const userSkills = knowledgeProfile?.skills || profile?.skills || [];
      const userInterests = knowledgeProfile?.interests || [];
      
      const news = await getCareerNews(userSkills, userInterests);
      setNewsData(news);
      
      // Flatten all news into a single array for the carousel
      const flattenedNews = [
        ...news.technology.slice(0, 1),
        ...news.ai.slice(0, 1),
        ...news.development.slice(0, 1),
        ...news.data.slice(0, 1),
        ...news.design.slice(0, 1),
        ...news.cloud.slice(0, 1)
      ].filter(Boolean);
      
      setAllNews(flattenedNews);
    };

    fetchNews();
  }, [getCareerNews, knowledgeProfile, profile]);

  useEffect(() => {
    if (allNews.length > 0) {
    const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % allNews.length);
      }, 5000);

    return () => clearInterval(interval);
    }
  }, [allNews.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allNews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allNews.length) % allNews.length);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="trending-news rounded-2xl p-6 mx-4 mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Trending News</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading latest news...</div>
        </div>
      </div>
    );
  }

  if (allNews.length === 0) {
    return (
      <div className="trending-news rounded-2xl p-6 mx-4 mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Trending News</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">No news available at the moment.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-news rounded-2xl p-6 mx-4 mb-6 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Personalized News</h2>
        <span className="text-xs text-muted-foreground">News tailored to your interests</span>
      </div>
      
      <div className="relative h-40">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {allNews.map((article, index) => (
            <Card
              key={article.id}
              className="w-full flex-shrink-0 mx-2 h-full cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => window.open(article.url, '_blank')}
            >
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex gap-3 h-full">
                  {/* News Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    {article.urlToImage ? (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">News</span>
                      </div>
                    )}
                  </div>
                  
                  {/* News Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                          {article.category}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.publishedAt)}
                        </div>
                      </div>
                      <h3 className="font-medium text-foreground mb-2 line-clamp-2 leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {article.source.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
              </div>
            </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="h-8 w-8 rounded-full bg-background/80 hover:bg-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="h-8 w-8 rounded-full bg-background/80 hover:bg-background"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center gap-1 mt-4">
        {allNews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-primary" : "bg-primary/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};