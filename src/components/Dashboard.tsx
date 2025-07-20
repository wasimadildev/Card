import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  QrCode, 
  FileText, 
  Download, 
  Shield,
  Building2,
  Users,
  TrendingUp 
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();

  const stats = [
    {
      title: 'Total Submissions',
      value: state.submissions.length,
      icon: FileText,
      color: 'text-primary',
    },
    {
      title: 'Companies',
      value: new Set(state.submissions.map(s => s.companyName)).size,
      icon: Building2,
      color: 'text-accent',
    },
    {
      title: 'This Month',
      value: state.submissions.filter(s => {
        const thisMonth = new Date().getMonth();
        return new Date(s.submittedAt).getMonth() === thisMonth;
      }).length,
      icon: TrendingUp,
      color: 'text-success',
    },
  ];

  const quickActions = [
    {
      title: 'Upload Business Card',
      description: 'Extract data from business cards using OCR',
      icon: Upload,
      onClick: () => navigate('/ocr-upload'),
      variant: 'dashboard' as const,
    },
    {
      title: 'Upload WhatsApp QR',
      description: 'Scan QR codes to extract WhatsApp numbers',
      icon: QrCode,
      onClick: () => navigate('/qr-scanner'),
      variant: 'accent' as const,
    },
    {
      title: 'Fill Form Manually',
      description: 'Enter contact information manually',
      icon: FileText,
      onClick: () => navigate('/manual-form'),
      variant: 'default' as const,
    },
    {
      title: 'Download CSV',
      description: 'Export all submissions to CSV/Excel',
      icon: Download,
      onClick: () => navigate('/export'),
      variant: 'success' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Business Card Manager
            </h1>
            <p className="text-xl text-muted-foreground">
              Streamline your contact management with OCR and QR scanning
            </p>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/login')}
            className="gap-2"
          >
            <Shield className="h-5 w-5" />
            Admin Login
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Quick Actions</CardTitle>
            <CardDescription className="text-center text-lg">
              Choose how you'd like to add new contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <action.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {action.description}
                  </p>
                  <Button
                    variant={action.variant}
                    size="lg"
                    onClick={action.onClick}
                    className="w-full"
                  >
                    {action.title}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {state.submissions.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.submissions.slice(-5).reverse().map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {submission.firstName} {submission.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {submission.companyName} • {submission.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;