import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import DoctorProfile from "./pages/DoctorProfile";
import Comparison from "./pages/Comparison";
import LabTests from "./pages/LabTests";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import BookAppointment from "./pages/BookAppointment";
import PriceComparison from "./pages/PriceComparison";
import Insurance from "./pages/Insurance";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import DentistList from "./components/DentistList";
import AdminPanel from "./components/AdminPanel";
import { BookAppointmentModalProvider } from "@/components/BookAppointmentModalProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <div className={isAuthPage ? '' : 'pt-20 md:pt-24'}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/lab-tests" element={<LabTests />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/price-comparison" element={<PriceComparison />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/dentists" element={<DentistList />} />
            <Route path="/admin/dentist-appointments" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <BookAppointmentModalProvider>
            <AppContent />
          </BookAppointmentModalProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
