import React from 'react';
import { Compass, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 pt-12 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 mb-4">
              <Compass size={24} strokeWidth={2} />
              <span className="text-xl font-heading font-bold">RoamReady</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your ultimate travel companion for exploring the beautiful destinations of India.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Home</a></li>
              <li><a href="/checklist" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Packing Checklist</a></li>
              <li><a href="/destinations" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Destination Explorer</a></li>
              <li><a href="/converter" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Currency Converter</a></li>
              <li><a href="/planner" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Trip Planner</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Travel Guide</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Travel Tips</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">FAQs</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-400">Email: hello@roamready.com</li>
              <li className="text-sm text-gray-600 dark:text-gray-400">Phone: +91 98765 43210</li>
              <li className="text-sm text-gray-600 dark:text-gray-400">Address: 123 Voyage Street, Mumbai, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-10 pt-6">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} RoamReady. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;