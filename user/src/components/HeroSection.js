import React, { useState } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setHasSearched(true);
    try {
      const response = await axios.get('http://localhost:5000/api/search', {
        params: { q: searchQuery }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    }
  };

  return (
    <header className="text-center py-12 bg-gray-100">
      <h1 className="text-4xl font-bold text-green-500 mb-2">Explore Your Next Destination</h1>
      <p className="text-gray-600 mb-6">Discover amazing travel experiences with Traviante</p>
      <div className="max-w-2xl mx-auto flex">
        <input
          type="text"
          placeholder="Search destinations, themes, or packages"
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="bg-green-500 text-white p-2 rounded-r-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={handleSearch}
        >
          <Search size={24} />
        </button>
      </div>
      {hasSearched && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          {results.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((destination) => (
                <li key={destination.destination_id} className="border p-4 rounded shadow">
                  <img src={destination.image} alt={destination.destination_name} className="w-full h-48 object-cover mb-4 rounded" />
                  <h3 className="text-xl font-bold">{destination.destination_name}</h3>
                  <p className="text-gray-600">{destination.currency} {destination.base_price}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Destinations not found</p>
          )}
        </div>
      )}
    </header>
  );
};

export default HeroSection;