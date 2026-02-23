import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { ComparisonCard } from '@/components/ComparisonCard';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const doctorFromUrl = searchParams.get('doctor');
  const [doctorId, setDoctorId] = useState<string>(doctorFromUrl || '');
  const [date, setDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (doctorFromUrl && doctorFromUrl !== doctorId) setDoctorId(doctorFromUrl);
  }, [doctorFromUrl]);

  const { data: spData, isLoading, error } = useQuery({ 
    queryKey: ['specialists'], 
    queryFn: () => api.listSpecialists(),
    retry: 2,
  });

  // Debug logging
  if (spData) {
    console.log('BookAppointment page - API response:', spData);
    console.log('BookAppointment page - Specialists count:', (spData as any)?.specialists?.length);
  }
  if (error) {
    console.error('BookAppointment page - API error:', error);
  }

  const specialists = (spData as any)?.specialists || [];

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
  }));

  const { data: slotsData } = useQuery({
    queryKey: ['slots', doctorId, date],
    queryFn: () => api.getSlots(doctorId, date),
    enabled: !!doctorId && !!date,
  });

  const availableSlots: string[] = useMemo(() => (slotsData as any)?.slots || [], [slotsData]);

  const mutation = useMutation({
    mutationFn: async (vars: { userId: string; doctorId: string; date: string; time: string }) => api.bookAppointment(vars.userId, vars.doctorId, vars.date, vars.time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots', doctorId, date] });
      alert('Appointment booked successfully!');
      setSelectedTime(null);
    }
  });

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const userId = user?.id ?? user?._id ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book Appointment</h1>
          <p className="text-muted-foreground">
            Select a doctor and choose your preferred date and time
          </p>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground text-center py-8">Loading doctors...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">
            Error loading doctors: {(error as Error).message}
            <br />
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No doctors found. Please check your database connection and ensure data is seeded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doctors.map((doctor, idx) => (
              <div key={doctor.doctorId || idx} onClick={() => setDoctorId(doctor.doctorId)} className="cursor-pointer">
                <ComparisonCard 
                  {...doctor}
                />
              </div>
            ))}
          </div>
        )}

        {doctorId && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {specialists.find((s: any) => s._id === doctorId)?.name || 'Selected Doctor'}
            </h2>

            <label className="block mb-2 font-medium">Select Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e=>setDate(e.target.value)} 
              className="w-full mb-6 border rounded px-3 py-2" 
              min={new Date().toISOString().split('T')[0]}
            />

            {availableSlots.length > 0 ? (
              <div>
                <h3 className="mb-3 font-medium">Available Time Slots</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {availableSlots.map(time => (
                    <button 
                      key={time} 
                      onClick={()=>setSelectedTime(time)} 
                      className={`px-3 py-2 border rounded transition-colors ${
                        selectedTime===time 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <button 
                    disabled={!selectedTime || !userId || mutation.isPending} 
                    onClick={() => mutation.mutate({ 
                      userId: userId, 
                      doctorId, 
                      date, 
                      time: selectedTime || '' 
                    })} 
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? 'Booking...' : 'Book Appointment'}
                  </button>
                  {!userId && (
                    <div className="text-sm text-red-600 mt-2 text-center">
                      You must be logged in to book. <a href="/login" className="underline">Sign in</a> to continue.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              doctorId && date && (
                <div className="text-gray-600 text-center py-4">
                  No available slots for selected date. Please choose another date.
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
