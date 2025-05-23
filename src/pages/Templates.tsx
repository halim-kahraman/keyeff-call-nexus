import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, Phone, FileSpreadsheet, Plus, Edit, Trash2, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define interfaces for template types
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content?: string;
  createdAt: string;
}

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface CallScript {
  id: string;
  name: string;
  category: string;
  content?: string;
  createdAt: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  format: string;
  createdAt: string;
}

// Union type for all template types
type Template = EmailTemplate | SmsTemplate | WhatsAppTemplate | CallScript | ReportTemplate;

const Templates = () => {
  // State for managing open dialogs
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [templateType, setTemplateType] = useState<string>('email');
  const [isAdding, setIsAdding] = useState(false);

  // Mock data for templates in each category
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    { id: "1", name: "Terminbestätigung", subject: "Bestätigung Ihres Termins", content: "Sehr geehrte/r {{name}},\n\nhiermit bestätigen wir Ihren Termin am {{date}} um {{time}} Uhr.\n\nMit freundlichen Grüßen,\nIhr KeyEff Team", createdAt: "2023-05-10" },
    { id: "2", name: "Erinnerung", subject: "Erinnerung an Ihren Termin", content: "Sehr geehrte/r {{name}},\n\nwir möchten Sie an Ihren Termin morgen um {{time}} Uhr erinnern.\n\nMit freundlichen Grüßen,\nIhr KeyEff Team", createdAt: "2023-05-12" },
    { id: "3", name: "Nachfassaktion", subject: "Wie war unser Gespräch?", content: "Sehr geehrte/r {{name}},\n\nvielen Dank für das angenehme Gespräch am {{date}}. Wie hat Ihnen unsere Beratung gefallen?\n\nMit freundlichen Grüßen,\nIhr KeyEff Team", createdAt: "2023-06-01" },
    { id: "4", name: "Vertragsverlängerung", subject: "Ihr Vertrag läuft bald aus", content: "Sehr geehrte/r {{name}},\n\nIhr Vertrag läuft am {{date}} aus. Wir würden Sie gerne zu einem persönlichen Gespräch einladen.\n\nMit freundlichen Grüßen,\nIhr KeyEff Team", createdAt: "2023-06-15" }
  ]);

  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([
    { id: "1", name: "Terminerinnerung kurz", content: "Erinnerung: Termin morgen um {{time}} Uhr bei KeyEff", createdAt: "2023-05-18" },
    { id: "2", name: "Bestätigung", content: "Ihr Termin am {{date}} wurde bestätigt. Ihr KeyEff Team", createdAt: "2023-05-19" },
    { id: "3", name: "Serviceinfo", content: "Wartungsarbeiten am {{date}}, Ihr KeyEff Team", createdAt: "2023-06-22" }
  ]);

  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([
    { id: "1", name: "Willkommensnachricht", content: "Willkommen {{name}}! Wir freuen uns, dass Sie sich für unsere Dienste interessieren. Bei Fragen stehen wir gerne zur Verfügung.", createdAt: "2023-04-05" },
    { id: "2", name: "Support-Anfrage", content: "Hallo {{name}}, danke für Ihre Anfrage. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden. Ihr KeyEff Team", createdAt: "2023-04-15" }
  ]);

  const [callScripts, setCallScripts] = useState<CallScript[]>([
    { id: "1", name: "Erstgespräch", category: "Neukunden", content: "1. Begrüßung: Guten Tag Herr/Frau {{name}}\n2. Vorstellung: Mein Name ist {{mitarbeiter}} von KeyEff\n3. Anliegen: Ich rufe an wegen...\n4. Fragen: Haben Sie schon Erfahrungen mit...?\n5. Abschluss: Vielen Dank für das Gespräch", createdAt: "2023-03-10" },
    { id: "2", name: "Bestandskundenanruf", category: "Bestandskunden", content: "1. Begrüßung: Guten Tag Herr/Frau {{name}}\n2. Identifikation: Sie sind Kunde bei uns seit...\n3. Zweck des Anrufs: Ich möchte mich erkundigen...\n4. Angebot: Wir haben ein neues Angebot...\n5. Abschluss: Vielen Dank für Ihre Zeit", createdAt: "2023-03-15" },
    { id: "3", name: "Beschwerdebehandlung", category: "Support", content: "1. Begrüßung: Guten Tag Herr/Frau {{name}}\n2. Entschuldigung: Es tut uns leid...\n3. Problem verstehen: Können Sie mir genauer schildern...?\n4. Lösung anbieten: Wir können...\n5. Abschluss: Vielen Dank für Ihr Verständnis", createdAt: "2023-04-20" },
    { id: "4", name: "Vertragsabschluss", category: "Vertrieb", content: "1. Begrüßung und Zusammenfassung\n2. Tarifdetails erklären\n3. Vertragsbedingungen\n4. Zahlungsmodalitäten\n5. Nächste Schritte", createdAt: "2023-05-05" }
  ]);

  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    { id: "1", name: "Monatliche Übersicht", format: "Excel", createdAt: "2023-02-10" },
    { id: "2", name: "Kundenübersicht", format: "PDF", createdAt: "2023-02-15" },
    { id: "3", name: "Vertriebsreport", format: "Excel", createdAt: "2023-03-20" }
  ]);

  // List of available placeholders
  const placeholders = [
    { key: "{{name}}", description: "Kundenname" },
    { key: "{{date}}", description: "Datum (z.B. 01.06.2025)" },
    { key: "{{time}}", description: "Uhrzeit (z.B. 14:00)" },
    { key: "{{mitarbeiter}}", description: "Name des Mitarbeiters" },
    { key: "{{filiale}}", description: "Filialname" },
    { key: "{{tarifinformation}}", description: "Tarif Bezeichnung" },
    { key: "{{betrag}}", description: "Geldbetrag" },
    { key: "{{vertragsnummer}}", description: "Vertragsnummer" },
    { key: "{{kundennummer}}", description: "Kundennummer" }
  ];

  // Function to edit template
  const handleEditTemplate = (template: Template, type: string) => {
    setTemplateType(type);
    setEditingTemplate(template);
    setIsAdding(false);
    setEditDialogOpen(true);
  };

  // Function to add new template
  const handleAddTemplate = (type: string) => {
    setTemplateType(type);
    setIsAdding(true);
    
    // Create empty template based on type
    let newTemplate: Template;
    
    switch(type) {
      case 'email':
        newTemplate = { id: "", name: "", subject: "", content: "", createdAt: new Date().toISOString().split('T')[0] };
        break;
      case 'sms':
      case 'whatsapp':
        newTemplate = { id: "", name: "", content: "", createdAt: new Date().toISOString().split('T')[0] };
        break;
      case 'calls':
        newTemplate = { id: "", name: "", category: "Allgemein", content: "", createdAt: new Date().toISOString().split('T')[0] };
        break;
      case 'reports':
        newTemplate = { id: "", name: "", format: "PDF", createdAt: new Date().toISOString().split('T')[0] };
        break;
      default:
        newTemplate = { id: "", name: "", content: "", createdAt: new Date().toISOString().split('T')[0] };
    }
    
    setEditingTemplate(newTemplate);
    setEditDialogOpen(true);
  };

  // Function to save template
  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    const newId = isAdding ? Date.now().toString() : editingTemplate.id;
    const templateWithId = { ...editingTemplate, id: newId };
    
    switch(templateType) {
      case 'email':
        if (isAdding) {
          setEmailTemplates([...emailTemplates, templateWithId as EmailTemplate]);
        } else {
          setEmailTemplates(emailTemplates.map(t => t.id === editingTemplate.id ? templateWithId as EmailTemplate : t));
        }
        break;
      case 'sms':
        if (isAdding) {
          setSmsTemplates([...smsTemplates, templateWithId as SmsTemplate]);
        } else {
          setSmsTemplates(smsTemplates.map(t => t.id === editingTemplate.id ? templateWithId as SmsTemplate : t));
        }
        break;
      case 'whatsapp':
        if (isAdding) {
          setWhatsappTemplates([...whatsappTemplates, templateWithId as WhatsAppTemplate]);
        } else {
          setWhatsappTemplates(whatsappTemplates.map(t => t.id === editingTemplate.id ? templateWithId as WhatsAppTemplate : t));
        }
        break;
      case 'calls':
        if (isAdding) {
          setCallScripts([...callScripts, templateWithId as CallScript]);
        } else {
          setCallScripts(callScripts.map(t => t.id === editingTemplate.id ? templateWithId as CallScript : t));
        }
        break;
      case 'reports':
        if (isAdding) {
          setReportTemplates([...reportTemplates, templateWithId as ReportTemplate]);
        } else {
          setReportTemplates(reportTemplates.map(t => t.id === editingTemplate.id ? templateWithId as ReportTemplate : t));
        }
        break;
    }
    
    toast.success(isAdding ? "Vorlage erfolgreich erstellt" : "Vorlage erfolgreich aktualisiert");
    setEditDialogOpen(false);
    setEditingTemplate(null);
  };

  // Function to delete template
  const handleDeleteTemplate = (id: string, type: string) => {
    if (confirm("Möchten Sie diese Vorlage wirklich löschen?")) {
      switch(type) {
        case 'email':
          setEmailTemplates(emailTemplates.filter(t => t.id !== id));
          break;
        case 'sms':
          setSmsTemplates(smsTemplates.filter(t => t.id !== id));
          break;
        case 'whatsapp':
          setWhatsappTemplates(whatsappTemplates.filter(t => t.id !== id));
          break;
        case 'calls':
          setCallScripts(callScripts.filter(t => t.id !== id));
          break;
        case 'reports':
          setReportTemplates(reportTemplates.filter(t => t.id !== id));
          break;
      }
      toast.success("Vorlage erfolgreich gelöscht");
    }
  };

  // Insert placeholder at cursor position
  const insertPlaceholder = (placeholder: string) => {
    if (!editingTemplate || !('content' in editingTemplate)) return;
    
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const contentBefore = editingTemplate.content!.substring(0, start);
    const contentAfter = editingTemplate.content!.substring(end);
    
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

  // Render template tables
  const renderTemplateTable = (templates: any[], columns: { key: string, label: string }[], type: string) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
            <TableHead className="w-[100px]">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length > 0 ? templates.map((template) => (
            <TableRow key={template.id}>
              {columns.map((col) => (
                <TableCell key={`${template.id}-${col.key}`}>
                  {col.key === 'content' && template[col.key] ? (
                    <span className="line-clamp-2">{template[col.key]}</span>
                  ) : (
                    template[col.key]
                  )}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" title="Bearbeiten" onClick={() => handleEditTemplate(template, type)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Löschen" onClick={() => handleDeleteTemplate(template.id, type)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center py-4">
                Keine Vorlagen vorhanden
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <AppLayout title="Vorlagen" subtitle="Vorlagen für verschiedene Kommunikationskanäle">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="email">E-Mail Vorlagen</TabsTrigger>
          <TabsTrigger value="sms">SMS Vorlagen</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Vorlagen</TabsTrigger>
          <TabsTrigger value="calls">Anrufskripte</TabsTrigger>
          <TabsTrigger value="reports">Berichtsvorlagen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>E-Mail Vorlagen</CardTitle>
                <CardDescription>Standardisierte E-Mail-Texte für verschiedene Anlässe</CardDescription>
              </div>
              <Button onClick={() => handleAddTemplate('email')}>
                <Plus className="mr-2 h-4 w-4" /> Neue Vorlage
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(emailTemplates, [
                { key: 'name', label: 'Name' },
                { key: 'subject', label: 'Betreff' },
                { key: 'createdAt', label: 'Erstellt am' }
              ], 'email')}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>SMS Vorlagen</CardTitle>
                <CardDescription>Kurze Texte für SMS-Benachrichtigungen</CardDescription>
              </div>
              <Button onClick={() => handleAddTemplate('sms')}>
                <Plus className="mr-2 h-4 w-4" /> Neue Vorlage
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(smsTemplates, [
                { key: 'name', label: 'Name' },
                { key: 'content', label: 'Inhalt' },
                { key: 'createdAt', label: 'Erstellt am' }
              ], 'sms')}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>WhatsApp Vorlagen</CardTitle>
                <CardDescription>Nachrichtenvorlagen für WhatsApp Kommunikation</CardDescription>
              </div>
              <Button onClick={() => handleAddTemplate('whatsapp')}>
                <Plus className="mr-2 h-4 w-4" /> Neue Vorlage
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(whatsappTemplates, [
                { key: 'name', label: 'Name' },
                { key: 'content', label: 'Inhalt' },
                { key: 'createdAt', label: 'Erstellt am' }
              ], 'whatsapp')}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calls">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Anrufskripte</CardTitle>
                <CardDescription>Leitfäden für Telefongespräche</CardDescription>
              </div>
              <Button onClick={() => handleAddTemplate('calls')}>
                <Plus className="mr-2 h-4 w-4" /> Neues Skript
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(callScripts, [
                { key: 'name', label: 'Name' },
                { key: 'category', label: 'Kategorie' },
                { key: 'createdAt', label: 'Erstellt am' }
              ], 'calls')}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Berichtsvorlagen</CardTitle>
                <CardDescription>Exportvorlagen für Berichte und Analysen</CardDescription>
              </div>
              <Button onClick={() => handleAddTemplate('reports')}>
                <Plus className="mr-2 h-4 w-4" /> Neue Vorlage
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(reportTemplates, [
                { key: 'name', label: 'Name' },
                { key: 'format', label: 'Format' },
                { key: 'createdAt', label: 'Erstellt am' }
              ], 'reports')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit/Add Template Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isAdding ? "Neue Vorlage erstellen" : "Vorlage bearbeiten"}
            </DialogTitle>
            <DialogDescription>
              {templateType === 'email' && "E-Mail-Vorlage für die Kommunikation mit Kunden"}
              {templateType === 'sms' && "SMS-Vorlage für kurze Nachrichten"}
              {templateType === 'whatsapp' && "WhatsApp-Vorlage für Messaging"}
              {templateType === 'calls' && "Anrufskript für Telefongespräche"}
              {templateType === 'reports' && "Berichtsvorlage für Datenexporte"}
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={editingTemplate.name} 
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })} 
                />
              </div>

              {/* Fields specific to email templates */}
              {templateType === 'email' && 'subject' in editingTemplate && (
                <div>
                  <Label htmlFor="subject">Betreff</Label>
                  <Input 
                    id="subject" 
                    value={editingTemplate.subject} 
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })} 
                  />
                </div>
              )}

              {/* Fields specific to call scripts */}
              {templateType === 'calls' && 'category' in editingTemplate && (
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select 
                    value={editingTemplate.category}
                    onValueChange={(value) => setEditingTemplate({ ...editingTemplate, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Neukunden">Neukunden</SelectItem>
                      <SelectItem value="Bestandskunden">Bestandskunden</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Vertrieb">Vertrieb</SelectItem>
                      <SelectItem value="Allgemein">Allgemein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Fields specific to report templates */}
              {templateType === 'reports' && 'format' in editingTemplate && (
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select 
                    value={editingTemplate.format}
                    onValueChange={(value) => setEditingTemplate({ ...editingTemplate, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Format auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Excel">Excel</SelectItem>
                      <SelectItem value="CSV">CSV</SelectItem>
                      <SelectItem value="Word">Word</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Content field for templates with content */}
              {'content' in editingTemplate && (
                <>
                  <div>
                    <Label htmlFor="template-content">Inhalt</Label>
                    <Textarea 
                      id="template-content" 
                      value={editingTemplate.content || ''} 
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })} 
                      rows={8}
                    />
                  </div>

                  <div>
                    <Label>Verfügbare Platzhalter</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {placeholders.map((ph) => (
                        <Badge 
                          key={ph.key} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-slate-100"
                          onClick={() => insertPlaceholder(ph.key)}
                        >
                          {ph.key} - {ph.description}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Templates;
