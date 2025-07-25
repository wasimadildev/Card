import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, FileImage, Loader2, Camera, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Tesseract from 'tesseract.js';

const OCRUploader: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          setFile(file);
          setPreview(canvas.toDataURL());
          stopCamera();
          setActiveTab('preview');
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const enhanceImageForOCR = async (imageFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Scale up small images for better OCR
        const scale = Math.max(1, 1500 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        if (ctx) {
          // Apply image enhancements
          ctx.filter = 'contrast(1.2) brightness(1.1) saturate(0.8)';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert back to file
          canvas.toBlob((blob) => {
            if (blob) {
              const enhancedFile = new File([blob], imageFile.name, { 
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(enhancedFile);
            } else {
              resolve(imageFile);
            }
          }, 'image/jpeg', 0.95);
        } else {
          resolve(imageFile);
        }
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const extractTextFromImage = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Enhance image for better OCR
      const enhancedFile = await enhanceImageForOCR(file);
      
      const result = await Tesseract.recognize(enhancedFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setExtractedText(result.data.text);
      
      // Parse extracted text and navigate to manual form with pre-filled data
      const parsedData = parseBusinessCardText(result.data.text);
      
      toast({
        title: 'OCR Complete!',
        description: 'Text extracted successfully. Redirecting to form...',
      });

      // Navigate to manual form with extracted data
      setTimeout(() => {
        navigate('/manual-form', { 
          state: { 
            prefilledData: parsedData,
            extractedText: result.data.text 
          } 
        });
      }, 1500);

    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: 'OCR Failed',
        description: 'Failed to extract text from image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseBusinessCardText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsedData: any = {};

    // Enhanced email detection
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatches = [...text.matchAll(emailRegex)];
    if (emailMatches.length > 0) {
      parsedData.email = emailMatches[0][0];
    }

    // Enhanced phone number detection with international support
    const phoneRegexes = [
      /\+\d{1,4}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, // International format
      /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/g, // US format with parentheses
      /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, // Basic format
      /\+\d{10,15}/g // Simple international
    ];
    
    for (const regex of phoneRegexes) {
      const phoneMatches = [...text.matchAll(regex)];
      if (phoneMatches.length > 0) {
        parsedData.phone = phoneMatches[0][0];
        break;
      }
    }

    // Enhanced name extraction
    const nameLines = lines.filter(line => {
      const cleanLine = line.trim();
      return cleanLine.length > 2 && 
             cleanLine.length < 50 &&
             !emailRegex.test(cleanLine) &&
             !phoneRegexes.some(regex => regex.test(cleanLine)) &&
             /^[A-Za-z\s.-]+$/.test(cleanLine) && // Only letters, spaces, dots, hyphens
             cleanLine.split(' ').length <= 4; // Reasonable name length
    });
    
    if (nameLines.length > 0) {
      const nameParts = nameLines[0].trim().split(/\s+/);
      if (nameParts.length >= 2) {
        parsedData.firstName = nameParts[0];
        parsedData.lastName = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1) {
        parsedData.firstName = nameParts[0];
      }
    }

    // Enhanced company detection
    const companyKeywords = [
      'LLC', 'Inc', 'Corp', 'Ltd', 'Company', 'Co.', 'Solutions', 'Group', 
      'Technologies', 'Tech', 'Services', 'Consulting', 'Partners', 'Associates',
      'Holdings', 'Enterprises', 'Industries', 'Systems', 'Software', 'Digital'
    ];
    
    let companyCandidate = lines.find(line => 
      companyKeywords.some(keyword => 
        line.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    // If no company with keywords, try to find lines that look like company names
    if (!companyCandidate) {
      companyCandidate = lines.find(line => {
        const cleanLine = line.trim();
        return cleanLine.length > 3 && 
               cleanLine.length < 100 &&
               !emailRegex.test(cleanLine) &&
               !phoneRegexes.some(regex => regex.test(cleanLine)) &&
               !/^[A-Za-z]+\s[A-Za-z]+$/.test(cleanLine) && // Not just first/last name
               /[A-Z]/.test(cleanLine); // Has capital letters
      });
    }
    
    if (companyCandidate) {
      parsedData.companyName = companyCandidate.trim();
    }

    console.log('OCR Parsed Data:', parsedData);
    return parsedData;
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
            <h1 className="text-3xl font-bold text-foreground">OCR Business Card Upload</h1>
            <p className="text-muted-foreground">Upload a business card image to extract contact information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Business Card Scanner
              </CardTitle>
              <CardDescription>
                Choose your preferred method to capture business card information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload File</span>
                    <span className="sm:hidden">File</span>
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="flex items-center gap-2 lg:hidden">
                    <Camera className="h-4 w-4" />
                    <span className="hidden sm:inline">Use Camera</span>
                    <span className="sm:hidden">Camera</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4 mt-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 sm:p-8 text-center hover:border-muted-foreground/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      ref={fileInputRef}
                      disabled={isProcessing}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileImage className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-base sm:text-lg font-medium mb-2">Click to upload</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        PNG, JPG, JPEG up to 10MB
                      </p>
                    </label>
                  </div>
                </TabsContent>

                <TabsContent value="camera" className="space-y-4 mt-4">
                  {!isCameraActive ? (
                    <div className="text-center space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 sm:p-8">
                        <Camera className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-base sm:text-lg font-medium mb-2">Use Camera</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                          Capture business card directly with your camera
                        </p>
                        <Button onClick={startCamera} size="lg" className="w-full">
                          <Camera className="h-4 w-4 mr-2" />
                          Start Camera
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 sm:h-80 object-cover"
                        />
                        <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={captureImage} size="lg" className="flex-1">
                          <Camera className="h-4 w-4 mr-2" />
                          Capture
                        </Button>
                        <Button onClick={stopCamera} variant="outline" size="lg">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  {file && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Selected: {file.name}
                      </p>
                      
                      {!isProcessing ? (
                        <Button 
                          onClick={extractTextFromImage} 
                          className="w-full" 
                          size="lg"
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Extract Text with OCR
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Processing image...</span>
                          </div>
                          <Progress value={progress} className="w-full" />
                          <p className="text-xs text-muted-foreground text-center">
                            {progress}% complete
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview & Results</CardTitle>
              <CardDescription>
                {preview ? 'Image preview and extracted text' : 'Capture or upload an image to see preview'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview && (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden bg-background">
                    <img 
                      src={preview} 
                      alt="Business card preview" 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                  
                  {extractedText && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Extracted Text:</h4>
                      <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {extractedText}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!preview && (
                <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                  <div className="text-center">
                    <FileImage className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm sm:text-base">No image selected</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Better OCR Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Camera Capture:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Use good lighting - avoid shadows</li>
                  <li>Hold camera steady and close to card</li>
                  <li>Align card within the capture frame</li>
                  <li>Ensure text is clearly readable</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">File Upload:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Use high resolution images (1500px+)</li>
                  <li>Ensure business card is flat</li>
                  <li>Good contrast between text and background</li>
                  <li>PNG or JPG formats work best</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OCRUploader;
