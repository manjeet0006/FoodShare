import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner"; // Using Sonner as discussed earlier
import { TooltipProvider } from "@/components/ui/tooltip";
import Analytics from "./pages/Analytics";

// Page Imports
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Donations from "./pages/Donations";
import Donate from "./pages/Donate";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import TCs from "./pages/T&Cs";
import { Footer } from "./components/Footer";
import DonationDetails from "./pages/DonationDetails";

const queryClient = new QueryClient();

// Helper for Protected Routes
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/dashboard" />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          {/* LAYOUT WRAPPER: 
            The flex-col and min-h-screen ensure the footer 
            is always pushed to the bottom of the page.
          */}
          <div className="relative flex flex-col min-h-screen">
            <Toaster position="top-center" richColors />
            
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Donations />} />
                <Route path="/donations/:id" element={<DonationDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<Index />} />
                <Route path="/T&Cs" element={<TCs/>} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute><Messages /></ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute><Settings /></ProtectedRoute>
                } />
                <Route path="/analytics" element={
                    <ProtectedRoute><Analytics /></ProtectedRoute>
                  }
                />

                {/* Role-Specific */}
                <Route path="/donate" element={
                  <ProtectedRoute role="donator"><Donate /></ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* PERSISTENT FOOTER */}
            <div className="mt-10">
                <Footer />
            </div>
            
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;