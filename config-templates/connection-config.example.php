
<?php
// KeyEff Connection Configuration Template
// Copy this to backend/config/connection-config.php and adjust values

return [
    'vpn' => [
        'enabled' => true,
        'type' => 'openvpn', // openvpn, wireguard, ipsec
        'server' => '192.168.1.1',
        'port' => 1194,
        'protocol' => 'udp',
        'ca_cert' => '/path/to/ca.crt',
        'client_cert' => '/path/to/client.crt',
        'client_key' => '/path/to/client.key',
        'auth_user_pass' => [
            'username' => 'vpn_user',
            'password' => 'vpn_password'
        ]
    ],
    
    'sip' => [
        'enabled' => true,
        'server' => 'sip.example.com',
        'port' => 5060,
        'transport' => 'UDP', // UDP, TCP, TLS
        'domain' => 'example.com',
        'auth' => [
            'username' => 'sip_user',
            'password' => 'sip_password',
            'display_name' => 'KeyEff Agent'
        ],
        'codecs' => ['PCMU', 'PCMA', 'G722'],
        'stun_server' => 'stun:stun.l.google.com:19302'
    ],
    
    'webrtc' => [
        'enabled' => true,
        'signaling_server' => 'wss://signal.example.com',
        'ice_servers' => [
            ['urls' => 'stun:stun.l.google.com:19302'],
            [
                'urls' => 'turn:turn.example.com:3478',
                'username' => 'turn_user',
                'credential' => 'turn_password'
            ]
        ],
        'constraints' => [
            'audio' => true,
            'video' => false
        ]
    ],
    
    'filialen' => [
        1 => [
            'name' => 'Berlin',
            'vpn_config' => 'berlin.ovpn',
            'sip_server' => 'berlin-sip.example.com',
            'extensions' => ['100', '101', '102']
        ],
        2 => [
            'name' => 'München',
            'vpn_config' => 'muenchen.ovpn',
            'sip_server' => 'muenchen-sip.example.com',
            'extensions' => ['200', '201', '202']
        ]
    ]
];
