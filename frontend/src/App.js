import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import VenuesPage from './pages/VenuesPage';
import VenueDetailPage from './pages/VenueDetailPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AddVenuePage from './pages/AddVenuePage';
import EditVenuePage from './pages/EditVenuePage';
import MyVenuesPage from './pages/MyVenuesPage';
import VenueBookingsPage from './pages/VenueBookingsPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import MyWaitlistPage from './pages/MyWaitlistPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminVenuesPage from './pages/AdminVenuesPage';
import AdminReportPage from './pages/AdminReportPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { VerifyEmailPage, ResendVerificationPage } from './pages/AuthPages';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ConditionalNavbar = () => {
  const { user } = useAuth();
  return !user ? <Navbar /> : null;
};

const Spinner = () => (
  <div style={{ width: 40, height: 40, border: '3px solid #eef0f5', borderTopColor: '#e94560', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
);

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AppLayout>
      <ConditionalNavbar />
      <main style={{ minHeight: '100vh' }}>
        <Routes>
          {/* Public routes — no sidebar */}
          <Route path="/" element={<HomePage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/venues/:id" element={<VenueDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/resend-verification" element={<ResendVerificationPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Protected routes — sidebar shown via AppLayout inside ProtectedRoute */}
          <Route path="/book/:venueId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/my-waitlist" element={<ProtectedRoute><MyWaitlistPage /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
          <Route path="/add-venue" element={<ProtectedRoute roles={['venue_owner', 'admin']}><AddVenuePage /></ProtectedRoute>} />
          <Route path="/edit-venue/:id" element={<ProtectedRoute roles={['venue_owner', 'admin']}><EditVenuePage /></ProtectedRoute>} />
          <Route path="/my-venues" element={<ProtectedRoute roles={['venue_owner', 'admin']}><MyVenuesPage /></ProtectedRoute>} />
          <Route path="/venue-bookings/:venueId" element={<ProtectedRoute roles={['venue_owner', 'admin']}><VenueBookingsPage /></ProtectedRoute>} />
          <Route path="/owner-bookings" element={<ProtectedRoute roles={['venue_owner', 'admin']}><OwnerBookingsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookingsPage /></ProtectedRoute>} />
          <Route path="/admin/venues" element={<ProtectedRoute roles={['admin']}><AdminVenuesPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReportPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
      </AppLayout>
    </BrowserRouter>
    </ThemeProvider>
  );
}
