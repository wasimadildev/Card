import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Calendar,
  Building2,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FormData } from '@/contexts/AppContext';

const UserHistory: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [showAll, setShowAll] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  // Sort submissions by date (newest first)
  const sortedSubmissions = [...state.submissions].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Show only 2-3 most recent by default
  const displayedSubmissions = showAll ? sortedSubmissions : sortedSubmissions.slice(0, 3);

  const handleEdit = (submission: FormData) => {
    navigate('/manual-form', {
      state: {
        prefilledData: submission,
        isEditing: true,
        editId: submission.id,
      },
    });
  };

  const toggleDetails = (submissionId: string) => {
    setSelectedSubmission(
      selectedSubmission === submissionId ? null : submissionId
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Button variant="outline" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Submission History</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View and edit your submitted forms
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{state.submissions.length}</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {new Set(state.submissions.map(s => s.companyName)).size}
                </p>
                <p className="text-sm text-muted-foreground">Unique Companies</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {state.submissions.filter(s => {
                    const thisWeek = new Date();
                    thisWeek.setDate(thisWeek.getDate() - 7);
                    return new Date(s.submittedAt) >= thisWeek;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Your Submissions</CardTitle>
                <CardDescription>
                  {showAll 
                    ? `Showing all ${state.submissions.length} submissions`
                    : `Showing ${Math.min(3, state.submissions.length)} of ${state.submissions.length} submissions`
                  }
                </CardDescription>
              </div>
              {state.submissions.length > 3 && (
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="gap-2"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      See All ({state.submissions.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {displayedSubmissions.length > 0 ? (
              <div className="space-y-4">
                {displayedSubmissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4 space-y-4">
                    {/* Submission Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {submission.firstName} {submission.lastName}
                          </h3>
                          <Badge variant="outline">
                            {submission.relevancy}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {submission.companyName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDetails(submission.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {selectedSubmission === submission.id ? 'Hide' : 'View'}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEdit(submission)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{submission.email}</span>
                      </div>
                      {submission.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{submission.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Detailed View */}
                    {selectedSubmission === submission.id && (
                      <div className="border-t pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Business Information</h4>
                              <div className="space-y-2 text-sm">
                                <p><strong>Rep:</strong> {submission.rep}</p>
                                <p><strong>Relevancy:</strong> {submission.relevancy}</p>
                                {submission.lob && (
                                  <p><strong>LOB:</strong> {Array.isArray(submission.lob) ? submission.lob.join(', ') : submission.lob}</p>
                                )}
                                {submission.tier && (
                                  <p><strong>Tier:</strong> {submission.tier}</p>
                                )}
                                {submission.volume && (
                                  <p><strong>Volume:</strong> {submission.volume}</p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Partner Details</h4>
                              <div className="flex flex-wrap gap-1">
                                {submission.partnerDetails.map(detail => (
                                  <Badge key={detail} variant="outline" className="text-xs">
                                    {detail}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Target Regions</h4>
                              <div className="flex flex-wrap gap-1">
                                {submission.targetRegions.map(region => (
                                  <Badge key={region} variant="secondary" className="text-xs">
                                    {region}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {submission.notes && (
                              <div>
                                <h4 className="font-semibold mb-2">Notes</h4>
                                <p className="text-sm bg-muted p-3 rounded border">{submission.notes}</p>
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                              <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                              <p><strong>Add Associates:</strong> {submission.addAssociates === 'yes' ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any forms yet. Start by adding your first contact!
                </p>
                <Button onClick={() => navigate('/manual-form')}>
                  Create First Submission
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserHistory;