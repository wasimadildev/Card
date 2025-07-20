import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, QrCode, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';

const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrResult, setQrResult] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const scanQRCode = async () => {
    if (!file) return;

    setIsProcessing(true);
    setQrResult('');
    setWhatsappNumber('');

    try {
      // Create image element
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Scan for QR code
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (qrCode) {
          setQrResult(qrCode.data);
          
          // Extract WhatsApp number
          const extractedNumber = extractWhatsAppNumber(qrCode.data);
          if (extractedNumber) {
            setWhatsappNumber(extractedNumber);
            toast({
              title: 'QR Code Scanned!',
              description: `WhatsApp number found: ${extractedNumber}`,
            });
          } else {
            toast({
              title: 'QR Code Scanned',
              description: 'QR code found but no WhatsApp number detected',
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'No QR Code Found',
            description: 'Could not detect a QR code in this image',
            variant: 'destructive',
          });
        }
        
        setIsProcessing(false);
      };

      img.onerror = () => {
        toast({
          title: 'Image Error',
          description: 'Failed to load the image',
          variant: 'destructive',
        });
        setIsProcessing(false);
      };

      img.src = preview;

    } catch (error) {
      console.error('QR scanning error:', error);
      toast({
        title: 'Scanning Failed',
        description: 'Failed to scan QR code. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const extractWhatsAppNumber = (qrData: string): string | null => {
    // WhatsApp QR codes typically contain URLs like:
    // https://wa.me/1234567890
    // https://api.whatsapp.com/send?phone=1234567890
    // Or just phone numbers
    
    try {
      // Check for WhatsApp URL patterns
      const waUrlPatterns = [
        /wa\.me\/(\+?\d+)/i,
        /whatsapp\.com\/send\?phone=(\+?\d+)/i,
        /api\.whatsapp\.com\/send\?phone=(\+?\d+)/i,
      ];

      for (const pattern of waUrlPatterns) {
        const match = qrData.match(pattern);
        if (match) {
          return match[1];
        }
      }

      // Check if it's just a phone number
      const phonePattern = /^\+?\d{10,15}$/;
      if (phonePattern.test(qrData.trim())) {
        return qrData.trim();
      }

      return null;
    } catch (error) {
      console.error('Error extracting WhatsApp number:', error);
      return null;
    }
  };

  const proceedToForm = () => {
    navigate('/manual-form', {
      state: {
        prefilledData: {
          whatsapp: whatsappNumber,
        },
        qrData: qrResult,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">WhatsApp QR Scanner</h1>
            <p className="text-muted-foreground">Upload a WhatsApp QR code to extract the phone number</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload QR Code Image
              </CardTitle>
              <CardDescription>
                Select an image containing a WhatsApp QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="qr-file-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="qr-file-upload" className="cursor-pointer">
                  <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Click to upload QR code</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </label>
              </div>

              {file && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                  
                  <Button 
                    onClick={scanQRCode} 
                    className="w-full" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Scanning...' : 'Scan QR Code'}
                  </Button>
                </div>
              )}

              {whatsappNumber && (
                <div className="space-y-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">WhatsApp Number Found!</span>
                  </div>
                  <p className="text-lg font-mono">{whatsappNumber}</p>
                  <Button onClick={proceedToForm} className="w-full" variant="success">
                    Continue to Form
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview & Results</CardTitle>
              <CardDescription>
                {preview ? 'QR code preview and scan results' : 'Upload an image to see preview'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview && (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden bg-background">
                    <img 
                      src={preview} 
                      alt="QR code preview" 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                  
                  {qrResult && (
                    <div className="space-y-2">
                      <h4 className="font-medium">QR Code Content:</h4>
                      <div className="bg-muted p-4 rounded-lg max-h-32 overflow-y-auto">
                        <code className="text-sm break-all">
                          {qrResult}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!preview && (
                <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                  <div className="text-center">
                    <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No QR code image selected</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>How to Get WhatsApp QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">From WhatsApp Mobile:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Open WhatsApp</li>
                  <li>Go to Settings</li>
                  <li>Tap on QR icon next to your name</li>
                  <li>Take a screenshot or save the QR code</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">From WhatsApp Web:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Go to web.whatsapp.com</li>
                  <li>Screenshot the QR code displayed</li>
                  <li>Or ask someone to show their QR code</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScanner;