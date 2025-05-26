
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { campaignService } from '@/services/api';
import { Phone, Users, Calendar, TrendingUp, PlayCircle, PauseCircle } from 'lucide-react';
import { useCampaignSession } from '@/hooks/useCampaignSession';
import { useNavigate } from 'react-router-dom';

const Campaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const navigate = useNavigate();
  const { 
    activeSessions, 
    startCampaignSession, 
    endCampaignSession, 
    checkCampaignSession 
  } = useCampaignSession();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getCampaigns(),
  });

  const handleStartCampaign = async (campaign) => {
    const success = await startCampaignSession(campaign.id);
    if (success) {
      navigate('/call', { 
        state: { 
          campaignId: campaign.id,
          campaignName: campaign.name 
        } 
      });
    }
  };

  const handleEndCampaign = async (campaignId) => {
    await endCampaignSession(campaignId);
  };

  if (isLoading) {
    return (
      <AppLayout title="Kampagnen" subtitle="Übersicht und Verwaltung">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Kampagnen" subtitle="Übersicht und Verwaltung">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {campaigns?.map((campaign) => {
              const session = activeSessions[campaign.id];
              const isActive = session?.in_use;
              
              return (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        <p className="text-muted-foreground mt-2">{campaign.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={campaign.status === 'Active' ? 'default' : 'secondary'}
                          className={campaign.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {campaign.status}
                        </Badge>
                        {isActive && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">
                            In Bearbeitung: {session.user_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Gesamt Kunden</p>
                          <p className="text-lg font-semibold">{campaign.customer_count || 0}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Abgeschlossen</p>
                          <p className="text-lg font-semibold">{campaign.completed_count || 0}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fortschritt</p>
                          <p className="text-lg font-semibold">{campaign.completion || 0}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Filiale</p>
                          <p className="text-lg font-semibold">{campaign.filiale_name || 'Global'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Fortschritt</span>
                        <span>{campaign.completion || 0}%</span>
                      </div>
                      <Progress value={campaign.completion || 0} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      {!isActive ? (
                        <Button 
                          onClick={() => handleStartCampaign(campaign)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Kampagne starten
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={() => handleEndCampaign(campaign.id)}
                          disabled={session?.user_name !== user?.name}
                        >
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Kampagne beenden
                        </Button>
                      )}
                      
                      <Button variant="outline">
                        Details anzeigen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gesamtstatistiken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Aktive Kampagnen</p>
                    <p className="text-2xl font-bold">{campaigns?.filter(c => c.status === 'Active').length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gesamte Kunden</p>
                    <p className="text-2xl font-bold">{campaigns?.reduce((sum, c) => sum + (c.customer_count || 0), 0) || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Abgeschlossene Anrufe</p>
                    <p className="text-2xl font-bold">{campaigns?.reduce((sum, c) => sum + (c.completed_count || 0), 0) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Campaigns;
