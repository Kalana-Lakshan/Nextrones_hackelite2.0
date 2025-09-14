import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { roadmapAiService } from "../services/roadmapAiService";
import { SkillsAnalysisService } from "../services/skillsAnalysisService";
import { useAuth } from "../contexts/AuthContext";

export default function CreateRoadmap() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRoadmap() {
      setLoading(true);
      setError("");
      try {
        if (!user?.id) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }
        // Fetch user profile and skills summary
        const skillsService = new SkillsAnalysisService();
        const summary = await skillsService.getUserSkillsSummary(user.id);
        if (!summary || !summary.profile) {
          setError("No user profile or skills found. Please connect your GitHub account in Settings.");
          setLoading(false);
          return;
        }
        // Prepare params for roadmap generation
        const params = {
          jobData: {
            job: summary.profile.career_goals?.[0] || "Software Engineer",
            description: "Personalized roadmap based on your GitHub and profile data.",
            requirements: [],
            skills: summary.profile.skills || [],
          },
          userProfile: {
            name: user?.email || "User",
            skills: summary.profile.skills || [],
            experienceLevel: summary.profile.experience_level || "beginner",
            careerGoals: summary.profile.career_goals || [],
            graduationDate: summary.profile.created_at || "",
            freeTimePerWeek: 5,
          },
        };
        const roadmapItems = await roadmapAiService.generatePersonalizedRoadmap(params);
        setRoadmap(roadmapItems);
      } catch (err) {
        setError("Failed to generate roadmap. Please try again later.");
      }
      setLoading(false);
    }
    fetchRoadmap();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Your Personalized Learning Roadmap</h1>
      {loading && <p>Loading roadmap...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <ul className="space-y-4">
          {roadmap.map((item, idx) => (
            <li key={idx} className="p-4 border rounded shadow">
              <h2 className="font-semibold text-lg">{item.title}</h2>
              <p>{item.description}</p>
              {item.resources && (
                <ul className="mt-2 list-disc ml-6">
                  {item.resources.map((res, i) => (
                    <li key={i}><a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{res.name}</a></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      <button className="mt-8 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}
