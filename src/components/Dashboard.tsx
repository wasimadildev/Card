import React, { useEffect } from 'react';
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
  TrendingUp,
  User,
  LogOut
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();

  // Check if user is authenticated
  const isUserLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isUserLoggedIn) {
      navigate('/user-login');
    }
  }, [isUserLoggedIn, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    navigate('/user-login');
  };

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

  // Show loading or redirect message while checking authentication
  if (!isUserLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-lg mb-4">Redirecting to login...</p>
            <Button onClick={() => navigate('/user-login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Event: ITC Malta
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Streamline your contact management with OCR and QR scanning
            </p>
            {userEmail && (
              <p className="text-sm text-muted-foreground mt-2">
                Welcome back, {userEmail}
              </p>
            )}
          </div>
          
          {/* User Actions */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/admin-login')}
              className="gap-2"
            >
              <Shield className="h-5 w-5" />
              Admin Login
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Quick Actions</CardTitle>
            <CardDescription className="text-center text-lg">
              Choose how you'd like to add new contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {quickActions.map((action, index) => (
                <div key={index} className="text-center space-y-3 sm:space-y-4 flex flex-col h-full">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
                    <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                    {action.description}
                  </p>
                  <Button
                    variant={action.variant}
                    size="lg"
                    onClick={action.onClick}
                    className="w-full mt-auto text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 h-auto min-h-[40px] sm:min-h-[44px]"
                  >
                    <span className="truncate">{action.title}</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
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
      
        {/* Recent Submissions */}
        {state.submissions.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/history')}
                >
                  View All History
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {state.submissions.slice(-3).reverse().map((submission) => (
                  <div key={submission.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-2">
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
                {state.submissions.length > 3 && (
                  <div className="text-center pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/history')}
                    >
                      View {state.submissions.length - 3} more submissions
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;