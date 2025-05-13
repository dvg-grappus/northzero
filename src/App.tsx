import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Timeline from "./pages/Timeline"; 
import NotFound from "./pages/NotFound";
import StepPage from "./pages/StepPage";
import AudiencePage from "./pages/AudiencePage";
import CompetitionPage from "./pages/CompetitionPage";
import MarketPage from "./pages/MarketPage";
import PersonalityPage from "./pages/PersonalityPage";
import MoodboardsPage from "./pages/MoodboardsPage"; 
import StylescapesPage from "./pages/StylescapesPage";
import StylescapesCraftPage from "./pages/stylescapes/StylescapesCraftPage";
import StylescapesPreviewPage from "./pages/stylescapes/StylescapesPreviewPage";
import PositioningPage from "./pages/PositioningPage";
import BrandHub from "./pages/BrandHub";
import { ProjectsProvider } from "./contexts/ProjectsContext";

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <ProjectsProvider>
      <BrowserRouter>
        <div className="dark">
          <TooltipProvider>
            <Sonner />
            <Routes>
              <Route path="/" element={<Navigate to="/welcome" replace />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/brand-hub" element={<BrandHub />} />
              <Route path="/timeline" element={<Timeline />} />
              
              {/* Positioning module routes */}
              <Route path="/step/1" element={<PositioningPage />} /> 
              <Route path="/step/all" element={<StepPage />} />
              <Route path="/step/1/:substep" element={<StepPage />} />
              
              {/* Audience module routes */}
              <Route path="/step/2" element={<Navigate to="/step/2/cohort-canvas" replace />} /> 
              <Route path="/step/2/:substep" element={<AudiencePage />} />
              <Route path="/step/2/persona/:personaId" element={<AudiencePage />} />
              
              {/* Competition module routes */}
              <Route path="/step/3/:substep" element={<CompetitionPage />} />
              <Route path="/step/3" element={<CompetitionPage />} /> 
              
              {/* Market module routes */}
              <Route path="/step/4" element={<MarketPage />} />
              
              {/* Personality module routes */}
              <Route path="/step/4/archetype" element={<PersonalityPage />} />
              <Route path="/step/4/keywords" element={<PersonalityPage />} />
              <Route path="/step/4/sliders" element={<PersonalityPage />} />
              <Route path="/step/4/x-meets-y" element={<PersonalityPage />} />
              <Route path="/step/4/dichotomy" element={<PersonalityPage />} />
              
              {/* Moodboards module routes */}
              <Route path="/step/5/attributes" element={<MoodboardsPage />} />
              <Route path="/step/5/directions" element={<MoodboardsPage />} />
              <Route path="/step/5/moodboards" element={<MoodboardsPage />} />
              <Route path="/step/5/compare" element={<MoodboardsPage />} />
              
              {/* Stylescapes module routes - ensure proper handling for step 6 */}
              <Route path="/step/6" element={<Navigate to="/step/6/craft" replace />} />
              <Route path="/step/6/:substep" element={<StepPage />} />
              
              {/* Direct routes to the Stylescapes pages for better debugging */}
              <Route path="/step/6/craft" element={<StylescapesCraftPage />} />
              <Route path="/step/6/preview" element={<StylescapesPreviewPage />} />
              
              {/* Logo module route */}
              <Route path="/step/8" element={<StepPage />} />
              
              {/* Voice module route */}
              <Route path="/step/9" element={<StepPage />} />
              
              {/* Color module route */}
              <Route path="/step/10" element={<StepPage />} />
              
              {/* Typography module route */}
              <Route path="/step/11" element={<StepPage />} />
              
              {/* Elements module route */}
              <Route path="/step/12" element={<StepPage />} />
              
              {/* Collaterals module route */}
              <Route path="/step/13" element={<StepPage />} />
              
              {/* Brand Book module route */}
              <Route path="/step/14" element={<StepPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </div>
      </BrowserRouter>
    </ProjectsProvider>
  </QueryClientProvider>
);
};

export default App;
