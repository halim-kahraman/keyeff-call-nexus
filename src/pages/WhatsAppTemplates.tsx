
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pen, Save, Plus, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
}

const WhatsAppTemplates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Terminbestätigung",
      content: "Hallo {{name}}, wir freuen uns auf Ihren Termin am {{date}} um {{time}} Uhr bei KeyEff. Bei Fragen erreichen Sie uns unter 030-12345678."
    },
    {
      id: "2",
      name: "Anruf verpasst",
      content: "Hallo {{name}}, wir haben versucht Sie zu erreichen. Bitte rufen Sie uns zurück unter 030-12345678 oder antworten Sie auf diese Nachricht."
    },
    {
      id: "3", 
      name: "Tarif Interesse",
      content: "Hallo {{name}}, vielen Dank für Ihr Interesse an der {{tarifinformation}}. Können wir einen Termin für ein Beratungsgespräch vereinbaren? Mit freundlichen Grüßen, Ihr KeyEff Team."
    }
  ]);
  
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Handle template edit
  const handleEdit = (template: Template) => {
    setEditingTemplate({...template});
    setIsEditing(true);
    setIsAdding(false);
  };
  
  // Handle template save
  const handleSave = () => {
    if (!editingTemplate) return;
    
    if (isAdding) {
      // Add new template
      setTemplates([...templates, {...editingTemplate, id: Date.now().toString()}]);
      toast({
        title: "Vorlage erstellt",
        description: "Die WhatsApp-Vorlage wurde erfolgreich erstellt."
      });
    } else {
      // Update existing template
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      );
      setTemplates(updatedTemplates);
      toast({
        title: "Vorlage aktualisiert",
        description: "Die WhatsApp-Vorlage wurde erfolgreich aktualisiert."
      });
    }
    
    setIsEditing(false);
    setIsAdding(false);
    setEditingTemplate(null);
  };
  
  // Handle template delete
  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
      title: "Vorlage gelöscht",
      description: "Die WhatsApp-Vorlage wurde erfolgreich gelöscht."
    });
  };
  
  // Handle new template creation
  const handleAddNew = () => {
    setEditingTemplate({
      id: "",
      name: "",
      content: ""
    });
    setIsAdding(true);
    setIsEditing(true);
  };
  
  // Generate WhatsApp deep link with template content
  const generateWhatsAppLink = (template: Template) => {
    // This is a simplified example - in a real implementation you would replace placeholders with actual data
    const encodedMessage = encodeURIComponent(template.content);
    return `https://wa.me/{{phoneNumber}}?text=${encodedMessage}`;
  };
  
  // Handle test message sending
  const testSendMessage = (template: Template) => {
    const phoneNumber = prompt("Bitte geben Sie eine Telefonnummer ein (mit Ländervorwahl, z.B. 491701234567):");
    if (!phoneNumber) return;
    
    // Replace placeholders with test values and create WhatsApp link
    let message = template.content
      .replace("{{name}}", "Max Mustermann")
      .replace("{{date}}", "01.06.2025")
      .replace("{{time}}", "14:00")
      .replace("{{tarifinformation}}", "Premium Tarif Plus");
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp link in a new window
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "Test-Nachricht vorbereitet",
      description: "WhatsApp wird geöffnet mit der vorbereiteten Nachricht."
    });
  };
  
  return (
    <AppLayout title="WhatsApp Vorlagen" subtitle="Vorlagen für WhatsApp-Nachrichten verwalten">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">WhatsApp-Vorlagen</h2>
          <p className="text-muted-foreground">
            Erstellen und bearbeiten Sie Vorlagen für WhatsApp-Nachrichten an Kunden
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Neue Vorlage
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>WhatsApp-Vorlage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md mb-4 text-sm whitespace-pre-wrap">
                {template.content}
              </div>
              
              <div className="text-xs text-muted-foreground mb-4">
                <p>Verfügbare Variablen:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>{"{{name}}"}</li>
                  <li>{"{{phoneNumber}}"}</li>
                  <li>{"{{date}}"}</li>
                  <li>{"{{time}}"}</li>
                  <li>{"{{tarifinformation}}"}</li>
                </ul>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(template)}
                >
                  <Pen className="mr-1 h-4 w-4" />
                  Bearbeiten
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => testSendMessage(template)}
                >
                  Testen
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Edit/Add Template Dialog */}
      {isEditing && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>{isAdding ? "Neue WhatsApp-Vorlage" : "WhatsApp-Vorlage bearbeiten"}</CardTitle>
              <CardDescription>
                Erstellen Sie eine neue Vorlage für WhatsApp-Nachrichten mit Platzhaltern für Kundendaten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Vorlagenname</label>
                  <Input 
                    id="name" 
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                    placeholder="z.B. Terminbestätigung"
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-1">Vorlage Inhalt</label>
                  <Textarea 
                    id="content" 
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                    placeholder="Hallo {{name}}, wir freuen uns..."
                    rows={6}
                  />
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Verfügbare Variablen:</p>
                    <p className="mt-1">
                      <code>{"{{name}} {{phoneNumber}} {{date}} {{time}} {{tarifinformation}}"}</code>
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setIsAdding(false);
                      setEditingTemplate(null);
                    }}
                  >
                    Abbrechen
                  </Button>
                  <Button onClick={handleSave} className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Speichern
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default WhatsAppTemplates;
