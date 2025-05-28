
// Helper function to get contract status badge
export const getStatusBadge = (status: string) => {
  const statusClasses: Record<string, string> = {
    Aktiv: "bg-green-100 text-green-800",
    Inaktiv: "bg-red-100 text-red-800",
    Gekündigt: "bg-red-100 text-red-800",
    "In Bearbeitung": "bg-amber-100 text-amber-800"
  };
  
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};

// Helper function to get priority badge
export const getPriorityBadge = (priority: string) => {
  const priorityClasses: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-green-100 text-green-800"
  };
  
  return priorityClasses[priority] || "bg-gray-100 text-gray-800";
};

// Helper function to display proper priority text
export const getPriorityText = (priority: string) => {
  const priorityText: Record<string, string> = {
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig"
  };
  
  return priorityText[priority] || priority;
};
