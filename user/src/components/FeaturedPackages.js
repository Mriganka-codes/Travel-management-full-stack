import React from 'react';

const FeaturedPackages = () => (
  <section className="py-12 bg-gray-100">
    <h2 className="text-2xl font-bold text-center mb-8">Featured Packages</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
      {[
        { title: 'Romantic Getaway', description: 'Perfect for couples', price: 'From Rs 4999' },
        { title: 'Family Adventure', description: 'Fun for all ages', price: 'From Rs 12999' },
        { title: 'Exotic Expedition', description: 'Off the beaten path', price: 'From Rs 14999' },
      ].map((pkg) => (
        <div key={pkg.title} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">{pkg.title}</h3>
          <p className="text-gray-600 mb-4">{pkg.description}</p>
          <p className="text-green-500 font-bold mb-4">{pkg.price}</p>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            Book Now
          </button>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturedPackages;