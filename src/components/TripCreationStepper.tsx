import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { MapPin, Calendar, Loader, Navigation, IndianRupee, CheckCircle, ArrowLeft, ArrowRight, Plane, Brain as Train, Car, ExternalLink } from 'lucide-react';
import { indianCities, OTHER_CITY_ID } from '../data/cities';
import { getDistance } from '../data/distanceMap';
import { calculateTravelRecommendations } from '../utils/travelCalculations';

interface TripData {
  sourceId: string;
  destId: string;
  customSource: string;
  customDest: string;
  distance: number;
  startDate: string;
  endDate: string;
  travelMode: 'flight' | 'train' | 'bus' | 'car' | '';
  estimatedCost: number;
  estimatedTime: string;
}

const TripCreationStepper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [tripData, setTripData] = useState<TripData>({
    sourceId: '',
    destId: '',
    customSource: '',
    customDest: '',
    distance: 0,
    startDate: '',
    endDate: '',
    travelMode: '',
    estimatedCost: 0,
    estimatedTime: '',
  });

  const [manualDistance, setManualDistance] = useState('');
  const [showManualDistance, setShowManualDistance] = useState(false);

  useEffect(() => {
    if (tripData.sourceId === OTHER_CITY_ID || tripData.destId === OTHER_CITY_ID) {
      setShowManualDistance(true);
      setTripData(prev => ({ ...prev, distance: 0 }));
    } else if (tripData.sourceId && tripData.destId) {
      const sourceCity = indianCities.find(c => c.id === tripData.sourceId);
      const destCity = indianCities.find(c => c.id === tripData.destId);

      if (sourceCity && destCity) {
        const distance = getDistance(sourceCity.name, destCity.name);
        setTripData(prev => ({ ...prev, distance }));
        setShowManualDistance(distance === 0);
        if (distance === 0) {
          setManualDistance('');
        }
      }
    }
  }, [tripData.sourceId, tripData.destId]);

  const handleNext = () => {
    setError('');

    if (currentStep === 1) {
      const sourceName = tripData.sourceId === OTHER_CITY_ID ? tripData.customSource : indianCities.find(c => c.id === tripData.sourceId)?.name;
      const destName = tripData.destId === OTHER_CITY_ID ? tripData.customDest : indianCities.find(c => c.id === tripData.destId)?.name;

      if (!sourceName || !destName) {
        setError('Please select or enter both source and destination');
        return;
      }

      if (tripData.sourceId === OTHER_CITY_ID && !tripData.customSource.trim()) {
        setError('Please enter source city name');
        return;
      }

      if (tripData.destId === OTHER_CITY_ID && !tripData.customDest.trim()) {
        setError('Please enter destination city name');
        return;
      }

      if (!tripData.startDate || !tripData.endDate) {
        setError('Please select travel dates');
        return;
      }
    }

    if (currentStep === 2) {
      let finalDistance = tripData.distance;
      if (showManualDistance) {
        const distance = parseInt(manualDistance);
        if (!distance || distance <= 0) {
          setError('Please enter a valid distance in kilometers');
          return;
        }
        finalDistance = distance;
        setTripData(prev => ({ ...prev, distance: finalDistance }));
      }

      if (finalDistance === 0) {
        setError('Distance cannot be zero');
        return;
      }
    }

    if (currentStep === 3) {
      if (!tripData.travelMode) {
        setError('Please select a travel mode');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleCreateTrip = async () => {
    setLoading(true);
    setError('');

    try {
      const sourceName = tripData.sourceId === OTHER_CITY_ID ? tripData.customSource : indianCities.find(c => c.id === tripData.sourceId)?.name;
      const destName = tripData.destId === OTHER_CITY_ID ? tripData.customDest : indianCities.find(c => c.id === tripData.destId)?.name;

      const trip = await tripService.createTrip({
        user_id: user!.id,
        source: sourceName!,
        destination: destName!,
        distance_km: tripData.distance,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
      });

      navigate(`/trip/${trip.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Location & Dates' },
    { number: 2, title: 'Distance' },
    { number: 3, title: 'Recommendations' },
    { number: 4, title: 'Summary' },
  ];

  const recommendation = currentStep >= 3 && tripData.distance > 0 ? calculateTravelRecommendations(tripData.distance) : null;

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'flight': return <Plane size={20} />;
      case 'train': return <Train size={20} />;
      case 'bus': return <Car size={20} />;
      case 'car': return <Car size={20} />;
      default: return null;
    }
  };

  return (
    <div className="section">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Create New Trip</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Follow the steps to plan your perfect journey
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                        currentStep >= step.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.number}
                    </div>
                    <span className="text-xs mt-2 text-center">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        currentStep > step.number
                          ? 'bg-blue-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="card p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Where are you traveling?</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      Starting Point
                    </label>
                    <select
                      value={tripData.sourceId}
                      onChange={(e) => setTripData({ ...tripData, sourceId: e.target.value })}
                      className="input w-full"
                      required
                    >
                      <option value="">Select source city</option>
                      {indianCities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </option>
                      ))}
                      <option value={OTHER_CITY_ID}>Other (Enter manually)</option>
                    </select>

                    {tripData.sourceId === OTHER_CITY_ID && (
                      <input
                        type="text"
                        value={tripData.customSource}
                        onChange={(e) => setTripData({ ...tripData, customSource: e.target.value })}
                        className="input w-full mt-2"
                        placeholder="Enter source city name"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      Destination
                    </label>
                    <select
                      value={tripData.destId}
                      onChange={(e) => setTripData({ ...tripData, destId: e.target.value })}
                      className="input w-full"
                      required
                    >
                      <option value="">Select destination city</option>
                      {indianCities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </option>
                      ))}
                      <option value={OTHER_CITY_ID}>Other (Enter manually)</option>
                    </select>

                    {tripData.destId === OTHER_CITY_ID && (
                      <input
                        type="text"
                        value={tripData.customDest}
                        onChange={(e) => setTripData({ ...tripData, customDest: e.target.value })}
                        className="input w-full mt-2"
                        placeholder="Enter destination city name"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={tripData.startDate}
                      onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={tripData.endDate}
                      onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Travel Distance</h2>

                {tripData.distance > 0 && !showManualDistance ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                    <Navigation size={48} className="text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">Calculated Distance</p>
                    <p className="text-4xl font-bold text-blue-600">{tripData.distance} km</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Distance (in kilometers)
                    </label>
                    <input
                      type="number"
                      value={manualDistance}
                      onChange={(e) => setManualDistance(e.target.value)}
                      className="input w-full"
                      placeholder="Enter distance in KM"
                      min="1"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Distance data not available. Please enter manually.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && recommendation && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Travel Recommendations</h2>

                <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {getModeIcon(recommendation.mode)}
                    <div>
                      <h3 className="text-xl font-bold">Recommended: {recommendation.mode.charAt(0).toUpperCase() + recommendation.mode.slice(1)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Best option for your journey</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
                      <p className="text-2xl font-bold text-green-600">₹{recommendation.cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Time</p>
                      <p className="text-2xl font-bold text-blue-600">{recommendation.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTripData({ ...tripData, travelMode: recommendation.mode, estimatedCost: recommendation.cost, estimatedTime: recommendation.time })}
                    className={`btn w-full ${tripData.travelMode === recommendation.mode ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {tripData.travelMode === recommendation.mode ? 'Selected' : 'Select This Option'}
                  </button>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Other Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendation.alternatives.map((alt) => (
                      <div
                        key={alt.mode}
                        className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setTripData({ ...tripData, travelMode: alt.mode, estimatedCost: alt.cost, estimatedTime: alt.time })}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getModeIcon(alt.mode)}
                          <h5 className="font-bold">{alt.mode.charAt(0).toUpperCase() + alt.mode.slice(1)}</h5>
                          {tripData.travelMode === alt.mode && (
                            <CheckCircle size={16} className="ml-auto text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">₹{alt.cost.toLocaleString()} • {alt.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <ExternalLink size={18} />
                    Book Your Travel
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tripData.travelMode === 'flight' && (
                      <>
                        <a
                          href="https://www.goindigo.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm"
                        >
                          IndiGo
                        </a>
                        <a
                          href="https://www.airindia.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm"
                        >
                          Air India
                        </a>
                        <a
                          href="https://www.makemytrip.com/flights/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm"
                        >
                          MakeMyTrip
                        </a>
                      </>
                    )}
                    {tripData.travelMode === 'train' && (
                      <>
                        <a
                          href="https://www.irctc.co.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm"
                        >
                          IRCTC
                        </a>
                        <a
                          href="https://www.makemytrip.com/railways/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm"
                        >
                          MakeMyTrip
                        </a>
                      </>
                    )}
                    {(tripData.travelMode === 'bus' || tripData.travelMode === 'car') && (
                      <>
                        <a
                          href="https://www.redbus.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm"
                        >
                          RedBus
                        </a>
                        <a
                          href="https://www.makemytrip.com/bus-tickets/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm"
                        >
                          MakeMyTrip
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Trip Summary</h2>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Journey Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>From:</strong> {tripData.sourceId === OTHER_CITY_ID ? tripData.customSource : indianCities.find(c => c.id === tripData.sourceId)?.name}</p>
                      <p><strong>To:</strong> {tripData.destId === OTHER_CITY_ID ? tripData.customDest : indianCities.find(c => c.id === tripData.destId)?.name}</p>
                      <p><strong>Distance:</strong> {tripData.distance} km</p>
                      <p><strong>Dates:</strong> {new Date(tripData.startDate).toLocaleDateString()} - {new Date(tripData.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {tripData.travelMode && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h3 className="font-bold mb-2">Selected Travel Mode</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Mode:</strong> {tripData.travelMode.charAt(0).toUpperCase() + tripData.travelMode.slice(1)}</p>
                        <p><strong>Estimated Cost:</strong> ₹{tripData.estimatedCost.toLocaleString()}</p>
                        <p><strong>Estimated Time:</strong> {tripData.estimatedTime}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Next Steps</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Create detailed itinerary</li>
                      <li>Set up budget tracking</li>
                      <li>Complete packing checklist</li>
                      <li>Book accommodations</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={currentStep === 1 ? () => navigate('/dashboard') : handleBack}
                className="btn btn-outline flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="btn btn-primary flex items-center gap-2"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleCreateTrip}
                  disabled={loading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Trip
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripCreationStepper;
