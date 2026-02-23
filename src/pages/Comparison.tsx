import { Button } from "@/components/ui/button";
import { ComparisonCard } from "@/components/ComparisonCard";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { testBackendConnection } from "@/lib/api";

const Comparison = () => {
  const navigate = useNavigate();
  const [connectionTest, setConnectionTest] = useState<{success?: boolean, message?: string} | null>(null);
  
  const { data, isLoading, error, refetch } = useQuery({ 
    queryKey: ["specialists", "cardiologists"], 
    queryFn: async () => {
      // Try to get Cardiologists first
      const result = await api.listSpecialists("Cardiologist");
      // If no results, try without filter to show all doctors
      if (!result?.specialists || result.specialists.length === 0) {
        console.log('No Cardiologists found, fetching all specialists...');
        return await api.listSpecialists();
      }
      return result;
    },
    retry: 1,
    retryDelay: 2000,
  });

  // Debug logging
  if (data) {
    console.log('Comparison page - API response:', data);
    console.log('Comparison page - Specialists count:', (data as any)?.specialists?.length);
  }
  if (error) {
    console.error('Comparison page - API error:', error);
  }

  // Test backend connection on mount if there's an error
  useEffect(() => {
    if (error) {
      testBackendConnection().then(result => {
        setConnectionTest({
          success: result.success,
          message: result.success 
            ? `Backend is reachable on port ${(window as any).API_BASE?.split(':').pop() || '4001'}`
            : `Connection test failed: ${result.error}`
        });
      });
    }
  }, [error]);

  const handleTestConnection = async () => {
    setConnectionTest({ success: undefined, message: 'Testing connection...' });
    const result = await testBackendConnection();
    setConnectionTest({
      success: result.success,
      message: result.success 
        ? `✓ Backend is reachable! Port: ${result.data?.port || 'unknown'}`
        : `✗ Connection failed: ${result.error}`
    });
  };

  const specialists = (data as any)?.specialists || [];
  const doctors = specialists.map((s: any) => ({
    name: s.name,
    specialization: s.specialty,
    rating: s.rating || 0,
    reviews: s.reviews || 0,
    fee: s.consultationFee || 0,
    location: s.location || s.hospital || "",
    experience: s.experienceYears ? `${s.experienceYears} years` : "",
    features: s.services ? [
      { name: "Video Consultation", available: s.services.videoConsultation || false },
      { name: "Home Visit", available: s.services.homeVisit || false },
      { name: "Insurance Accepted", available: s.services.insuranceAccepted || false },
      { name: "Weekend Availability", available: s.services.weekendAvailability || false },
      { name: "Same Day Appointment", available: s.services.sameDayAppointment || false }
    ] : [],
    isRecommended: s.isRecommended || false,
    doctorId: s._id,
    onBookClick: () => navigate(`/book-appointment?doctor=${doctor.doctorId}`),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Compare Cardiologists</h1>
          <p className="text-muted-foreground">
            Compare fees, availability, and services to find the best match for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            <div className="text-muted-foreground col-span-full text-center py-8">Loading doctors...</div>
          ) : error ? (
            <div className="text-red-600 col-span-full text-center py-8 space-y-4">
              <div className="text-lg font-semibold">Error loading doctors</div>
              <div className="text-sm">{(error as Error).message}</div>
              {connectionTest && (
                <div className={`text-sm ${connectionTest.success ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionTest.message}
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <Button onClick={() => refetch()} className="mt-4" variant="outline">
                  Retry
                </Button>
                <Button onClick={handleTestConnection} className="mt-4" variant="secondary">
                  Test Connection
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                <p>Make sure:</p>
                <ul className="list-disc list-inside text-left inline-block">
                  <li>Backend server is running (npm run dev in backend folder)</li>
                  <li>Backend is on port 4001 (check backend/.env file)</li>
                  <li>MongoDB is running and connected</li>
                </ul>
              </div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-muted-foreground col-span-full text-center py-8">
              No doctors found. Please check your database connection and ensure data is seeded.
            </div>
          ) : (
            doctors.map((doctor, idx) => (
              <ComparisonCard key={doctor.doctorId || idx} {...doctor} />
            ))
          )}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-2">Need Help Deciding?</h2>
          <p className="text-gray-500 mb-6">
            Our healthcare advisors can help you choose the right doctor based on your specific needs
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="hover:bg-primary hover:text-white transition-colors"
            onClick={() => window.location.href = "mailto:advisor@healthcompare.com?subject=Doctor%20comparison%20advice"}
          >
            Talk to an Advisor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
