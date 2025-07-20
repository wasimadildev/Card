import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Filter,
  Calendar,
  Building2,
  TrendingUp
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToExcel, exportFilteredData } from '@/utils/excelExport';

const ExportPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    relevancy: '',
    dateFrom: '',
    dateTo: '',
    company: '',
  });

  const [previewCount, setPreviewCount] = useState(state.submissions.length);

  // Update preview count when filters change
  React.useEffect(() => {
    let filteredData = state.submissions;

    if (filters.relevancy) {
      filteredData = filteredData.filter(d => d.relevancy === filters.relevancy);
    }

    if (filters.dateFrom) {
      filteredData = filteredData.filter(d => 
        new Date(d.submittedAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filteredData = filteredData.filter(d => 
        new Date(d.submittedAt) <= new Date(filters.dateTo)
      );
    }

    if (filters.company) {
      filteredData = filteredData.filter(d => 
        d.companyName.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    setPreviewCount(filteredData.length);
  }, [filters, state.submissions]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleExportAll = (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        exportToCSV(state.submissions);
      } else {
        exportToExcel(state.submissions);
      }
      toast({
        title: 'Export Successful',
        description: `All data exported to ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: `Failed to export data to ${format.toUpperCase()}.`,
        variant: 'destructive',
      });
    }
  };

  const handleExportFiltered = (format: 'csv' | 'excel') => {
    try {
      const filterObject = {
        relevancy: filters.relevancy || undefined,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
        company: filters.company || undefined,
      };

      exportFilteredData(state.submissions, filterObject, format);
      
      toast({
        title: 'Export Successful',
        description: `Filtered data (${previewCount} records) exported to ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: `Failed to export filtered data to ${format.toUpperCase()}.`,
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      relevancy: '',
      dateFrom: '',
      dateTo: '',
      company: '',
    });
  };

  const stats = [
    {
      title: 'Total Records',
      value: state.submissions.length,
      icon: FileText,
      color: 'text-primary',
    },
    {
      title: 'After Filters',
      value: previewCount,
      icon: Filter,
      color: 'text-accent',
    },
    {
      title: 'Companies',
      value: new Set(state.submissions.map(s => s.companyName)).size,
      icon: Building2,
      color: 'text-success',
    },
  ];

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
            <h1 className="text-3xl font-bold text-foreground">Export Data</h1>
            <p className="text-muted-foreground">Download your contact submissions in CSV or Excel format</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Quick Export
            </CardTitle>
            <CardDescription>
              Export all your data without any filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => handleExportAll('csv')} 
                variant="outline" 
                size="lg" 
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export All to CSV
              </Button>
              <Button 
                onClick={() => handleExportAll('excel')} 
                variant="default" 
                size="lg" 
                className="flex-1"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export All to Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtered Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtered Export
            </CardTitle>
            <CardDescription>
              Apply filters and export specific data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="relevancy">Relevancy</Label>
                <Select value={filters.relevancy} onValueChange={(value) => handleFilterChange('relevancy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All relevancy levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={filters.company}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  placeholder="Filter by company name"
                />
              </div>

              <div>
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {previewCount} of {state.submissions.length} records
                </Badge>
                {(filters.relevancy || filters.company || filters.dateFrom || filters.dateTo) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Export Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => handleExportFiltered('csv')} 
                variant="outline" 
                size="lg" 
                className="flex-1"
                disabled={previewCount === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Filtered to CSV
              </Button>
              <Button 
                onClick={() => handleExportFiltered('excel')} 
                variant="default" 
                size="lg" 
                className="flex-1"
                disabled={previewCount === 0}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Filtered to Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Information */}
        <Card>
          <CardHeader>
            <CardTitle>Export Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">CSV Format</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Plain text format, comma-separated values</li>
                  <li>Compatible with any spreadsheet application</li>
                  <li>Smaller file size</li>
                  <li>Single sheet with all data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Excel Format</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Native Excel format (.xlsx)</li>
                  <li>Includes formatting and multiple sheets</li>
                  <li>Summary sheet with statistics</li>
                  <li>Auto-sized columns for better readability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportPage;