import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ScrollToTop from './utilities/ScrollToTop';
import { Toaster } from './components/ui/sonner';
import AuthLayout from './components/Auth/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './components/Entrance/LandingPage';
import TaskLayout from './components/User/TaskLayout';
import CheckAuth from './components/common/CheckAuth';
import UserProfile from './pages/UserPages/UserProfile';
import NotFound from './pages/auth/NotFound';
import SetNewPassword from './pages/UserPages/SetNewPassword';
import TermsOfService from './components/common/TermsOfService';
import UserHome from './pages/UserPages/UserHome';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import AdminLayout from './components/admin/AdminLayout';
import AdminProfile from './pages/AdminPages/AdminProfile';
import LoadingSpinner from './utilities/LoadingSpinner';
import { useAuthInitialize } from './utilities/hooks/useAuthInitialize';
import ForgotPassword from './pages/auth/ForgotPassword';
import ChangePassword from './pages/auth/ChangePassword';
import AdminDashBoard from './pages/AdminPages/AdminDashBoard';
const App = () => {
  const { isLoading: authInitLoading } = useAuthInitialize();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (authInitLoading || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <ScrollToTop />
      <CheckAuth isAuthenticated={isAuthenticated} user={user}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path='privacy-policy' element={<PrivacyPolicy/>} />
          <Route path='terms-service' element={<TermsOfService/>} />
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path='forgot-password' element={<ForgotPassword/>}/>
            <Route path='change-password' element={<ChangePassword/>}/>
          </Route>
          <Route path="/user" element={<TaskLayout />}>
            <Route path='home' element={<UserHome/>} />
            <Route path='profile' element={<UserProfile/>} />
            <Route path='set-new-password' element={<SetNewPassword/>} />
            </Route>
            <Route path='/admin' element={<AdminLayout/>}>
              <Route path='dashboard' element={<AdminDashBoard/>} />
              <Route path='profile' element={<AdminProfile/>} />
              <Route path='set-new-password' element={<SetNewPassword/>}/>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="bottom-right" />
      </CheckAuth>
    </div>
  );
};

export default App;
          