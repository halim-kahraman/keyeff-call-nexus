import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/services/api/config';

interface CampaignSession {
  in_use: boolean;
  user_name?: string;
  started_at?: string;
}

export const useCampaignSession = () => {
  const [activeSessions, setActiveSessions] = useState<Record<number, CampaignSession>>({});

  // Check if campaign is in use
  const checkCampaignSession = async (campaignId: number): Promise<CampaignSession> => {
    try {
      const response = await api.get(`/campaigns/session.php?campaign_id=${campaignId}`);
      
      if (response.data) {
        const session = response.data;
        setActiveSessions(prev => ({
          ...prev,
          [campaignId]: session
        }));
        return session;
      }
    } catch (error) {
      console.error('Error checking campaign session:', error);
    }
    
    return { in_use: false };
  };

  // Start campaign session
  const startCampaignSession = async (campaignId: number): Promise<boolean> => {
    try {
      const response = await api.post('/campaigns/session.php', { campaign_id: campaignId });
      
      if (response.status === 200) {
        await checkCampaignSession(campaignId);
        toast.success('Kampagne gestartet', {
          description: 'Sie haben die Kampagne erfolgreich übernommen.'
        });
        return true;
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Kampagne bereits in Verwendung', {
          description: error.response.data?.message || 'Die Kampagne wird bereits bearbeitet.'
        });
      } else {
        toast.error('Fehler beim Starten der Kampagne');
      }
    }
    
    return false;
  };

  // End campaign session
  const endCampaignSession = async (campaignId: number): Promise<boolean> => {
    try {
      const response = await api.delete(`/campaigns/session.php?campaign_id=${campaignId}`);
      
      if (response.status === 200) {
        setActiveSessions(prev => {
          const updated = { ...prev };
          delete updated[campaignId];
          return updated;
        });
        
        toast.success('Kampagne beendet', {
          description: 'Die Kampagne wurde freigegeben für andere Nutzer.'
        });
        return true;
      }
    } catch (error) {
      toast.error('Fehler beim Beenden der Kampagne');
    }
    
    return false;
  };

  // Keep session alive
  const keepSessionAlive = async (campaignId: number) => {
    try {
      await api.put('/campaigns/session.php', { 
        campaign_id: campaignId,
        action: 'keep_alive'
      });
    } catch (error) {
      console.error('Error keeping session alive:', error);
    }
  };

  return {
    activeSessions,
    checkCampaignSession,
    startCampaignSession,
    endCampaignSession,
    keepSessionAlive
  };
};
