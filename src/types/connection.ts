
export interface Connection {
  id: string;
  filiale_id: number;
  filiale_name: string;
  connection_type: 'vpn' | 'sip' | 'webrtc';
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  started_at: string;
}

export interface ConnectionData {
  vpn?: { server: string; username: string; };
  sip?: { server: string; username: string; password: string; };
  webrtc?: { iceServers: any[]; };
}
