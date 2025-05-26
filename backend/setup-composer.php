
<?php
/**
 * Composer Setup Script for KeyEff Call Panel
 * Automatically installs PHPMailer and other dependencies
 */

echo "KeyEff Call Panel - Composer Setup\n";
echo "==================================\n\n";

// Check if we're in the right directory
if (!file_exists('composer.json')) {
    echo "❌ Fehler: composer.json nicht gefunden!\n";
    echo "Führen Sie dieses Skript im backend/ Verzeichnis aus.\n";
    exit(1);
}

// Check if composer is available
$composer_check = shell_exec('composer --version 2>&1');
if (strpos($composer_check, 'Composer') === false) {
    echo "❌ Fehler: Composer ist nicht installiert oder nicht im PATH!\n";
    echo "Installieren Sie Composer von https://getcomposer.org/\n";
    exit(1);
}

echo "✅ Composer gefunden: " . trim($composer_check) . "\n\n";

// Run composer install
echo "📦 Installiere PHP-Abhängigkeiten...\n";
echo "=====================================\n";

$install_command = 'composer install --no-dev --optimize-autoloader 2>&1';
$install_output = shell_exec($install_command);

echo $install_output . "\n";

// Check if installation was successful
if (file_exists('vendor/autoload.php')) {
    echo "✅ Installation erfolgreich!\n\n";
    
    // Test autoloader
    require_once 'vendor/autoload.php';
    
    if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        echo "✅ PHPMailer erfolgreich installiert und verfügbar\n";
    } else {
        echo "⚠️  PHPMailer installiert, aber Klasse nicht verfügbar\n";
    }
    
    echo "\n📋 Installierte Pakete:\n";
    echo "======================\n";
    
    $composer_lock = json_decode(file_get_contents('composer.lock'), true);
    if ($composer_lock && isset($composer_lock['packages'])) {
        foreach ($composer_lock['packages'] as $package) {
            echo "• " . $package['name'] . " (" . $package['version'] . ")\n";
        }
    }
    
    echo "\n✅ Setup abgeschlossen!\n";
    echo "Sie können nun E-Mails mit 2FA versenden.\n";
    
} else {
    echo "❌ Installation fehlgeschlagen!\n";
    echo "Prüfen Sie die Ausgabe oben für Details.\n";
    exit(1);
}
?>
