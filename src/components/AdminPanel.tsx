import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  LogOut, 
  Download, 
  Search, 
  Filter,
  FileText,
  Users,
  Building2,
  Phone,
  Mail,
  Calendar,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToExcel } from '@/utils/excelExport';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!state.auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const filteredSubmissions = state.submissions.filter(submission =>
    searchTerm === '' ||
    submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    try {
      exportToCSV(state.submissions);
      toast({
        title: 'Export Successful',
        description: 'Data exported to CSV successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data to CSV.',
        variant: 'destructive',
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(state.submissions);
      toast({
        title: 'Export Successful',
        description: 'Data exported to Excel successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data to Excel.',
        variant: 'destructive',
      });
    }
  };

  const stats = [
    {
      title: 'Total Submissions',
      value: state.submissions.length,
      icon: FileText,
      color: 'text-primary',
    },
    {
      title: 'Unique Companies',
      value: new Set(state.submissions.map(s => s.companyName)).size,
      icon: Building2,
      color: 'text-accent',
    },
    {
      title: 'This Week',
      value: state.submissions.filter(s => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(s.submittedAt) >= weekAgo;
      }).length,
      icon: Calendar,
      color: 'text-success',
    },
    {
      title: 'High Relevancy',
      value: state.submissions.filter(s => s.relevancy === 'High').length,
      icon: Users,
      color: 'text-warning',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Welcome back, {state.auth.user?.username}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="shrink-0">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Submissions</CardTitle>
                <CardDescription>
                  Manage and export contact submissions
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={handleExportExcel} variant="default" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                {filteredSubmissions.length} of {state.submissions.length} submissions
              </Badge>
            </div>

            {/* Table */}
            {filteredSubmissions.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Relevancy</TableHead>
                      <TableHead>Partner Details</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.firstName} {submission.lastName}
                        </TableCell>
                        <TableCell>{submission.companyName}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {submission.email}
                            </div>
                            {submission.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {submission.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              submission.relevancy === 'High' ? 'default' :
                              submission.relevancy === 'Medium' ? 'secondary' : 'outline'
                            }
                          >
                            {submission.relevancy}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {submission.partnerDetails.slice(0, 2).map(detail => (
                              <Badge key={detail} variant="outline" className="text-xs">
                                {detail}
                              </Badge>
                            ))}
                            {submission.partnerDetails.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{submission.partnerDetails.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSubmission(
                              selectedSubmission === submission.id ? null : submission.id
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No data has been submitted yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed View */}
        {selectedSubmission && (
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const submission = state.submissions.find(s => s.id === selectedSubmission);
                if (!submission) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Name:</strong> {submission.firstName} {submission.lastName}</p>
                          <p><strong>Company:</strong> {submission.companyName}</p>
                          <p><strong>Email:</strong> {submission.email}</p>
                          <p><strong>Phone:</strong> {submission.phone || 'N/A'}</p>
                          <p><strong>WhatsApp:</strong> {submission.whatsapp || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Business Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Rep:</strong> {submission.rep}</p>
                          <p><strong>Relevancy:</strong> {submission.relevancy}</p>
                          <p><strong>LOB:</strong> {submission.lob || 'N/A'}</p>
                          <p><strong>Tier:</strong> {submission.tier || 'N/A'}</p>
                          <p><strong>Grades:</strong> {submission.grades || 'N/A'}</p>
                          <p><strong>Volume:</strong> {submission.volume || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Partner Details</h4>
                        <div className="space-y-1">
                          {submission.partnerDetails.map(detail => (
                            <Badge key={detail} variant="outline">{detail}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Target Regions</h4>
                        <div className="space-y-1">
                          {submission.targetRegions.map(region => (
                            <Badge key={region} variant="secondary">{region}</Badge>
                          ))}
                        </div>
                      </div>

                      {submission.notes && (
                        <div>
                          <h4 className="font-semibold mb-2">Notes</h4>
                          <p className="text-sm bg-muted p-3 rounded">{submission.notes}</p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                        <p><strong>Add Associates:</strong> {submission.addAssociates ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;