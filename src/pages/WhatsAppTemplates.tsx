
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pen, Save, Plus, Trash2, Info } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlaceholderInfo {
  key: string;
  description: string;
  example: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
}

const WhatsAppTemplates = () => {
  const placeholders: PlaceholderInfo[] = [
    { key: "{{name}}", description: "Name des Kunden", example: "Max Mustermann" },
    { key: "{{phoneNumber}}", description: "Telefonnummer", example: "0123456789" },
    { key: "{{date}}", description: "Datum", example: "01.06.2025" },
    { key: "{{time}}", description: "Uhrzeit", example: "14:00" },
    { key: "{{tarifinformation}}", description: "Tarifdetails", example: "Premium Tarif Plus" },
    { key: "{{betrag}}", description: "Geldbetrag", example: "49,99€" },
    { key: "{{mitarbeiter}}", description: "Name des Mitarbeiters", example: "Anna Schmidt" },
    { key: "{{filiale}}", description: "Filialname oder -standort", example: "Berlin-Mitte" }
  ];

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
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  
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
      toast.success("Vorlage erstellt", {
        description: "Die WhatsApp-Vorlage wurde erfolgreich erstellt."
      });
    } else {
      // Update existing template
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      );
      setTemplates(updatedTemplates);
      toast.success("Vorlage aktualisiert", {
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
    toast.success("Vorlage gelöscht", {
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
      .replace(/{{name}}/g, "Max Mustermann")
      .replace(/{{date}}/g, "01.06.2025")
      .replace(/{{time}}/g, "14:00")
      .replace(/{{tarifinformation}}/g, "Premium Tarif Plus")
      .replace(/{{betrag}}/g, "49,99€")
      .replace(/{{mitarbeiter}}/g, "Anna Schmidt")
      .replace(/{{filiale}}/g, "Berlin-Mitte");
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp link in a new window
    window.open(whatsappUrl, "_blank");
    
    toast.success("Test-Nachricht vorbereitet", {
      description: "WhatsApp wird geöffnet mit der vorbereiteten Nachricht."
    });
  };
  
  // Insert placeholder at cursor position
  const insertPlaceholder = (placeholder: string) => {
    if (!editingTemplate) return;
    
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const contentBefore = editingTemplate.content.substring(0, start);
    const contentAfter = editingTemplate.content.substring(end);
    
    const newContent = contentBefore + placeholder + contentAfter;
    
    setEditingTemplate({
      ...editingTemplate,
      content: newContent
    });
    
    // Focus back on textarea and set cursor position after the inserted placeholder
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPlaceholders(!showPlaceholders)}
          >
            <Info className="mr-2 h-4 w-4" />
            Platzhalter {showPlaceholders ? "ausblenden" : "anzeigen"}
          </Button>
          <Button onClick={handleAddNew} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Neue Vorlage
          </Button>
        </div>
      </div>
      
      {showPlaceholders && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Verfügbare Platzhalter</CardTitle>
            <CardDescription>
              Verwenden Sie diese Platzhalter in Ihren Vorlagen, um dynamische Inhalte einzufügen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platzhalter</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Beispiel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placeholders.map((ph) => (
                  <TableRow key={ph.key}>
                    <TableCell className="font-mono">{ph.key}</TableCell>
                    <TableCell>{ph.description}</TableCell>
                    <TableCell>{ph.example}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
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
                <p>Enthaltene Platzhalter:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {placeholders.filter(ph => 
                    template.content.includes(ph.key)
                  ).map(ph => (
                    <TooltipProvider key={ph.key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {ph.key}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ph.description}</p>
                          <p className="text-xs text-muted-foreground">Beispiel: {ph.example}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
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
                  <label htmlFor="template-content" className="block text-sm font-medium mb-1">Vorlage Inhalt</label>
                  <Textarea 
                    id="template-content" 
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                    placeholder="Hallo {{name}}, wir freuen uns..."
                    rows={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Platzhalter einfügen</label>
                  <div className="flex flex-wrap gap-2">
                    {placeholders.map((ph) => (
                      <Button 
                        key={ph.key}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertPlaceholder(ph.key)}
                        className="text-xs"
                      >
                        {ph.key}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
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
            </CardFooter>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default WhatsAppTemplates;
