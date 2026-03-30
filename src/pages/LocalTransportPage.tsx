import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, MapPin, IndianRupee, Clock, CreditCard, Lightbulb, Brain as Train, Bus, ArrowLeft } from 'lucide-react';
import * as transportService from '../services/localTransportService';
import { LocalTransport } from '../types';

export default function LocalTransportPage() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [results, setResults] = useState<LocalTransport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const data = await transportService.getTransportOptions(city, country);
      setResults(data);
    } catch (error) {
      console.error('Error searching transport:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa'
  ];

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'metro': return Train;
      case 'bus': return Bus;
      case 'taxi': return MapPin;
      case 'auto': return MapPin;
      default: return MapPin;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Local Transport Guide</h1>
          <p className="mt-2 text-gray-600">Find transport options in Indian cities</p>
        </div>

        <Card className="mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mumbai"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="India"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search Transport Options'}
            </Button>
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Popular cities:</p>
            <div className="flex flex-wrap gap-2">
              {popularCities.map((popularCity) => (
                <button
                  key={popularCity}
                  onClick={() => setCity(popularCity)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {popularCity}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-start gap-3">
              <IndianRupee className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Auto Fare Calculator</h3>
                <p className="text-sm text-gray-700">
                  Approximate auto rickshaw fare for {city || 'your city'}: Base fare varies by city, typically ₹25-30 + ₹13-16 per km
                </p>
              </div>
            </div>
          </Card>
        </div>

        {searched && !loading && (
          <>
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((transport) => {
                  const Icon = getTransportIcon(transport.transport_type);
                  return (
                    <Card key={transport.id}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{transport.name}</h3>
                          <span className="text-sm text-gray-600 capitalize">{transport.transport_type}</span>
                        </div>
                      </div>

                      {transport.fare_info && Object.keys(transport.fare_info).length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <IndianRupee className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Fare Information</span>
                          </div>
                          <div className="ml-6 text-sm text-gray-600">
                            {Object.entries(transport.fare_info).map(([key, value]) => (
                              <div key={key}>{key}: {String(value)}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {transport.operating_hours && Object.keys(transport.operating_hours).length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Operating Hours</span>
                          </div>
                          <div className="ml-6 text-sm text-gray-600">
                            {Object.entries(transport.operating_hours).map(([key, value]) => (
                              <div key={key}>{key}: {String(value)}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {transport.payment_methods && transport.payment_methods.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Payment Methods</span>
                          </div>
                          <div className="ml-6 flex flex-wrap gap-2">
                            {transport.payment_methods.map((method) => (
                              <span key={method} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {transport.tips && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-900 mb-1">Travel Tips</p>
                              <p className="text-sm text-amber-700">{transport.tips}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transport Information Available</h3>
                <p className="text-gray-600">
                  We don't have transport information for {city} yet.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
