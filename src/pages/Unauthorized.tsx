
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Zugriff verweigert",
      description: "Sie haben keine Berechtigung für diese Seite.",
      variant: "destructive",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <h2 className="text-2xl font-medium">Zugriff verweigert</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sie haben keine Berechtigungen, um auf diese Seite zuzugreifen. Bitte kontaktieren Sie Ihren Administrator.
        </p>
        <Button className="bg-keyeff-500 hover:bg-keyeff-600" onClick={() => navigate("/")}>
          Zurück zur Startseite
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
