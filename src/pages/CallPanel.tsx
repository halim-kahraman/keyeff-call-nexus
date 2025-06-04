
import { AppLayout } from "@/components/layout/AppLayout";
import { useCallPanelManager } from "@/hooks/call/useCallPanelManager";

const CallPanel = () => {
  console.log('DEBUG: CallPanel - ULTRA MINIMAL VERSION starting...');
  
  try {
    const { isLoading } = useCallPanelManager();
    
    console.log('DEBUG: CallPanel - hook called successfully');

    if (isLoading) {
      return (
        <AppLayout title="Anrufe" subtitle="Telefonzentrale">
          <div>Loading...</div>
        </AppLayout>
      );
    }

    return (
      <AppLayout title="Anrufe" subtitle="Telefonzentrale">
        <div className="p-4">
          <h1>Call Panel - Minimal Version</h1>
          <p>If you see this, the basic structure works.</p>
        </div>
      </AppLayout>
    );
  } catch (error) {
    console.error('DEBUG: Error in CallPanel:', error);
    return (
      <AppLayout title="Anrufe" subtitle="Telefonzentrale">
        <div className="p-4 text-red-600">
          Error loading Call Panel: {String(error)}
        </div>
      </AppLayout>
    );
  }
};

export default CallPanel;
