import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);
  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile()
  });

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalConditions: ''
  });

  // Populate form when data loads
  useEffect(() => {
    if (data?.user) {
      const user = data.user;
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        bloodType: user.bloodType || '',
        allergies: user.allergies?.join(', ') || '',
        medications: user.medications?.join(', ') || '',
        medicalConditions: user.medicalConditions?.join(', ') || ''
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updates: any) => api.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = {
      ...form,
      allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
      medications: form.medications.split(',').map(s => s.trim()).filter(Boolean),
      medicalConditions: form.medicalConditions.split(',').map(s => s.trim()).filter(Boolean),
    };
    mutation.mutate(updates);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background pt-20">
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-card border rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Blood Type</label>
            <select
              name="bloodType"
              value={form.bloodType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Allergies <span className="text-gray-500">(comma-separated)</span>
            </label>
            <textarea
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Current Medications <span className="text-gray-500">(comma-separated)</span>
            </label>
            <textarea
              name="medications"
              value={form.medications}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Medical Conditions <span className="text-gray-500">(comma-separated)</span>
            </label>
            <textarea
              name="medicalConditions"
              value={form.medicalConditions}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
            disabled={mutation.status === 'pending'}
            >
              {mutation.status === 'pending' ? 'Saving...' : 'Save Changes'}
          </button>

          {mutation.status === 'error' && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {(mutation.error as Error).message}
            </div>
          )}

          {mutation.status === 'success' && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              Profile updated successfully
            </div>
          )}
        </form>
      </div>
    </div>
    </div>
  );
}