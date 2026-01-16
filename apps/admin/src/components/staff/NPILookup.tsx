'use client';

import React, { useState } from 'react';
import { Search, Loader2, Check, User, MapPin, Award } from 'lucide-react';

interface NPIResult {
  npi: string;
  firstName: string;
  lastName: string;
  credential: string;
  specialty: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  licenseNumber?: string;
  licenseState?: string;
}

interface NPILookupProps {
  onSelect: (result: NPIResult) => void;
  initialNPI?: string;
}

export default function NPILookup({ onSelect, initialNPI = '' }: NPILookupProps) {
  const [npiNumber, setNpiNumber] = useState(initialNPI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<NPIResult[]>([]);
  const [selectedNPI, setSelectedNPI] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!npiNumber || npiNumber.length !== 10) {
      setError('NPI must be a 10-digit number');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`/api/npi/lookup?npi=${npiNumber}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Lookup failed');
      }

      if (data.results.length === 0) {
        setError('No provider found with this NPI');
      } else {
        setResults(data.results);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to lookup NPI');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: NPIResult) => {
    setSelectedNPI(result.npi);
    onSelect(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={npiNumber}
            onChange={(e) => setNpiNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={handleKeyDown}
            placeholder="Enter 10-digit NPI number"
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <button
          onClick={handleLookup}
          disabled={loading || npiNumber.length !== 10}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Lookup'
          )}
        </button>
      </div>

      {/* Character count */}
      <p className="text-xs text-gray-400">
        {npiNumber.length}/10 digits
      </p>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Found {results.length} result(s)</p>
          {results.map((result) => (
            <div
              key={result.npi}
              onClick={() => handleSelect(result)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedNPI === result.npi
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {result.firstName} {result.lastName}
                      {result.credential && (
                        <span className="text-gray-500 ml-1">, {result.credential}</span>
                      )}
                    </span>
                  </div>
                  {result.specialty && (
                    <div className="flex items-center gap-2 mt-1">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{result.specialty}</span>
                    </div>
                  )}
                  {result.address.city && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {result.address.city}, {result.address.state}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">NPI: {result.npi}</p>
                </div>
                {selectedNPI === result.npi && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">
            Click to auto-fill provider details
          </p>
        </div>
      )}
    </div>
  );
}
