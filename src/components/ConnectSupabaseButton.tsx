import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const ConnectSupabaseButton: React.FC = () => {
  return (
    <Button 
      variant="outline" 
      className="gap-2 border-cyan text-cyan hover:bg-cyan/10"
      onClick={() => {
        // This is a placeholder - in a real app, this would trigger the Supabase connection flow
        alert('Please click the "Connect to Supabase" button in the top right of the StackBlitz editor to set up your Supabase connection.');
      }}
    >
      <Database className="h-4 w-4" />
      Connect to Supabase
    </Button>
  );
};

export default ConnectSupabaseButton;