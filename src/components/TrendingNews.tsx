import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const newsItems = [
  {
    id: 1,
    title: "AI/ML Career Path",
    description: "Machine learning engineers see 40% salary growth in 2024",
    category: "Technology",
  },
  {
    id: 2,
    title: "Full-Stack Development",
    description: "React and Node.js remain top skills for developers",
    category: "Development",
  },
  {
    id: 3,
    title: "Data Science Trends",
    description: "Python and SQL essential for data analyst roles",
    category: "Data",
  },
  {
    id: 4,
    title: "UX/UI Design",
    description: "Design thinking skills in high demand across industries",
    category: "Design",
  },
  {
    id: 5,
    title: "Cloud Computing",
    description: "AWS and Azure certifications boost career prospects",
    category: "Cloud",
  },
];

export const TrendingNews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
  };

  return (
    <div className="trending-news rounded-2xl p-6 mx-4 mb-6 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Trending News</h2>
      </div>
      
      <div className="relative h-32">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {newsItems.map((item, index) => (
            <div
              key={item.id}
              className="w-full flex-shrink-0 flex flex-col justify-center"
            >
              <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md w-fit mb-2">
                {item.category}
              </div>
              <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
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
        {newsItems.map((_, index) => (
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