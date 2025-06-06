
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface CustomerErrorStateProps {
  error: any;
  onRetry: () => void;
}

export const CustomerErrorState: React.FC<CustomerErrorStateProps> = ({
  error,
  onRetry
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8 text-center">
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-700">Fehler beim Laden der Kunden</h3>
            <p className="text-sm text-gray-600">
              {error?.message || 'Unbekannter Fehler beim Laden der Kundendaten'}
            </p>
            <Button onClick={onRetry} variant="outline">
              Erneut versuchen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
