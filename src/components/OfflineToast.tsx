
import React, { useEffect } from "react";
import { toast } from "sonner";

const OfflineToast: React.FC = () => {
  useEffect(() => {
    const handleOnlineStatus = () => {
      if (!navigator.onLine) {
        toast("Offline — changes stored locally", {
          position: "top-center",
          duration: 5000,
        });
      }
    };

    // Check initial status
    if (!navigator.onLine) {
      toast("Offline — changes stored locally", {
        position: "top-center",
        duration: 5000,
      });
    }

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  return null;
};

export default OfflineToast;
