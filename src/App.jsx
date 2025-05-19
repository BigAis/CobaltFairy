import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ApiService, isJwtTokenExpired } from './service/api-service'
import Dashboard from './pages/dashboard/dashboard'
import LogIn from './pages/login/login'
import User from './pages/register/register'
import Desing from './desing'
import TwoFactorLogin from './pages/login/two-factor-login/two-factor-login'
import ResetPassword from './pages/resetPassword/reset-password'
import PaymentPlan from './pages/payment-plan/payment-plan'
import Campaigns from './pages/campaigns/Campaigns'
import EditCampaign from './pages/campaigns/EditCampaign'
import Subscribers from './pages/subscribers/subscribers'
import NewCampaign from './pages/campaigns/NewCampaign'
import Integrations from './pages/integrations/integrations'
import Automations from './pages/automations/automations'
import EditAutomation from './pages/automations/edit-automation'
import AccountPicker from './pages/accountPicker/accountPicker'
import FlowEditor from './pages/automations/FlowEditor'
import EditTemplate from './pages/templates/EditTemplate'
import EditSubscriber from './pages/subscribers/EditSubscriber'
import EditGroup from './pages/subscribers/EditGroup'
import BookFunnel from './pages/integrations/BookFunnel'
import EditCustomField from './pages/subscribers/EditCustomField'
import NewCustomField from './pages/subscribers/NewCustomField'
import NotificationContainer from './components/NotificationContainer/NotificationContainer'
import Settings from './pages/settings/settings'
import Billing from './pages/billing/billing'


// A wrapper component to handle authentication check
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      const fairymail_session = localStorage.getItem('fairymail_session');
      
      // Don't redirect if we're on login or 2FA pages
      if (location.pathname === '/login' || location.pathname === '/login/2FA' || location.pathname === '/register') {
        setIsCheckingAuth(false);
        return;
      }
      
      if (!fairymail_session) {
        console.log('No session found, redirecting to login');
        navigate('/login', { replace: true });
        setIsCheckingAuth(false);
        return;
      }
      
      try {
        const userData = JSON.parse(decodeURIComponent(fairymail_session));
        if (!userData.jwt || isJwtTokenExpired(userData.jwt)) {
          console.log('JWT token expired or invalid, redirecting to login');
          localStorage.removeItem('fairymail_session');
          navigate('/login', { replace: true });
        } else {
          console.log('Valid session found');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error parsing session data:", error);
        localStorage.removeItem('fairymail_session');
        navigate('/login', { replace: true });
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [navigate, location.pathname]);

  if (isCheckingAuth) {
    // Show loading state while checking authentication
    return <div>Checking authentication...</div>;
  }

  return isAuthenticated ? children : null;
};

function App() {
  return (
    <div className="App">
      {/* Global notification container */}
      <NotificationContainer />
      
      <Routes>
        {/* Public routes that don't require authentication */}
        <Route path="/login" element={<LogIn />} />
        <Route path="/login/2FA" element={<TwoFactorLogin />} />
        <Route path="/register" element={<User />} />
        <Route path="/reset-password/:id" element={<ResetPassword />} />
        
        {/* Default route - redirect based on auth status */}
        <Route 
          path="/" 
          element={
            localStorage.getItem('fairymail_session') 
              ? <Navigate to='/dashboard' replace /> 
              : <Navigate to='/login' replace />
          } 
        />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/design" element={<ProtectedRoute><Desing /></ProtectedRoute>} />
        <Route path="/payment-plan" element={<ProtectedRoute><PaymentPlan /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
        <Route path="/campaigns/new" element={<ProtectedRoute><NewCampaign /></ProtectedRoute>} />
        <Route path="/campaigns/edit/:uuid" element={<ProtectedRoute><NewCampaign /></ProtectedRoute>} />
        <Route path="/templates/edit/:uuid" element={<ProtectedRoute><EditTemplate /></ProtectedRoute>} />
        <Route path="/campaigns/overview/:uuid" element={<ProtectedRoute><EditCampaign /></ProtectedRoute>} />
        <Route path="/subscribers" element={<ProtectedRoute><Subscribers /></ProtectedRoute>} />
        <Route path="/subscribers/:uuid" element={<ProtectedRoute><EditSubscriber /></ProtectedRoute>} />
        <Route path="/subscribers/field/edit" element={<ProtectedRoute><EditCustomField /></ProtectedRoute>} />
        <Route path="/subscribers/field/new" element={<ProtectedRoute><NewCustomField /></ProtectedRoute>} />
        <Route path="/subscribers/filters/:filterString" element={<ProtectedRoute><Subscribers /></ProtectedRoute>} />
        <Route path="/subscribers/group/new" element={<ProtectedRoute><EditGroup /></ProtectedRoute>} />
        <Route path="/subscribers/group/:uuid" element={<ProtectedRoute><EditGroup /></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
        <Route path="/integrations/bookfunnel/:mode?" element={<ProtectedRoute><BookFunnel /></ProtectedRoute>} />
        <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
        <Route path="/automations/:autId" element={<ProtectedRoute><EditAutomation /></ProtectedRoute>} />
        <Route path="/automations/editor/:autId" element={<ProtectedRoute><FlowEditor /></ProtectedRoute>} />
        <Route path="/choose-account" element={<ProtectedRoute><AccountPicker /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/settings/:section" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/billing/:tab" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/billing/overview" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/billing/invoice-details" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/billing/payment-methods" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;