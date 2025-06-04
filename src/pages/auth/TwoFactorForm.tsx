
import React, { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface TwoFactorFormProps {
  code: string;
  isLoading: boolean;
  onCodeChange: (code: string) => void;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
}

export const TwoFactorForm = ({
  code,
  isLoading,
  onCodeChange,
  onSubmit,
  onBack
}: TwoFactorFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
        <CardDescription>
          Bitte geben Sie den Code ein, der an Ihre E-Mail gesendet wurde
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Bestätigungscode</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full bg-keyeff-500 hover:bg-keyeff-600"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Bestätigen
          </Button>
          <Button 
            type="button"
            variant="ghost"
            className="w-full"
            disabled={isLoading}
            onClick={onBack}
          >
            Zurück
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
