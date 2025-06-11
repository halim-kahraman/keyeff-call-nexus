import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Pause, BarChart3, Users, Calendar, Phone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  customers_count: number;
  calls_made: number;
  success_rate: number;
  created_at: string;
  template_id?: string;
}

const Campaigns = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    template_id: ''
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignService.getCampaigns
  });

  const { mutate: createCampaign, isPending: isCreating } = useMutation({
    mutationFn: campaignService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setIsCreateDialogOpen(false);
      setNewCampaign({ name: '', description: '', template_id: '' });
      toast.success('Kampagne erfolgreich erstellt');
    },
    onError: () => {
      toast.error('Fehler beim Erstellen der Kampagne');
    }
  });

  const { mutate: updateCampaignStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      campaignService.updateCampaignStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Kampagnenstatus aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Status');
    }
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name.trim()) {
      toast.error('Bitte geben Sie einen Kampagnennamen ein');
      return;
    }
    createCampaign(newCampaign);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      completed: 'outline'
    } as const;
    
    const labels = {
      active: 'Aktiv',
      paused: 'Pausiert',
      completed: 'Abgeschlossen'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Kampagnen" subtitle="Verwalten Sie Ihre Anrufkampagnen" />
        <div className="p-6">
          <div className="text-center">Laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Kampagnen" subtitle="Verwalten Sie Ihre Anrufkampagnen" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Aktive Kampagnen</h2>
            <p className="text-muted-foreground">
              {campaigns.length} Kampagnen gefunden
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Neue Kampagne
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Kampagne erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie eine neue Anrufkampagne
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Kampagnenname</Label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Neukunden-Akquise Q1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beschreibung der Kampagne..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="template">Vorlage</Label>
                  <Select 
                    value={newCampaign.template_id} 
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, template_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie eine Vorlage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Standard Verkaufsgespräch</SelectItem>
                      <SelectItem value="2">Kundenrückgewinnung</SelectItem>
                      <SelectItem value="3">Terminvereinbarung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button 
                    onClick={handleCreateCampaign}
                    disabled={isCreating}
                  >
                    Erstellen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign: Campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {campaign.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Kunden
                    </span>
                    <span className="font-medium">{campaign.customers_count}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Anrufe
                    </span>
                    <span className="font-medium">{campaign.calls_made}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      Erfolgsrate
                    </span>
                    <span className="font-medium">{campaign.success_rate}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Erstellt
                    </span>
                    <span className="font-medium">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  {campaign.status === 'active' ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateCampaignStatus({ id: campaign.id, status: 'paused' })}
                      className="flex items-center gap-1"
                    >
                      <Pause className="h-3 w-3" />
                      Pausieren
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => updateCampaignStatus({ id: campaign.id, status: 'active' })}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Starten
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {campaigns.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Keine Kampagnen gefunden</h3>
                <p>Erstellen Sie Ihre erste Kampagne, um zu beginnen.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
