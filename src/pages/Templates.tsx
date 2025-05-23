
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, Phone, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";

const Templates = () => {
  return (
    <AppLayout title="Vorlagen" subtitle="Vorlagen für verschiedene Kommunikationskanäle">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>E-Mail Vorlagen</CardTitle>
            <CardDescription>Standardisierte E-Mail-Texte für verschiedene Anlässe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto mb-4">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <p className="text-center text-muted-foreground">
              Erstellen und bearbeiten Sie E-Mail-Vorlagen für Terminbestätigungen, Erinnerungen und mehr.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="default">Verwalten</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMS Vorlagen</CardTitle>
            <CardDescription>Kurze Texte für SMS-Benachrichtigungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mx-auto mb-4">
              <MessageSquare className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-center text-muted-foreground">
              Kurze und prägnante Texte für SMS-Benachrichtigungen an Ihre Kunden.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="default">Verwalten</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Vorlagen</CardTitle>
            <CardDescription>Nachrichtenvorlagen für WhatsApp Kommunikation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="#25D366"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-600"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M9.5 13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
              </svg>
            </div>
            <p className="text-center text-muted-foreground">
              Erstellen Sie Vorlagen für WhatsApp-Nachrichten an Kunden mit dynamischen Platzhaltern.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button>
              <Link to="/whatsapp-templates" className="text-white">Verwalten</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anrufskripte</CardTitle>
            <CardDescription>Leitfäden für Telefongespräche</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-purple-100 mx-auto mb-4">
              <Phone className="h-10 w-10 text-purple-600" />
            </div>
            <p className="text-center text-muted-foreground">
              Gesprächsleitfäden für unterschiedliche Anrufszenarien und Kampagnen.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="default">Verwalten</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Berichtsvorlagen</CardTitle>
            <CardDescription>Exportvorlagen für Berichte und Analysen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mx-auto mb-4">
              <FileSpreadsheet className="h-10 w-10 text-yellow-600" />
            </div>
            <p className="text-center text-muted-foreground">
              Anpassen von Exportvorlagen für Statistiken und Datenauswertungen.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="default">Verwalten</Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Templates;
