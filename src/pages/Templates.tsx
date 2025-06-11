import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templateService } from "@/services/api";

// Define interfaces for template types
interface Template {
  id: string;
  name: string;
  type: string;
  category: string;
  subject?: string;
  content?: string;
  created_at: string;
}

const Templates = () => {
  const queryClient = useQueryClient();
  
  // State for managing open dialogs
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [templateType, setTemplateType] = useState<string>('email');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch templates from database with proper error handling
  const { data: emailTemplatesResponse, isLoading: emailLoading } = useQuery({
    queryKey: ['templates', 'email'],
    queryFn: () => templateService.getTemplates('email'),
  });

  const { data: smsTemplatesResponse, isLoading: smsLoading } = useQuery({
    queryKey: ['templates', 'sms'],
    queryFn: () => templateService.getTemplates('sms'),
  });

  const { data: whatsappTemplatesResponse, isLoading: whatsappLoading } = useQuery({
    queryKey: ['templates', 'whatsapp'],
    queryFn: () => templateService.getTemplates('whatsapp'),
  });

  const { data: callScriptsResponse, isLoading: callsLoading } = useQuery({
    queryKey: ['templates', 'calls'],
    queryFn: () => templateService.getTemplates('calls'),
  });

  const { data: reportTemplatesResponse, isLoading: reportsLoading } = useQuery({
    queryKey: ['templates', 'reports'],
    queryFn: () => templateService.getTemplates('reports'),
  });

  // Extract data arrays from responses
  const emailTemplates = emailTemplatesResponse?.data || [];
  const smsTemplates = smsTemplatesResponse?.data || [];
  const whatsappTemplates = whatsappTemplatesResponse?.data || [];
  const callScripts = callScriptsResponse?.data || [];
  const reportTemplates = reportTemplatesResponse?.data || [];

  // Debug logging
  React.useEffect(() => {
    console.log('Templates data loaded:', {
      email: { response: emailTemplatesResponse, templates: emailTemplates },
      sms: { response: smsTemplatesResponse, templates: smsTemplates },
      whatsapp: { response: whatsappTemplatesResponse, templates: whatsappTemplates },
      calls: { response: callScriptsResponse, templates: callScripts },
      reports: { response: reportTemplatesResponse, templates: reportTemplates }
    });
  }, [emailTemplatesResponse, smsTemplatesResponse, whatsappTemplatesResponse, callScriptsResponse, reportTemplatesResponse]);

  // Mutations for create, update, delete
  const createMutation = useMutation({
    mutationFn: templateService.saveTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success("Vorlage erfolgreich erstellt");
      setEditDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: () => {
      toast.error("Fehler beim Erstellen der Vorlage");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => templateService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success("Vorlage erfolgreich aktualisiert");
      setEditDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren der Vorlage");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: templateService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success("Vorlage erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Vorlage");
    }
  });

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
    const newTemplate: Template = {
      id: "",
      name: "",
      type: type,
      category: type === 'calls' ? 'Allgemein' : 'general',
      subject: type === 'email' ? '' : undefined,
      content: "",
      created_at: new Date().toISOString().split('T')[0]
    };
    
    setEditingTemplate(newTemplate);
    setEditDialogOpen(true);
  };

  // Function to save template
  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    const templateData = {
      name: editingTemplate.name,
      type: editingTemplate.type,
      category: editingTemplate.category,
      subject: editingTemplate.subject || null,
      content: editingTemplate.content || '',
      placeholders: placeholders.map(p => p.key)
    };
    
    if (isAdding) {
      createMutation.mutate(templateData);
    } else {
      updateMutation.mutate({ id: editingTemplate.id, data: templateData });
    }
  };

  // Function to delete template
  const handleDeleteTemplate = (id: string) => {
    if (confirm("Möchten Sie diese Vorlage wirklich löschen?")) {
      deleteMutation.mutate(id);
    }
  };

  // Insert placeholder at cursor position
  const insertPlaceholder = (placeholder: string) => {
    if (!editingTemplate || !editingTemplate.content) return;
    
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

  // Render template tables
  const renderTemplateTable = (templates: any[], columns: { key: string, label: string }[], type: string, isLoading: boolean) => (
    <div className="rounded-md border">
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
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
                    <Button variant="outline" size="icon" title="Löschen" onClick={() => handleDeleteTemplate(template.id)}>
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
      )}
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
                { key: 'created_at', label: 'Erstellt am' }
              ], 'email', emailLoading)}
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
                { key: 'created_at', label: 'Erstellt am' }
              ], 'sms', smsLoading)}
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
                { key: 'created_at', label: 'Erstellt am' }
              ], 'whatsapp', whatsappLoading)}
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
                { key: 'created_at', label: 'Erstellt am' }
              ], 'calls', callsLoading)}
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
                { key: 'category', label: 'Kategorie' },
                { key: 'created_at', label: 'Erstellt am' }
              ], 'reports', reportsLoading)}
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
              {templateType === 'email' && (
                <div>
                  <Label htmlFor="subject">Betreff</Label>
                  <Input 
                    id="subject" 
                    value={editingTemplate.subject || ''} 
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })} 
                  />
                </div>
              )}

              {/* Fields specific to call scripts */}
              {templateType === 'calls' && (
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

              {/* Content field for templates with content */}
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
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveTemplate} disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {createMutation.isPending || updateMutation.isPending ? 'Speichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Templates;
