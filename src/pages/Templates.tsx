
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, Phone, FileSpreadsheet, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Templates = () => {
  // Mock data for templates in each category
  const emailTemplates = [
    { id: "1", name: "Terminbestätigung", subject: "Bestätigung Ihres Termins", createdAt: "2023-05-10" },
    { id: "2", name: "Erinnerung", subject: "Erinnerung an Ihren Termin", createdAt: "2023-05-12" },
    { id: "3", name: "Nachfassaktion", subject: "Wie war unser Gespräch?", createdAt: "2023-06-01" },
    { id: "4", name: "Vertragsverlängerung", subject: "Ihr Vertrag läuft bald aus", createdAt: "2023-06-15" }
  ];

  const smsTemplates = [
    { id: "1", name: "Terminerinnerung kurz", content: "Erinnerung: Termin morgen um {{time}}", createdAt: "2023-05-18" },
    { id: "2", name: "Bestätigung", content: "Ihr Termin am {{date}} wurde bestätigt", createdAt: "2023-05-19" },
    { id: "3", name: "Serviceinfo", content: "Wartungsarbeiten am {{date}}, Ihr Team", createdAt: "2023-06-22" }
  ];

  const whatsappTemplates = [
    { id: "1", name: "Willkommensnachricht", content: "Willkommen {{name}}! Wir freuen uns...", createdAt: "2023-04-05" },
    { id: "2", name: "Support-Anfrage", content: "Hallo {{name}}, danke für Ihre Anfrage...", createdAt: "2023-04-15" }
  ];

  const callScripts = [
    { id: "1", name: "Erstgespräch", category: "Neukunden", createdAt: "2023-03-10" },
    { id: "2", name: "Bestandskundenanruf", category: "Bestandskunden", createdAt: "2023-03-15" },
    { id: "3", name: "Beschwerdebehandlung", category: "Support", createdAt: "2023-04-20" },
    { id: "4", name: "Vertragsabschluss", category: "Vertrieb", createdAt: "2023-05-05" }
  ];

  const reportTemplates = [
    { id: "1", name: "Monatliche Übersicht", format: "Excel", createdAt: "2023-02-10" },
    { id: "2", name: "Kundenübersicht", format: "PDF", createdAt: "2023-02-15" },
    { id: "3", name: "Vertriebsreport", format: "Excel", createdAt: "2023-03-20" }
  ];

  const renderTemplateTable = (templates: any[], columns: { key: string, label: string }[]) => (
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
          {templates.map((template) => (
            <TableRow key={template.id}>
              {columns.map((col) => (
                <TableCell key={`${template.id}-${col.key}`}>{template[col.key]}</TableCell>
              ))}
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" title="Bearbeiten">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Löschen">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Neue Vorlage
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(emailTemplates, [
                { key: 'name', label: 'Name' },
                { key: 'subject', label: 'Betreff' },
                { key: 'createdAt', label: 'Erstellt am' }
              ])}
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
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Neue Vorlage
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(smsTemplates, [
                { key: 'name', label: 'Name' },
                { key: 'content', label: 'Inhalt' },
                { key: 'createdAt', label: 'Erstellt am' }
              ])}
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
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Neue Vorlage
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(whatsappTemplates, [
                { key: 'name', label: 'Name' },
                { key: 'content', label: 'Inhalt' },
                { key: 'createdAt', label: 'Erstellt am' }
              ])}
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
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Neues Skript
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(callScripts, [
                { key: 'name', label: 'Name' },
                { key: 'category', label: 'Kategorie' },
                { key: 'createdAt', label: 'Erstellt am' }
              ])}
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
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Neue Vorlage
              </Button>
            </CardHeader>
            <CardContent>
              {renderTemplateTable(reportTemplates, [
                { key: 'name', label: 'Name' },
                { key: 'format', label: 'Format' },
                { key: 'createdAt', label: 'Erstellt am' }
              ])}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Templates;
