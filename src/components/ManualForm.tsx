import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, Camera } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FormData } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import logo from "../assets/logo.jpeg";

const ManualForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useApp();
  const { toast } = useToast();

  // Get pre-filled data from navigation state (from OCR or QR scanner)
  const prefilledData = location.state?.prefilledData || {};
  const extractedText = location.state?.extractedText;
  const qrData = location.state?.qrData;
  const isEditing = location.state?.isEditing || false;
  const editId = location.state?.editId;

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
    lob: prefilledData.lob || [] as string[],
    tier: prefilledData.tier || '',
    grades: prefilledData.grades || [] as string[],
    volume: prefilledData.volume || '',
    addAssociates: prefilledData.addAssociates || 'no',
    notes: prefilledData.notes || '',
    businessCardUrl: prefilledData.businessCardUrl || '',
  });

  const [businessCardFile, setBusinessCardFile] = useState<File | null>(null);

  // Form options as per requirements
  const repOptions = [
    'Itzik Cohen',
    'Scott Cowie', 
    'Bruno Do Carmo',
    'Praveen Arora',
    'Gil Hanono'
  ];

  const relevancyOptions = [
    'Never done business',
    'Done business within the last 6 months',
    'Done business in the past',
    'Not ideal customer'
  ];

  const partnerOptions = [
    'Carrier/MVNO',
    'Enterprise',
    'Insurance Provider',
    'Retail',
    'Trader',
    'Distributor',
    'E-tail (D2C)',
    'E-tail (Marketplace)'
  ];

  const regionOptions = [
    'Middle East',
    'Europe',
    'USA',
    'LATAM',
    'Asia (Japan, Hongkong)',
    'Australia',
    'China',
    'Africa'
  ];

  const lobOptions = [
    'Phones',
    'Tablets',
    'Accessories',
    'Computers',
    'Wearables',
    'Smart Home',
    'Consumer Electronics'
  ];

  const tierOptions = [
    'New',
    'Lower Grade',
    'Higher Grade',
    'All Grades',
    'Repair Stock'
  ];

  const gradesOptions = [
    'New',
    'ASIS',
    'CPO',
    'CRD',
    'C2',
    'C4',
    'D2',
    'D3',
    'TBG'
  ];

  const volumeOptions = [
    'Under 100',
    'Under 500',
    'Under 1000',
    'Over 2000 units per month'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: 'partnerDetails' | 'targetRegions' | 'lob' | 'grades', value: string, checked: boolean) => {
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

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName?.trim()) errors.push('First Name');
    if (!formData.lastName?.trim()) errors.push('Last Name');
    if (!formData.email?.trim()) errors.push('Email');
    if (!formData.companyName?.trim()) errors.push('Company Name');
    if (!formData.rep?.trim()) errors.push('Rep at the Event');
    if (!formData.relevancy?.trim()) errors.push('Relevancy');
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Please fill in the following required fields: ${validationErrors.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    const submission: FormData = {
      id: Date.now().toString(),
      ...formData,
      submittedAt: new Date().toISOString(),
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Logo, Event Date and Event Name */}
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/ocr-upload')}>
              <Camera className="h-4 w-4 mr-2" />
              Scan with OCR
            </Button>
          </div>
          
          {/* Logo and Event Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-start">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl"><img src={logo} alt="Logo" /></span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground text-left">Event: ITC Malta</h1>
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
                  <Label htmlFor="rep">Rep at the Event *</Label>
                  <Select value={formData.rep} onValueChange={(value) => handleInputChange('rep', value)}>
                    <SelectTrigger className={!formData.rep ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select rep" />
                    </SelectTrigger>
                    <SelectContent>
                      {repOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              <div>
                <Label htmlFor="relevancy">Relevancy *</Label>
                <Select value={formData.relevancy} onValueChange={(value) => handleInputChange('relevancy', value)}>
                  <SelectTrigger className={!formData.relevancy ? 'border-destructive' : ''}>
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
                  className={!formData.companyName ? 'border-destructive' : ''}
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
                    className={!formData.firstName ? 'border-destructive' : ''}
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
                    className={!formData.lastName ? 'border-destructive' : ''}
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
                    className={!formData.email ? 'border-destructive' : ''}
                    required
                  />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Phone Number</Label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="US"
                    value={formData.whatsapp}
                    onChange={(value) => handleInputChange('whatsapp', value || '')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
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

          {/* Target Regions */}
          <Card>
            <CardHeader>
              <CardTitle>Target Regions</CardTitle>
              <CardDescription>Select target regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>

          {/* LOB */}
          <Card>
            <CardHeader>
              <CardTitle>LOB (Line of Business)</CardTitle>
              <CardDescription>Select applicable business lines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lobOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lob-${option}`}
                      checked={formData.lob.includes(option)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('lob', option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`lob-${option}`}>{option}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tier and Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Tier and Grades</CardTitle>
              <CardDescription>Select tier preferences and grades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tier">General Tier Preference</Label>
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

              <div>
                <Label className="text-base font-medium mb-3 block">Grades They Sell</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {gradesOptions.map(grade => (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox
                        id={`grade-${grade}`}
                        checked={formData.grades.includes(grade)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('grades', grade, checked as boolean)
                        }
                      />
                      <Label htmlFor={`grade-${grade}`}>{grade}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Volume</CardTitle>
              <CardDescription>Select volume range</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={formData.volume} onValueChange={(value) => handleInputChange('volume', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select volume" />
                </SelectTrigger>
                <SelectContent>
                  {volumeOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Add Associates */}
          <Card>
            <CardHeader>
              <CardTitle>Add Associates Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="associates-yes"
                    name="addAssociates"
                    value="yes"
                    checked={formData.addAssociates === 'yes'}
                    onChange={(e) => handleInputChange('addAssociates', e.target.value)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="associates-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="associates-no"
                    name="addAssociates"
                    value="no"
                    checked={formData.addAssociates === 'no'}
                    onChange={(e) => handleInputChange('addAssociates', e.target.value)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="associates-no">No</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ManualForm;