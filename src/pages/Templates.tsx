
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, PlusCircle, Edit, Trash2, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock templates data
const mockTemplates = [
  {
    id: 1,
    name: "Willkommen",
    subject: "Willkommen bei KeyEff",
    type: "email",
    content: "Sehr geehrte/r {{name}},\n\nwillkommen bei KeyEff! Wir freuen uns, Sie als neuen Kunden begrüßen zu dürfen.\n\nMit freundlichen Grüßen,\nIhr KeyEff Team",
    variables: ["name"]
  },
  {
    id: 2,
    name: "Terminbestätigung",
    subject: "Ihr Termin bei KeyEff",
    type: "email",
    content: "Sehr geehrte/r {{name}},\n\nhiermit bestätigen wir Ihren Termin am {{date}} um {{time}} Uhr.\n\nMit freundlichen Grüßen,\nIhr KeyEff Team",
    variables: ["name", "date", "time"]
  },
  {
    id: 3,
    name: "Passwort zurücksetzen",
    subject: "Ihr Passwort zurücksetzen",
    type: "email",
    content: "Sehr geehrte/r {{name}},\n\nklicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen: {{link}}\n\nMit freundlichen Grüßen,\nIhr KeyEff Team",
    variables: ["name", "link"]
  },
  {
    id: 4,
    name: "Terminanfrage",
    subject: "Ihre Anfrage für einen Termin",
    type: "email",
    content: "Sehr geehrte/r {{name}},\n\nvielen Dank für Ihre Anfrage. Wir möchten Ihnen folgende Termine vorschlagen:\n- {{date1}} um {{time1}} Uhr\n- {{date2}} um {{time2}} Uhr\n\nBitte teilen Sie uns mit, welcher Termin Ihnen zusagt.\n\nMit freundlichen Grüßen,\nIhr KeyEff Team",
    variables: ["name", "date1", "time1", "date2", "time2"]
  },
  {
    id: 5,
    name: "Angebotsinformation",
    subject: "Ihr persönliches Angebot",
    type: "email",
    content: "Sehr geehrte/r {{name}},\n\nvielen Dank für Ihr Interesse. Wir haben Ihnen ein persönliches Angebot erstellt. Den vollständigen Angebotsentwurf finden Sie im Anhang.\n\nDas Angebot ist gültig bis zum {{validUntil}}.\n\nMit freundlichen Grüßen,\nIhr KeyEff Team",
    variables: ["name", "validUntil"]
  },
  {
    id: 6,
    name: "Anruf verpasst",
    subject: "Wir haben versucht, Sie zu erreichen",
    type: "sms",
    content: "Hallo {{name}}, wir haben versucht, Sie zu erreichen. Bitte rufen Sie uns zurück unter {{phoneNumber}}. Ihr KeyEff Team",
    variables: ["name", "phoneNumber"]
  },
  {
    id: 7,
    name: "Terminbestätigung",
    subject: "Terminbestätigung",
    type: "sms",
    content: "Ihre Terminbestätigung für den {{date}} um {{time}} Uhr. Bei Fragen kontaktieren Sie uns: {{phoneNumber}}. Ihr KeyEff Team",
    variables: ["date", "time", "phoneNumber"]
  }
];

const Templates = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  // Fetch templates
  const { data = mockTemplates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => Promise.resolve(mockTemplates),
  });

  // Add template mutation
  const { mutate: addTemplate } = useMutation({
    mutationFn: (templateData: any) => {
      // In real app, call API to add template
      return Promise.resolve({ ...templateData, id: Date.now() });
    },
    onSuccess: () => {
      setIsAddDialogOpen(false);
      toast.success("Vorlage erfolgreich erstellt");
    },
    onError: () => {
      toast.error("Fehler beim Erstellen der Vorlage");
    }
  });

  // Edit template mutation
  const { mutate: updateTemplate } = useMutation({
    mutationFn: (templateData: any) => {
      // In real app, call API to update template
      return Promise.resolve(templateData);
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      toast.success("Vorlage erfolgreich aktualisiert");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren der Vorlage");
    }
  });

  // Delete template mutation
  const { mutate: deleteTemplate } = useMutation({
    mutationFn: (templateId: number) => {
      // In real app, call API to delete template
      return Promise.resolve(templateId);
    },
    onSuccess: () => {
      toast.success("Vorlage erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Vorlage");
    }
  });

  const handleAddTemplate = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const variablesStr = formData.get('variables') as string;
    const variables = variablesStr.split(',').map(v => v.trim()).filter(Boolean);
    
    const templateData = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      type: formData.get('type') as string,
      content: formData.get('content') as string,
      variables: variables,
    };
    
    addTemplate(templateData);
  };

  const handleUpdateTemplate = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const variablesStr = formData.get('variables') as string;
    const variables = variablesStr.split(',').map(v => v.trim()).filter(Boolean);
    
    const templateData = {
      id: activeTemplate.id,
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      type: formData.get('type') as string,
      content: formData.get('content') as string,
      variables: variables,
    };
    
    updateTemplate(templateData);
  };

  const handleEdit = (template: any) => {
    setActiveTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (templateId: number) => {
    if (window.confirm("Sind Sie sicher, dass Sie diese Vorlage löschen möchten?")) {
      deleteTemplate(templateId);
    }
  };

  const handleCopy = (template: any) => {
    const copyTemplate = {
      ...template,
      name: `${template.name} (Kopie)`,
    };
    addTemplate(copyTemplate);
  };

  return (
    <AppLayout title="Vorlagen" subtitle="E-Mail- und SMS-Vorlagen verwalten">
      <div className="admin-controls flex justify-between items-center">
        <div>
          <span className="text-sm font-medium">Vorlagen gesamt: {data.length}</span>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>Neue Vorlage</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Neue Vorlage erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue E-Mail- oder SMS-Vorlage.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTemplate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">Betreff</Label>
                  <Input id="subject" name="subject" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Typ</Label>
                  <select 
                    id="type" 
                    name="type" 
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="email"
                    required
                  >
                    <option value="email">E-Mail</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">Inhalt</Label>
                  <Textarea 
                    id="content" 
                    name="content" 
                    className="col-span-3 min-h-[200px]" 
                    placeholder="Geben Sie hier den Inhalt der Vorlage ein. Verwenden Sie {{variable}} für Platzhalter."
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="variables" className="text-right">Variablen</Label>
                  <Input 
                    id="variables" 
                    name="variables" 
                    className="col-span-3" 
                    placeholder="name, date, time, etc. (durch Kommas getrennt)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Vorlage erstellen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">Alle Vorlagen</TabsTrigger>
          <TabsTrigger value="email">E-Mail Vorlagen</TabsTrigger>
          <TabsTrigger value="sms">SMS Vorlagen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Betreff</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Variablen</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Lade Vorlagen...</TableCell>
                      </TableRow>
                    ) : (
                      data.map(template => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.subject}</TableCell>
                          <TableCell>{template.type === 'email' ? 'E-Mail' : 'SMS'}</TableCell>
                          <TableCell>{template.variables.join(', ')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleCopy(template)} title="Kopieren">
                                <Copy size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(template)} title="Bearbeiten">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} title="Löschen">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Betreff</TableHead>
                      <TableHead>Variablen</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data
                      .filter(template => template.type === 'email')
                      .map(template => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.subject}</TableCell>
                          <TableCell>{template.variables.join(', ')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleCopy(template)} title="Kopieren">
                                <Copy size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(template)} title="Bearbeiten">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} title="Löschen">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sms" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Betreff</TableHead>
                      <TableHead>Variablen</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data
                      .filter(template => template.type === 'sms')
                      .map(template => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.subject}</TableCell>
                          <TableCell>{template.variables.join(', ')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleCopy(template)} title="Kopieren">
                                <Copy size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(template)} title="Bearbeiten">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} title="Löschen">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Vorlage bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Informationen für "{activeTemplate?.name}".
            </DialogDescription>
          </DialogHeader>
          {activeTemplate && (
            <form onSubmit={handleUpdateTemplate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={activeTemplate.name} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-subject" className="text-right">Betreff</Label>
                  <Input 
                    id="edit-subject" 
                    name="subject" 
                    defaultValue={activeTemplate.subject} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">Typ</Label>
                  <select 
                    id="edit-type" 
                    name="type" 
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={activeTemplate.type}
                    required
                  >
                    <option value="email">E-Mail</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-content" className="text-right pt-2">Inhalt</Label>
                  <Textarea 
                    id="edit-content" 
                    name="content" 
                    defaultValue={activeTemplate.content} 
                    className="col-span-3 min-h-[200px]" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-variables" className="text-right">Variablen</Label>
                  <Input 
                    id="edit-variables" 
                    name="variables" 
                    defaultValue={activeTemplate.variables.join(', ')} 
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Änderungen speichern</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Templates;
