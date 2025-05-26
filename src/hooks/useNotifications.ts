
import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: "Neuer Termin: Kundengespräch um 14:00 Uhr", time: "vor 10 Minuten", read: false },
    { id: 2, text: "Verpasster Anruf von Kunde #12345", time: "vor 30 Minuten", read: false },
    { id: 3, text: "Vertrag #87654 läuft in 5 Tagen ab", time: "vor 1 Stunde", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
