
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
    
    if (class_exists('Firebase\\JWT\\JWT')) {
        echo "✅ JWT erfolgreich installiert und verfügbar\n";
    } else {
        echo "⚠️  JWT installiert, aber Klasse nicht verfügbar\n";
    }
    
    echo "\n📋 Installierte Pakete:\n";
    echo "======================\n";
    
    $composer_lock = json_decode(file_get_contents('composer.lock'), true);
    if ($composer_lock && isset($composer_lock['packages'])) {
        foreach ($composer_lock['packages'] as $package) {
            echo "• " . $package['name'] . " (" . $package['version'] . ")\n";
        }
    }
    
    echo "\n🔧 Prüfe PSR-4 Autoloading...\n";
    echo "==============================\n";
    
    // Test if our model classes can be loaded with PSR-4
    try {
        $testClasses = [
            'KeyEff\\CallPanel\\Models\\User',
            'KeyEff\\CallPanel\\Models\\Setting',
            'KeyEff\\CallPanel\\Models\\Log',
            'KeyEff\\CallPanel\\Models\\Campaign',
            'KeyEff\\CallPanel\\Models\\Filiale',
            'KeyEff\\CallPanel\\Models\\Appointment'
        ];
        
        foreach ($testClasses as $className) {
            if (class_exists($className)) {
                echo "✅ {$className} erfolgreich geladen\n";
            } else {
                echo "❌ {$className} konnte nicht geladen werden\n";
            }
        }
        
        echo "\n✅ PSR-4 Autoloading konfiguriert\n";
        
    } catch (Exception $e) {
        echo "⚠️  PSR-4 Test fehlgeschlagen: " . $e->getMessage() . "\n";
    }
    
    echo "\n✅ Setup abgeschlossen!\n";
    echo "Sie können nun:\n";
    echo "• E-Mails mit 2FA versenden\n";
    echo "• Alle Model-Klassen mit PSR-4 Autoloading nutzen\n";
    echo "• JWT-Token generieren und validieren\n\n";
    
} else {
    echo "❌ Installation fehlgeschlagen!\n";
    echo "Prüfen Sie die Ausgabe oben für Details.\n";
    exit(1);
}
?>
