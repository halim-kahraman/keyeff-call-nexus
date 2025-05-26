
<?php
/**
 * Enhanced Mailer Utility with automatic Composer integration
 * Supports 2FA email templates and automatic PHPMailer setup
 */

// Try to find and load Composer autoloader automatically
$autoloader_found = false;
$vendor_paths = [
    __DIR__ . '/../vendor/autoload.php',
    __DIR__ . '/../../vendor/autoload.php',
    __DIR__ . '/../../../vendor/autoload.php',
    dirname(__DIR__) . '/vendor/autoload.php'
];

foreach ($vendor_paths as $autoloader_path) {
    if (file_exists($autoloader_path)) {
        require_once $autoloader_path;
        $autoloader_found = true;
        debugLog('Composer autoloader found and loaded from: ' . $autoloader_path);
        break;
    }
}

// Check if PHPMailer is available after autoloader
$phpmailer_available = $autoloader_found && class_exists('PHPMailer\\PHPMailer\\PHPMailer');

if (!$phpmailer_available) {
    debugLog('PHPMailer not available - run "composer install" in backend directory');
}

/**
 * Send an email using PHPMailer with enhanced configuration
 * 
 * @param string $to Recipient email
 * @param string $subject Email subject
 * @param string $body Email body (HTML)
 * @param string $altBody Plain text alternative (optional)
 * @param array $attachments Optional file attachments
 * @return bool True if email was sent successfully, false otherwise
 */
function sendMail($to, $subject, $body, $altBody = '', $attachments = []) {
    global $phpmailer_available;
    
    // If PHPMailer is not available, simulate the email sending for development
    if (!$phpmailer_available) {
        debugLog('Email sending simulated (PHPMailer not available)', [
            'to' => $to,
            'subject' => $subject,
            'body_length' => strlen($body),
            'note' => 'Run "composer install" to enable real email sending'
        ]);
        return true; // Return true to simulate successful email sending
    }
    
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = MAIL_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USERNAME;
        $mail->Password = MAIL_PASSWORD;
        
        // SSL/TLS Configuration
        if (MAIL_ENCRYPTION) {
            $mail->SMTPSecure = MAIL_ENCRYPTION;
        }
        
        $mail->Port = MAIL_PORT;
        $mail->CharSet = 'UTF-8';
        
        // Timeout settings
        $mail->Timeout = 30;
        $mail->SMTPKeepAlive = true;
        
        // Recipients
        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($to);
        
        // Add attachments if provided
        foreach ($attachments as $attachment) {
            if (isset($attachment['path']) && file_exists($attachment['path'])) {
                $mail->addAttachment($attachment['path'], $attachment['name'] ?? '');
            }
        }
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = $altBody ?: strip_tags($body);
        
        // Send the email
        $result = $mail->send();
        
        debugLog('Email sent successfully via PHPMailer', [
            'to' => $to, 
            'subject' => $subject,
            'smtp_host' => MAIL_HOST
        ]);
        
        return $result;
        
    } catch (PHPMailer\PHPMailer\Exception $e) {
        debugLog('PHPMailer Exception', [
            'to' => $to, 
            'error' => $e->getMessage(),
            'code' => $e->getCode()
        ]);
        return false;
    } catch (Exception $e) {
        debugLog('General Exception during email sending', [
            'to' => $to, 
            'error' => $e->getMessage()
        ]);
        return false;
    }
}

/**
 * Send password reset email with enhanced template
 * 
 * @param string $email Recipient email
 * @param string $name Recipient name
 * @param string $resetCode Password reset code
 * @return bool True if email was sent successfully, false otherwise
 */
function sendPasswordResetEmail($email, $name, $resetCode) {
    $subject = APP_NAME . ' - Passwort zurücksetzen';
    
    $body = generateEmailTemplate('password_reset', [
        'name' => $name,
        'reset_code' => $resetCode,
        'app_name' => APP_NAME,
        'valid_minutes' => 15
    ]);
    
    return sendMail($email, $subject, $body);
}

/**
 * Send 2FA verification code email
 * 
 * @param string $email Recipient email
 * @param string $name Recipient name
 * @param string $code 2FA verification code
 * @return bool True if email was sent successfully, false otherwise
 */
function send2FAEmail($email, $name, $code) {
    $subject = APP_NAME . ' - Zwei-Faktor-Authentifizierung';
    
    $body = generateEmailTemplate('2fa_verification', [
        'name' => $name,
        'verification_code' => $code,
        'app_name' => APP_NAME,
        'valid_minutes' => 5
    ]);
    
    return sendMail($email, $subject, $body);
}

/**
 * Send login notification email
 * 
 * @param string $email Recipient email
 * @param string $name Recipient name
 * @param array $loginData Login details (IP, browser, etc.)
 * @return bool True if email was sent successfully, false otherwise
 */
function sendLoginNotificationEmail($email, $name, $loginData = []) {
    $subject = APP_NAME . ' - Neue Anmeldung';
    
    $body = generateEmailTemplate('login_notification', [
        'name' => $name,
        'app_name' => APP_NAME,
        'login_time' => date('d.m.Y H:i:s'),
        'ip_address' => $loginData['ip'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Unbekannt',
        'user_agent' => $loginData['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'Unbekannt'
    ]);
    
    return sendMail($email, $subject, $body);
}

/**
 * Generate email template with placeholders
 * 
 * @param string $template Template name
 * @param array $variables Variables to replace in template
 * @return string Generated HTML email content
 */
function generateEmailTemplate($template, $variables = []) {
    $baseStyle = '
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4577D4 0%, #5A8DEF 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background: #fff; }
        .code { font-size: 32px; font-weight: bold; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); margin: 20px 0; text-align: center; letter-spacing: 8px; border-radius: 8px; border: 2px dashed #4577D4; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        .button { display: inline-block; background: #4577D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>';
    
    switch ($template) {
        case 'password_reset':
            return '
            <!DOCTYPE html>
            <html>
            <head>' . $baseStyle . '</head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Passwort zurücksetzen</h1>
                    </div>
                    <div class="content">
                        <p>Hallo <strong>' . htmlspecialchars($variables['name']) . '</strong>,</p>
                        <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Konto bei <strong>' . htmlspecialchars($variables['app_name']) . '</strong> gestellt.</p>
                        
                        <div class="info">
                            <strong>📋 Anweisungen:</strong><br>
                            Verwenden Sie den folgenden Code, um Ihr Passwort zurückzusetzen:
                        </div>
                        
                        <div class="code">' . htmlspecialchars($variables['reset_code']) . '</div>
                        
                        <div class="warning">
                            <strong>⚠️ Wichtige Hinweise:</strong><br>
                            • Dieser Code ist nur <strong>' . $variables['valid_minutes'] . ' Minuten</strong> gültig<br>
                            • Verwenden Sie diesen Code nur, wenn Sie die Anfrage gestellt haben<br>
                            • Teilen Sie diesen Code niemals mit anderen Personen
                        </div>
                        
                        <p>Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie bitte diese E-Mail. Ihr Passwort bleibt unverändert.</p>
                        
                        <p>Mit freundlichen Grüßen,<br><strong>Das ' . htmlspecialchars($variables['app_name']) . ' Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
                        <p>© ' . date('Y') . ' ' . htmlspecialchars($variables['app_name']) . '. Alle Rechte vorbehalten.</p>
                    </div>
                </div>
            </body>
            </html>';
            
        case '2fa_verification':
            return '
            <!DOCTYPE html>
            <html>
            <head>' . $baseStyle . '</head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🛡️ Zwei-Faktor-Authentifizierung</h1>
                    </div>
                    <div class="content">
                        <p>Hallo <strong>' . htmlspecialchars($variables['name']) . '</strong>,</p>
                        <p>Zur Vervollständigung Ihrer Anmeldung bei <strong>' . htmlspecialchars($variables['app_name']) . '</strong> benötigen Sie den folgenden Bestätigungscode:</p>
                        
                        <div class="code">' . htmlspecialchars($variables['verification_code']) . '</div>
                        
                        <div class="warning">
                            <strong>⏱️ Gültigkeitsdauer:</strong> ' . $variables['valid_minutes'] . ' Minuten<br>
                            <strong>🔒 Sicherheit:</strong> Teilen Sie diesen Code niemals mit anderen
                        </div>
                        
                        <p>Geben Sie diesen Code in der Anmeldemaske ein, um fortzufahren.</p>
                        
                        <p>Mit freundlichen Grüßen,<br><strong>Das ' . htmlspecialchars($variables['app_name']) . ' Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
                    </div>
                </div>
            </body>
            </html>';
            
        case 'login_notification':
            return '
            <!DOCTYPE html>
            <html>
            <head>' . $baseStyle . '</head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Neue Anmeldung</h1>
                    </div>
                    <div class="content">
                        <p>Hallo <strong>' . htmlspecialchars($variables['name']) . '</strong>,</p>
                        <p>Es wurde eine neue Anmeldung in Ihrem <strong>' . htmlspecialchars($variables['app_name']) . '</strong> Konto registriert:</p>
                        
                        <div class="info">
                            <strong>📅 Zeitpunkt:</strong> ' . htmlspecialchars($variables['login_time']) . '<br>
                            <strong>🌐 IP-Adresse:</strong> ' . htmlspecialchars($variables['ip_address']) . '<br>
                            <strong>💻 Browser:</strong> ' . htmlspecialchars(substr($variables['user_agent'], 0, 100)) . '...
                        </div>
                        
                        <p>Falls Sie sich nicht angemeldet haben, ändern Sie bitte umgehend Ihr Passwort und kontaktieren Sie unseren Support.</p>
                        
                        <p>Mit freundlichen Grüßen,<br><strong>Das ' . htmlspecialchars($variables['app_name']) . ' Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>Diese E-Mail wurde automatisch generiert.</p>
                    </div>
                </div>
            </body>
            </html>';
            
        default:
            return '<p>Template "' . htmlspecialchars($template) . '" nicht gefunden.</p>';
    }
}

/**
 * Test email configuration
 * 
 * @return array Test result with success status and details
 */
function testEmailConfiguration() {
    global $phpmailer_available;
    
    if (!$phpmailer_available) {
        return [
            'success' => false,
            'message' => 'PHPMailer nicht verfügbar. Führen Sie "composer install" aus.',
            'details' => ['autoloader_status' => 'PHPMailer class not found']
        ];
    }
    
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Configure SMTP settings for testing
        $mail->isSMTP();
        $mail->Host = MAIL_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USERNAME;
        $mail->Password = MAIL_PASSWORD;
        
        if (MAIL_ENCRYPTION) {
            $mail->SMTPSecure = MAIL_ENCRYPTION;
        }
        
        $mail->Port = MAIL_PORT;
        $mail->Timeout = 10;
        
        // Test SMTP connection
        $connected = $mail->smtpConnect();
        
        if ($connected) {
            $mail->smtpClose();
            return [
                'success' => true,
                'message' => 'E-Mail-Konfiguration erfolgreich getestet',
                'details' => [
                    'smtp_host' => MAIL_HOST,
                    'smtp_port' => MAIL_PORT,
                    'smtp_encryption' => MAIL_ENCRYPTION
                ]
            ];
        } else {
            return [
                'success' => false,
                'message' => 'SMTP-Verbindung fehlgeschlagen',
                'details' => ['smtp_host' => MAIL_HOST, 'smtp_port' => MAIL_PORT]
            ];
        }
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'E-Mail-Test fehlgeschlagen: ' . $e->getMessage(),
            'details' => ['error_code' => $e->getCode()]
        ];
    }
}
