import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { User, Appointment } from '@/lib/api';

export default function UserProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);
  const { data, isLoading, isError } = useQuery<{
    success: boolean;
    user: User;
    appointments: Appointment[];
  }>({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
    retry: false,
  });

  const profile: Partial<User> = data?.user || ({} as Partial<User>);
  const appointments: Appointment[] = data?.appointments || [];

  const mutation = useMutation({
    mutationFn: (updates: any) => api.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (isError) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Please sign in to view profile.</p><Link to="/login" className="ml-2 text-primary underline">Sign in</Link></div>;

  return (
    <div className="min-h-screen bg-background pt-20">
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card rounded-lg shadow-sm p-6 mb-6 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Profile</h2>
          <Link to="/profile/edit"><span className="text-primary hover:underline text-sm">Edit Profile</span></Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="text-gray-900">{profile.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="text-gray-900">{profile.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <div className="text-gray-900">{profile.phone || 'Not set'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <div className="text-gray-900">{profile.address || 'Not set'}</div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Medical Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Blood Type</label>
              <div className="text-gray-900">{profile.bloodType || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Allergies</label>
              <div className="text-gray-900">
                {profile.allergies?.length ? profile.allergies.join(', ') : 'None listed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Appointment History</h3>
        <div className="divide-y">
          {appointments.map((apt: Appointment) => (
            <div key={apt._id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{typeof apt.doctorId === 'object' ? apt.doctorId?.name : 'Doctor'}</div>
                  <div className="text-sm text-gray-600">{typeof apt.doctorId === 'object' ? `${apt.doctorId?.specialty || ''} at ${apt.doctorId?.hospital || ''}` : ''}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(apt.date).toLocaleDateString()} at {apt.time}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                  apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="py-4 text-gray-600">No appointments found</div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}