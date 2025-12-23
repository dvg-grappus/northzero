import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Database, RefreshCw, Unplug } from 'lucide-react';

type Status = 'checking' | 'connected' | 'error';

const ConnectSupabaseButton: React.FC = () => {
  const [status, setStatus] = useState<Status>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkConnection = async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      setStatus('error');
      setErrorMessage('Supabase env vars missing.');
      return;
    }

    setStatus('checking');
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('projects')
        .select('count', { count: 'exact', head: true });

      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }

      setStatus('connected');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatus('error');
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'connected') {
    return (
      <Badge
        variant="outline"
        className="gap-2 bg-green-500/10 text-green-500 border-green-500/20"
      >
        <Database className="h-4 w-4" />
        Connected to Supabase
      </Badge>
    );
  }

  if (status === 'checking') {
    return (
      <Button
        variant="outline"
        className="gap-2 border-cyan text-cyan hover:bg-cyan/10"
        disabled
      >
        <RefreshCw className="h-4 w-4 animate-spin" />
        Checking connection...
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        className="gap-2 border-amber-500 text-amber-500 hover:bg-amber-500/10"
        onClick={checkConnection}
      >
        <Unplug className="h-4 w-4" />
        Retry Supabase connection
      </Button>
      {errorMessage ? (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};

export default ConnectSupabaseButton;