
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const CustomerLoadingState: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Lade Kundendaten...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
