import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, FileImage, Loader2 } from 'lucide-react';
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

  const extractTextFromImage = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
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
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Business Card
              </CardTitle>
              <CardDescription>
                Select a clear image of a business card for text extraction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Click to upload</p>
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
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                {preview ? 'Image preview and extracted text' : 'Upload an image to see preview'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview && (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
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
                    <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No image selected</p>
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
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Use a well-lit environment when taking photos</li>
              <li>Ensure the business card is flat and not wrinkled</li>
              <li>Keep the camera steady and avoid blurry images</li>
              <li>Make sure all text is clearly visible and not cut off</li>
              <li>Higher resolution images generally produce better results</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OCRUploader;