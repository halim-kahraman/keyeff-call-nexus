
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("Seite nicht gefunden", {
      description: "Die angeforderte Seite existiert nicht."
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-keyeff-500">404</h1>
        <h2 className="text-2xl font-medium">Seite nicht gefunden</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Die angeforderte Seite existiert nicht oder Sie haben nicht die erforderlichen Berechtigungen.
        </p>
        <Button className="bg-keyeff-500 hover:bg-keyeff-600" onClick={() => navigate("/")}>
          Zurück zur Startseite
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
