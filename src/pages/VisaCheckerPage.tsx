import { useState } from 'react';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Globe, Check, X, Clock, DollarSign, FileText } from 'lucide-react';
import * as visaService from '../services/visaService';
import { VisaRequirement } from '../types';

export default function VisaCheckerPage() {
  const [passportCountry, setPassportCountry] = useState('India');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [visaInfo, setVisaInfo] = useState<VisaRequirement | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const data = await visaService.getVisaRequirement(passportCountry, destinationCountry);
      setVisaInfo(data);
    } catch (error) {
      console.error('Error checking visa requirements:', error);
      setVisaInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const popularDestinations = [
    'United States', 'United Kingdom', 'Canada', 'Australia',
    'Singapore', 'Thailand', 'UAE', 'Malaysia', 'Japan', 'France'
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Globe className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Visa Requirements Checker</h1>
          <p className="mt-2 text-gray-600">Check visa requirements for your destination</p>
        </div>

        <Card className="mb-6">
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Passport Country
              </label>
              <input
                type="text"
                value={passportCountry}
                onChange={(e) => setPassportCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., India"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Country
              </label>
              <input
                type="text"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Thailand"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Checking...' : 'Check Visa Requirements'}
            </Button>
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Popular destinations:</p>
            <div className="flex flex-wrap gap-2">
              {popularDestinations.map((country) => (
                <button
                  key={country}
                  onClick={() => setDestinationCountry(country)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {searched && !loading && (
          <>
            {visaInfo ? (
              <Card>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-lg ${visaInfo.visa_required ? 'bg-amber-100' : 'bg-green-100'}`}>
                    {visaInfo.visa_required ? (
                      <FileText className={`w-8 h-8 text-amber-600`} />
                    ) : (
                      <Check className={`w-8 h-8 text-green-600`} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {visaInfo.visa_required ? 'Visa Required' : 'No Visa Required'}
                    </h2>
                    <p className="text-gray-600">
                      For {passportCountry} passport holders traveling to {destinationCountry}
                    </p>
                  </div>
                </div>

                {visaInfo.visa_required && (
                  <div className="space-y-4">
                    {visaInfo.visa_type && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Visa Type</h3>
                        <p className="text-gray-700">{visaInfo.visa_type}</p>
                      </div>
                    )}

                    {visaInfo.max_stay_days && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">
                          Maximum stay: <strong>{visaInfo.max_stay_days} days</strong>
                        </span>
                      </div>
                    )}

                    {visaInfo.processing_time_days && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">
                          Processing time: <strong>{visaInfo.processing_time_days} days</strong>
                        </span>
                      </div>
                    )}

                    {visaInfo.cost_usd && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">
                          Approximate cost: <strong>${visaInfo.cost_usd} USD</strong>
                        </span>
                      </div>
                    )}

                    {visaInfo.requirements && Object.keys(visaInfo.requirements).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {Object.entries(visaInfo.requirements).map(([key, value]) => (
                            <li key={key}>{String(value)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {visaInfo.vaccination_required && Object.keys(visaInfo.vaccination_required).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Vaccination Requirements</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {Object.entries(visaInfo.vaccination_required).map(([key, value]) => (
                            <li key={key}>{String(value)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Visa requirements can change. Please verify with the official embassy or consulate before traveling.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-8">
                <X className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Information Available</h3>
                <p className="text-gray-600">
                  We don't have visa information for this combination yet.
                  Please check with the embassy or consulate.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
