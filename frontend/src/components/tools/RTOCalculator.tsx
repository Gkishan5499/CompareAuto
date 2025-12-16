import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RTOResult {
  baseRTO: number;
  fuelTypeSurcharge: number;
  priceSlabRatio: number;
  greenTax: number;
  evSubsidy: number;
  totalRTOPercentage: number;
  totalRTOAmount: number;
}

interface RTOResponse {
  success: boolean;
  rto: RTOResult;
  breakdown: string;
}

const RTOCalculator = () => {
  const [formData, setFormData] = useState({
    state: 'Delhi',
    exShowroomPrice: '',
    fuelType: 'petrol',
    vehicleAge: '0',
  });

  const [result, setResult] = useState<RTOResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const states = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Chandigarh',
    'Delhi',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
    'Daman and Diu',
    'Dadar and Nagar Haveli',
  ];

  const fuelTypes = ['petrol', 'diesel', 'cng', 'hybrid', 'ev'];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateRTO = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const price = parseFloat(formData.exShowroomPrice);

      if (!formData.state || !formData.fuelType) {
        setError('Please fill in all required fields');
        return;
      }

      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/pricing/calculate-rto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: formData.state,
          exShowroomPrice: price,
          fuelType: formData.fuelType,
          vehicleAge: parseInt(formData.vehicleAge) || 0,
        }),
      });

      if (!res.ok) {
        throw new ApiError(res.status, `API Error: ${res.statusText}`);
      }
      const data: RTOResponse = await res.json();
      if (data.success) {
        setResult(data.rto);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate RTO. Please try again.');
      console.error('RTO calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">RTO Calculator</CardTitle>
          <CardDescription>
            Calculate road tax based on state, fuel type, and vehicle price
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={calculateRTO} className="space-y-4">
            {/* State Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State / Union Territory *
              </label>
              <Select value={formData.state} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, state: value }))
              }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Input */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Ex-Showroom Price (₹) *
              </label>
              <Input
                id="price"
                name="exShowroomPrice"
                type="number"
                placeholder="e.g., 1000000"
                value={formData.exShowroomPrice}
                onChange={handleInputChange}
                className="w-full"
                min="0"
                step="10000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the ex-showroom price of the vehicle
              </p>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type *
              </label>
              <Select value={formData.fuelType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, fuelType: value }))
              }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Age (years)
              </label>
              <Input
                id="age"
                name="vehicleAge"
                type="number"
                placeholder="e.g., 0 for new vehicle"
                value={formData.vehicleAge}
                onChange={handleInputChange}
                className="w-full"
                min="0"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Green tax applies to vehicles older than 15 years
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Calculate Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate RTO'
              )}
            </Button>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">RTO Calculation Result</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">RTO Percentage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.totalRTOPercentage.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">RTO Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{result.totalRTOAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base RTO:</span>
                  <span className="font-medium">{result.baseRTO}%</span>
                </div>

                {result.fuelTypeSurcharge !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fuel Type Surcharge:</span>
                    <span className={`font-medium ${result.fuelTypeSurcharge > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {result.fuelTypeSurcharge > 0 ? '+' : ''}{result.fuelTypeSurcharge}%
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price Slab Ratio:</span>
                  <span className="font-medium">{result.priceSlabRatio.toFixed(2)}x</span>
                </div>

                {result.greenTax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Green Tax:</span>
                    <span className="font-medium text-orange-600">+{result.greenTax}%</span>
                  </div>
                )}

                {result.evSubsidy !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">EV Subsidy:</span>
                    <span className="font-medium text-green-600">{result.evSubsidy}%</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700 space-y-1">
                <p>
                  <strong>Price Slab:</strong> Vehicles are taxed at different rates based on their
                  ex-showroom price (base rate increases for more expensive vehicles)
                </p>
                <p>
                  <strong>Green Tax:</strong> Applies to vehicles older than 15 years (3-6% extra)
                </p>
                <p>
                  <strong>EV Subsidy:</strong> New electric vehicles get reduced tax rates
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RTOCalculator;
