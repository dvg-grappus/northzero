
import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import PositioningPage from "@/pages/PositioningPage";
import AudiencePage from "@/pages/AudiencePage";
import CompetitionPage from "@/pages/CompetitionPage";
import MarketPage from "@/pages/MarketPage";
import PersonalityPage from "@/pages/PersonalityPage";
import MoodboardsPage from "@/pages/MoodboardsPage";
import StylescapesPage from "@/pages/StylescapesPage";

const StepPage: React.FC = () => {
  const { stepId, substep } = useParams<{ stepId: string; substep: string }>();
  
  // Add console logging to help debug routing issues
  console.log("StepPage rendered with stepId:", stepId, "and substep:", substep);

  if (!stepId) {
    console.error("No stepId found in params, redirecting to Not Found");
    return <Navigate to="/not-found" replace />;
  }

  const renderStepContent = () => {
    console.log(`Rendering content for step ${stepId}`);
    
    switch (stepId) {
      case "1":
        return <PositioningPage />;
      case "2":
        return <AudiencePage />;
      case "3":
        return <CompetitionPage />;
      case "4":
        return <MarketPage />;
      case "5":
        return <MoodboardsPage />;
      case "6":
        console.log("Rendering StylescapesPage for step 6");
        return <StylescapesPage />;
      default:
        console.error(`No matching step found for stepId: ${stepId}`);
        return <Navigate to="/not-found" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={renderStepContent()} />
      
      {/* Add routes for step 1 and its substeps */}
      <Route path="brief" element={<PositioningPage />} />
      <Route path="golden-circle" element={<PositioningPage />} />
      <Route path="opportunities-challenges" element={<PositioningPage />} />
      <Route path="values" element={<PositioningPage />} />
      <Route path="roadmap" element={<PositioningPage />} />
      <Route path="differentiators" element={<PositioningPage />} />
      <Route path="statements" element={<PositioningPage />} />
      
      {/* Add routes for step 5 */}
      <Route path="attributes" element={<MoodboardsPage />} />
      <Route path="directions" element={<MoodboardsPage />} />
      <Route path="moodboards" element={<MoodboardsPage />} />
      <Route path="compare" element={<MoodboardsPage />} />
      
      {/* Add specific routes for step 6 */}
      <Route path="craft" element={<StylescapesPage />} />
      <Route path="preview" element={<StylescapesPage />} />
      
      <Route path="*" element={renderStepContent()} />
    </Routes>
  );
};

export default StepPage;
