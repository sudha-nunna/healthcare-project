import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export default function Insurance() {
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  const { data } = useQuery({
    queryKey: ['insurance'],
    queryFn: () => api.getInsurance()
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => api.updateInsurance(payload)
  });

  const insurance = data?.insurance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      provider,
      policyNumber,
      validFrom,
      validTo
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20">
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-card border rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Insurance Information</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Insurance Provider</label>
            <input
              type="text"
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Policy Number</label>
            <input
              type="text"
              value={policyNumber}
              onChange={e => setPolicyNumber(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valid From</label>
              <input
                type="date"
                value={validFrom}
                onChange={e => setValidFrom(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid To</label>
              <input
                type="date"
                value={validTo}
                onChange={e => setValidTo(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
            disabled={mutation.status === 'pending'}
            >
              {mutation.status === 'pending' ? 'Saving...' : 'Save Insurance Information'}
          </button>
        </form>

        {insurance && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Current Insurance</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Provider:</span> {insurance.provider}
              </div>
              <div>
                <span className="font-medium">Policy Number:</span> {insurance.policyNumber}
              </div>
              <div>
                <span className="font-medium">Valid From:</span>{' '}
                {new Date(insurance.validFrom).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Valid To:</span>{' '}
                {new Date(insurance.validTo).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}