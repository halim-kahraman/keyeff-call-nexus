
import React from 'react';
import { AppLayout } from "@/components/layout/AppLayout";

const CallPanel: React.FC = () => {
  return (
    <AppLayout title="Call Panel" subtitle="Telefonie-System">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome to the Call Panel. This system is ready for configuration.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default CallPanel;
