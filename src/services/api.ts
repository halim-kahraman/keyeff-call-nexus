
// Add this function to make campaigns available for the CallPanel component
export const campaignService = {
  getCampaigns: async () => {
    try {
      const response = await fetch('/backend/api/campaigns/list.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          { id: 1, name: "Frühjahrs-Kampagne 2023", status: "active" },
          { id: 2, name: "Sommer-Spezial", status: "active" },
          { id: 3, name: "Bestandskunden Retention Q2", status: "active" },
          { id: 4, name: "Neukunden Akquise 2023", status: "active" },
          { id: 5, name: "Winteraktion 2022", status: "inactive" }
        ]
      };
    }
  }
};
