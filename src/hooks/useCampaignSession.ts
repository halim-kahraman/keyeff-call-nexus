import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/campaigns/session.php?campaign_id=${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const session = await response.json();
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
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/campaigns/session.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ campaign_id: campaignId })
      });
      
      if (response.status === 409) {
        const error = await response.json();
        toast.error('Kampagne bereits in Verwendung', {
          description: error.message
        });
        return false;
      }
      
      if (response.ok) {
        await checkCampaignSession(campaignId);
        toast.success('Kampagne gestartet', {
          description: 'Sie haben die Kampagne erfolgreich übernommen.'
        });
        return true;
      }
    } catch (error) {
      toast.error('Fehler beim Starten der Kampagne');
    }
    
    return false;
  };

  // End campaign session
  const endCampaignSession = async (campaignId: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/campaigns/session.php?campaign_id=${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
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
      const token = localStorage.getItem('auth_token');
      await fetch('/api/campaigns/session.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          campaign_id: campaignId,
          action: 'keep_alive'
        })
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
