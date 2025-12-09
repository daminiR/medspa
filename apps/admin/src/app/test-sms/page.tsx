'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Key, Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function TestSMSPage() {
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+17652500332');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const sendSMS = async () => {
    setLoading(true);
    setResult(null);
    setVerifyResult(null);
    
    try {
      const url = `/api/test-verify?phone=${encodeURIComponent(phoneNumber)}${authToken ? `&token=${authToken}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setVerifyLoading(true);
    setVerifyResult(null);
    
    try {
      const response = await fetch('/api/test-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          code: verificationCode,
          token: authToken 
        })
      });
      const data = await response.json();
      setVerifyResult(data);
    } catch (error: any) {
      setVerifyResult({ error: error.message });
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Twilio SMS Test
          </CardTitle>
          <CardDescription>
            Test SMS functionality using Twilio Verify Service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Credentials Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Your Twilio Credentials:</p>
            <div className="text-xs font-mono space-y-1">
              <div>Account SID: Set in .env.local (TWILIO_ACCOUNT_SID)</div>
              <div>Verify Service: Set in .env.local (TWILIO_VERIFY_SERVICE_SID)</div>
              <div>Service Name: Luxe EMR</div>
            </div>
          </div>

          {/* Auth Token Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Auth Token
            </label>
            <Input
              type="password"
              placeholder="Your Twilio Auth Token (find it in Twilio Console)"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Go to console.twilio.com → Click "Show auth token" → Copy & paste here
            </p>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +17652500332)
            </p>
          </div>

          {/* Send Button */}
          <Button 
            onClick={sendSMS} 
            disabled={loading || !authToken}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Verification Code
              </>
            )}
          </Button>

          {/* Result Display */}
          {result && (
            <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
              <AlertDescription>
                {result.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">SMS Sent Successfully!</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Status: {result.status}</div>
                      <div>SID: {result.sid}</div>
                      <div className="font-medium mt-2">
                        📱 Check your phone for: "Your Luxe EMR verification code is: XXXXXX"
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <div className="text-sm">
                      {result.error}
                      {result.code && <div>Code: {result.code}</div>}
                      {result.help && <div className="mt-2">{result.help}</div>}
                      {result.instructions && (
                        <div className="mt-2 space-y-1">
                          {result.instructions.map((inst: string, i: number) => (
                            <div key={i}>{inst}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Code Section */}
          {result?.success && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium">Step 2: Verify the Code</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button 
                onClick={verifyCode} 
                disabled={verifyLoading || !verificationCode}
                className="w-full"
                variant="outline"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
              
              {verifyResult && (
                <Alert className={verifyResult.valid ? 'border-green-500' : 'border-red-500'}>
                  <AlertDescription>
                    {verifyResult.valid ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Code Verified Successfully!</span>
                      </div>
                    ) : (
                      <div className="text-sm">
                        Status: {verifyResult.status || verifyResult.error}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Quick Test Commands */}
          <div className="border-t pt-6 space-y-3">
            <p className="text-sm font-medium">Alternative: Test with cURL</p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`curl -X GET "http://localhost:3000/api/test-verify?phone=${phoneNumber}&token=YOUR_AUTH_TOKEN"`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}