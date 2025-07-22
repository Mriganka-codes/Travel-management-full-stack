import React from 'react';

const ContactForm = () => (
  <section className="py-12 bg-gray-100">
    <h2 className="text-2xl font-bold text-center mb-8">Contact Us</h2>
    <form className="max-w-lg mx-auto">
      <div className="mb-4">
        <input type="text" placeholder="Your Name" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="mb-4">
        <input type="email" placeholder="Your Email" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="mb-4">
        <textarea placeholder="Your Message" rows="4" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
      </div>
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
        Send Message
      </button>
    </form>
  </section>
);

export default ContactForm;