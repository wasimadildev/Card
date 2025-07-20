import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FormData } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const ManualForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useApp();
  const { toast } = useToast();

  // Get pre-filled data from navigation state (from OCR or QR scanner)
  const prefilledData = location.state?.prefilledData || {};
  const extractedText = location.state?.extractedText;
  const qrData = location.state?.qrData;

  const [formData, setFormData] = useState({
    rep: prefilledData.rep || '',
    relevancy: prefilledData.relevancy || '',
    companyName: prefilledData.companyName || '',
    firstName: prefilledData.firstName || '',
    lastName: prefilledData.lastName || '',
    email: prefilledData.email || '',
    phone: prefilledData.phone || '',
    whatsapp: prefilledData.whatsapp || '',
    partnerDetails: prefilledData.partnerDetails || [] as string[],
    targetRegions: prefilledData.targetRegions || [] as string[],
    lob: prefilledData.lob || '',
    tier: prefilledData.tier || '',
    grades: prefilledData.grades || '',
    volume: prefilledData.volume || '',
    addAssociates: prefilledData.addAssociates || false,
    notes: prefilledData.notes || '',
    businessCardUrl: prefilledData.businessCardUrl || '',
  });

  const [businessCardFile, setBusinessCardFile] = useState<File | null>(null);

  const partnerOptions = [
    'Authorized Reseller',
    'Distributor',
    'System Integrator',
    'Technology Partner',
    'Channel Partner',
    'OEM Partner',
  ];

  const regionOptions = [
    'North America',
    'South America',
    'Europe',
    'Asia Pacific',
    'Middle East',
    'Africa',
  ];

  const tierOptions = ['Tier 1', 'Tier 2', 'Tier 3', 'Enterprise'];
  const lobOptions = ['Healthcare', 'Education', 'Finance', 'Manufacturing', 'Retail', 'Government'];
  const relevancyOptions = ['High', 'Medium', 'Low'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: 'partnerDetails' | 'targetRegions', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBusinessCardFile(file);
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, businessCardUrl: imageUrl }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (First Name, Last Name, Email)',
        variant: 'destructive',
      });
      return;
    }

    const submission: FormData = {
      id: Date.now().toString(),
      ...formData,
      submittedAt: new Date(),
    };

    dispatch({ type: 'ADD_SUBMISSION', payload: submission });
    
    toast({
      title: 'Success!',
      description: 'Contact information has been saved successfully.',
      variant: 'default',
    });

    navigate('/');
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
            <h1 className="text-3xl font-bold text-foreground">Manual Entry Form</h1>
            <p className="text-muted-foreground">
              {extractedText ? 'Form pre-filled from business card OCR' :
               qrData ? 'Form pre-filled from QR code scan' :
               'Enter contact information manually'}
            </p>
          </div>
        </div>

        {/* Pre-filled Data Alert */}
        {(extractedText || qrData) && (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-success mb-2">
                <Upload className="h-4 w-4" />
                <span className="font-medium">
                  {extractedText ? 'Data extracted from business card' : 'Data extracted from QR code'}
                </span>
              </div>
              {extractedText && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View extracted text
                  </summary>
                  <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                    {extractedText}
                  </pre>
                </details>
              )}
              {qrData && (
                <p className="text-sm text-muted-foreground">
                  QR Code: {qrData}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Primary contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rep">Rep *</Label>
                  <Input
                    id="rep"
                    value={formData.rep}
                    onChange={(e) => handleInputChange('rep', e.target.value)}
                    placeholder="Sales representative"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="relevancy">Relevancy *</Label>
                  <Select value={formData.relevancy} onValueChange={(value) => handleInputChange('relevancy', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relevancy" />
                    </SelectTrigger>
                    <SelectContent>
                      {relevancyOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Communication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="US"
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value || '')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="US"
                    value={formData.whatsapp}
                    onChange={(value) => handleInputChange('whatsapp', value || '')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner Details */}
          <Card>
            <CardHeader>
              <CardTitle>Partner Details</CardTitle>
              <CardDescription>Select applicable partner types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partnerOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`partner-${option}`}
                      checked={formData.partnerDetails.includes(option)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('partnerDetails', option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`partner-${option}`}>{option}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Target regions and business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">Target Regions</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {regionOptions.map(region => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={formData.targetRegions.includes(region)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('targetRegions', region, checked as boolean)
                        }
                      />
                      <Label htmlFor={`region-${region}`}>{region}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lob">Line of Business</Label>
                  <Select value={formData.lob} onValueChange={(value) => handleInputChange('lob', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select LOB" />
                    </SelectTrigger>
                    <SelectContent>
                      {lobOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <Select value={formData.tier} onValueChange={(value) => handleInputChange('tier', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tierOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grades">Grades</Label>
                  <Input
                    id="grades"
                    value={formData.grades}
                    onChange={(e) => handleInputChange('grades', e.target.value)}
                    placeholder="e.g., A+, B, C"
                  />
                </div>
                <div>
                  <Label htmlFor="volume">Volume</Label>
                  <Input
                    id="volume"
                    value={formData.volume}
                    onChange={(e) => handleInputChange('volume', e.target.value)}
                    placeholder="Expected volume"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addAssociates"
                  checked={formData.addAssociates}
                  onCheckedChange={(checked) => handleInputChange('addAssociates', checked)}
                />
                <Label htmlFor="addAssociates">Add Associates</Label>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or comments"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="businessCard">Upload Business Card</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="businessCard"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('businessCard')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {businessCardFile ? businessCardFile.name : 'Choose file'}
                  </Button>
                </div>
                {formData.businessCardUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.businessCardUrl}
                      alt="Business card preview"
                      className="max-w-xs rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              Save Contact
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualForm;