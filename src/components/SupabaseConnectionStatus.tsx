import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Database, Unplug } from 'lucide-react';

const SupabaseConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to make a simple query to check connection
        const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error('Supabase connection error:', error);
          setIsConnected(false);
        } else {
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Failed to check Supabase connection:', err);
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, []);
  
  if (isConnected === null) {
    return (
      <Badge variant="outline" className="gap-1 bg-muted/50">
        <Database className="h-3 w-3" />
        Checking...
      </Badge>
    );
  }
  
  if (isConnected) {
    return (
      <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
        <Database className="h-3 w-3" />
        Connected to Supabase
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20">
      <Unplug className="h-3 w-3" />
      Not connected
    </Badge>
  );
};

export default SupabaseConnectionStatus;