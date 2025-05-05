
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add enhanced error boundary to catch and log any rendering errors
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found! Make sure the HTML file contains an element with id 'root'");
} else {
  try {
    console.log("Attempting to render app...");
    createRoot(rootElement).render(<App />);
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error rendering application:", error);
    // Try to render a fallback error UI directly
    try {
      createRoot(rootElement).render(
        <div className="error-container" style={{
          padding: "2rem", 
          maxWidth: "800px", 
          margin: "0 auto",
          fontFamily: "system-ui, sans-serif"
        }}>
          <h1>Something went wrong</h1>
          <p>The application failed to load. Please reload the page and try again.</p>
          <pre style={{ 
            background: "#f5f5f5", 
            padding: "1rem", 
            borderRadius: "4px",
            overflow: "auto" 
          }}>
            {error instanceof Error ? error.message : "Unknown error"}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1rem",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            Reload Page
          </button>
        </div>
      );
    } catch (fallbackError) {
      console.error("Failed to render error UI:", fallbackError);
    }
  }
}
