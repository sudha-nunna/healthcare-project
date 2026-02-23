import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function PriceComparison() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');

  const { data: pricesData } = useQuery({
    queryKey: ['prices'],
    queryFn: () => api.getPrices()
  });

  const { data: estimateData } = useQuery({
    queryKey: ['estimate', selectedService, selectedHospital],
    queryFn: () => api.getPriceEstimate(selectedService, selectedHospital),
    enabled: !!(selectedService && selectedHospital)
  });

  const prices = pricesData?.prices || {};
  const services = Object.keys(prices);
  const hospitals = selectedService ? Object.keys(prices[selectedService] || {}) : [];
  const estimate = estimateData?.estimate;

  return (
    <div className="min-h-screen bg-background pt-20">
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card border rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Price Comparison</h2>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Select Service</label>
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Choose service --</option>
              {services.map(service => (
                <option key={service} value={service}>
                  {service.charAt(0).toUpperCase() + service.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Hospital</label>
              <select
                value={selectedHospital}
                onChange={e => setSelectedHospital(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Choose hospital --</option>
                {hospitals.map(hospital => (
                  <option key={hospital} value={hospital}>
                    {hospital}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedService && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Price Comparison</h3>
            <div className="grid grid-cols-1 gap-4">
              {hospitals.map(hospital => (
                <div
                  key={hospital}
                  className={`p-4 border rounded ${
                    hospital === selectedHospital ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{hospital}</div>
                      <div className="text-sm text-gray-600">Base price</div>
                    </div>
                    <div className="text-lg font-semibold">
                      ${prices[selectedService][hospital]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {estimate && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Insurance Estimate</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="font-medium">${estimate.basePrice}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Insurance Coverage:</span>
                <span className="font-medium">${estimate.coverage}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Your Out of Pocket:</span>
                <span className="font-medium">${estimate.outOfPocket}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}