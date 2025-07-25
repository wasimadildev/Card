import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Dashboard from "./components/Dashboard";
import ManualForm from "./components/ManualForm";
import OCRUploader from "./components/OCRUploader";
import QRScanner from "./components/QRScanner";
import Login from "./components/Login";
import UserLogin from "./components/UserLogin";
import AdminPanel from "./components/AdminPanel";
import ExportPage from "./components/ExportPage";
import ProtectedRoute from "./components/ProtectedRoute";
import UserHistory from "./components/UserHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// User Authentication Wrapper Component
const UserProtectedRoute = ({ children }) => {
  const isUserLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  
  if (!isUserLoggedIn) {
    return <UserLogin />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/user-login" element={<UserLogin />} />
            
            {/* User Protected Routes */}
            <Route 
              path="/" 
              element={
                <UserProtectedRoute>
                  <Dashboard />
                </UserProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <UserProtectedRoute>
                  <Dashboard />
                </UserProtectedRoute>
              } 
            />
            <Route 
              path="/manual-form" 
              element={
                <UserProtectedRoute>
                  <ManualForm />
                </UserProtectedRoute>
              } 
            />
            <Route 
              path="/ocr-upload" 
              element={
                <UserProtectedRoute>
                  <OCRUploader />
                </UserProtectedRoute>
              } 
            />
            <Route 
              path="/qr-scanner" 
              element={
                <UserProtectedRoute>
                  <QRScanner />
                </UserProtectedRoute>
              } 
            />
            <Route 
              path="/export" 
              element={
                <UserProtectedRoute>
                  <ExportPage />
                </UserProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <UserProtectedRoute>
                  <UserHistory />
                </UserProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;