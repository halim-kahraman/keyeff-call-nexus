import React from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useCallPanelManager } from '@/hooks/useCallPanelManager';

const CallPanelManager = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Anruf Panel" 
        subtitle="Verwalten Sie Ihre Anrufe"
        showCallButton={user?.role === "telefonist"}
      />
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Call Panel Manager</h2>
          <p className="text-muted-foreground">
            Anruffunktionen werden hier implementiert.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallPanelManager;

// Export the hook that CallPanel.tsx expects
export { useCallPanelManager } from '@/hooks/useCallPanelManager';
