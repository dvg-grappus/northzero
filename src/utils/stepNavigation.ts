import { NavigateFunction } from "react-router-dom";

/**
 * Type definition for navigation callback to support both direct navigation and custom callbacks
 */
type NavigationCallback = NavigateFunction | ((path: string) => void);

/**
 * Handles navigation to the appropriate route based on step ID
 */
export const navigateToStep = (stepId: number, navigate: NavigationCallback): void => {
  // Add subtle animation before navigation - lighter transition
  document.body.style.opacity = '0.95';
  setTimeout(() => {
    document.body.style.opacity = '1';
    
    let path = '';
    
    // Navigation logic for each step
    switch(stepId) {
      case 1:
        path = "/step/1";
        break;
      case 2:
        path = "/step/2";
        break;
      case 3:
        path = "/step/3";
        break;
      case 4:
        path = "/step/4";
        break;
      case 5:
        path = "/step/4/archetype";
        break;
      case 6:
        path = "/step/5/attributes";
        break;
      case 7:
        path = "/step/6/craft";
        break;
      case 8:
        path = "/step/8";
        break;
      case 9:
        path = "/step/9";
        break;
      case 10:
        path = "/step/10";
        break;
      case 11:
        path = "/step/11";
        break;
      case 12:
        path = "/step/12";
        break;
      case 13:
        path = "/step/13";
        break;
      case 14:
        path = "/step/14";
        break;
      default:
        path = `/step/${stepId}`;
    }
    
    // Handle both direct navigation and callback navigation
    if (typeof navigate === 'function') {
      navigate(path);
    }
  }, 200); // Reduced transition time for more responsive feel
};
