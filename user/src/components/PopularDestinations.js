import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PopularDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const destinationsPerPage = 4;

  useEffect(() => {
    axios.get('http://localhost:5000/api/popular-destinations')
      .then(response => {
        const fetchedDestinations = response.data;
        // Duplicate the first 4 destinations at the end to create a loop effect
        setDestinations([...fetchedDestinations, ...fetchedDestinations.slice(0, destinationsPerPage)]);
      })
      .catch(error => console.error('Error fetching destinations:', error));
  }, []);

  const nextDestination = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      // If we've reached the duplicated section, loop back to the start
      if (nextIndex >= destinations.length - destinationsPerPage) {
        setTimeout(() => setCurrentIndex(0), 300); // Delay to allow for smooth transition
        return destinations.length - destinationsPerPage;
      }
      return nextIndex;
    });
  };

  const prevDestination = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        setTimeout(() => setCurrentIndex(destinations.length - destinationsPerPage - 1), 0);
        return destinations.length - destinationsPerPage;
      }
      return prevIndex - 1;
    });
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Popular Destinations
        </h2>
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / destinationsPerPage)}%)` }}
          >
            {destinations.map((destination, index) => (
              <div
                key={`${destination.destination_id}-${index}`}
                className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-3"
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[4/3]">
                  <img
                    src={`http://localhost:5000${destination.image}`}
                    alt={destination.destination_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-sm font-semibold mb-1 uppercase tracking-wider">
                        {destination.description || 'Explore the beauty'}
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                        {destination.destination_name}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {destinations.length > destinationsPerPage && (
            <>
              <button
                onClick={prevDestination}
                className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300 z-10"
                aria-label="Previous destination"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextDestination}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300 z-10"
                aria-label="Next destination"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        {destinations.length > destinationsPerPage && (
          <div className="flex justify-center mt-6">
            {destinations.slice(0, destinations.length - destinationsPerPage).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 mx-1 rounded-full ${
                  index === currentIndex % (destinations.length - destinationsPerPage) ? 'bg-gray-800' : 'bg-gray-400'
                }`}
                aria-label={`Go to destination ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}