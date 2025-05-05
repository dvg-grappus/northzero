
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Enhanced error logging with more information
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      {
        referrer: document.referrer,
        state: location.state
      }
    );
  }, [location]);

  const handleBackToTimeline = () => {
    navigate("/timeline");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold mb-6 text-foreground">404</h1>
        <p className="text-2xl text-foreground mb-4">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8">
          The route <code className="bg-muted px-2 py-1 rounded font-mono">{location.pathname}</code> doesn't exist.
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="mb-4 md:mb-0 w-full md:w-auto"
          >
            Go Back
          </Button>
          <Button 
            onClick={handleBackToTimeline}
            className="w-full md:w-auto bg-cyan text-black hover:bg-cyan/90"
          >
            Return to Timeline
          </Button>
        </div>
        <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl mx-auto text-left">
          <p className="text-sm text-muted-foreground mb-2">Debugging information:</p>
          <pre className="text-xs font-mono overflow-auto p-2 bg-background/50 rounded">
            {JSON.stringify({
              route: location.pathname,
              search: location.search,
              hash: location.hash
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
