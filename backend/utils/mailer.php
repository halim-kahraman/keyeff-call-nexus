
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Check if we need to include the vendor autoload file
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} else {
    debugLog('PHPMailer autoload file not found');
}

/**
 * Send an email using PHPMailer
 * 
 * @param string $to Recipient email
 * @param string $subject Email subject
 * @param string $body Email body (HTML)
 * @param string $altBody Plain text alternative (optional)
 * @return bool True if email was sent successfully, false otherwise
 */
function sendMail($to, $subject, $body, $altBody = '') {
    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);
    
    try {
        // Debug level (0 = off, 4 = verbose)
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = MAIL_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USERNAME;
        $mail->Password = MAIL_PASSWORD;
        
        if (MAIL_ENCRYPTION) {
            $mail->SMTPSecure = MAIL_ENCRYPTION;
        }
        
        $mail->Port = MAIL_PORT;
        $mail->CharSet = 'UTF-8';
        
        // Recipients
        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($to);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = $altBody ?: strip_tags($body);
        
        // Send the email
        $mail->send();
        debugLog('Email sent successfully', [
            'to' => $to, 
            'subject' => $subject
        ]);
        return true;
    } catch (Exception $e) {
        debugLog('Email could not be sent', [
            'to' => $to, 
            'error' => $mail->ErrorInfo
        ]);
        return false;
    }
}

/**
 * Send password reset email
 * 
 * @param string $email Recipient email
 * @param string $name Recipient name
 * @param string $resetCode Password reset code
 * @return bool True if email was sent successfully, false otherwise
 */
function sendPasswordResetEmail($email, $name, $resetCode) {
    $subject = APP_NAME . ' - Passwort zurücksetzen';
    
    // Create HTML email with reset code
    $body = '
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4577D4; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
            .code { font-size: 24px; padding: 10px; background-color: #f5f5f5; margin: 15px 0; text-align: center; letter-spacing: 5px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Passwort zurücksetzen</h2>
            </div>
            <div class="content">
                <p>Hallo ' . htmlspecialchars($name) . ',</p>
                <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Konto bei ' . APP_NAME . ' gestellt.</p>
                <p>Hier ist Ihr Bestätigungscode:</p>
                <div class="code">' . $resetCode . '</div>
                <p>Dieser Code ist 15 Minuten gültig. Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie bitte diese E-Mail.</p>
                <p>Mit freundlichen Grüßen,<br>Das ' . APP_NAME . ' Team</p>
            </div>
            <div class="footer">
                <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
            </div>
        </div>
    </body>
    </html>';
    
    return sendMail($email, $subject, $body);
}
