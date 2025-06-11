
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';

interface TwoFactorFormProps {
  email: string;
  onVerificationComplete: (token: string) => void;
  onBack: () => void;
}

export const TwoFactorForm: React.FC<TwoFactorFormProps> = ({
  email,
  onVerificationComplete,
  onBack
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verify2FA } = useAuth();

  const handleOtpChange = async (value: string) => {
    setOtp(value);
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      await verifyOtp(value);
    }
  };

  const verifyOtp = async (otpValue: string = otp) => {
    if (otpValue.length !== 6) {
      toast.error('Bitte geben Sie den vollständigen 6-stelligen Code ein');
      return;
    }

    setIsLoading(true);

    try {
      await verify2FA(otpValue);
      onVerificationComplete('verified');
    } catch (error) {
      toast.error('Ungültiger Code');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      // Use the centralized authService to resend 2FA code
      await authService.login(email, ''); // This will trigger resend with existing session
      toast.success('Neuer Code wurde gesendet');
    } catch (error) {
      toast.error('Fehler beim Senden des Codes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
        <CardDescription>
          Geben Sie den 6-stelligen Code ein, der an {email} gesendet wurde
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => verifyOtp()}
            disabled={otp.length !== 6 || isLoading}
            className="w-full"
          >
            {isLoading ? 'Verifiziere...' : 'Verifizieren'}
          </Button>

          <div className="flex justify-between text-sm">
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={isLoading}
            >
              Zurück
            </Button>
            <Button
              variant="ghost"
              onClick={handleResendCode}
              disabled={isLoading}
            >
              Code erneut senden
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
