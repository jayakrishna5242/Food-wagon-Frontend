import React from 'react';
import { Utensils, Code, Users, Heart, ShieldCheck, Zap } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* Hero Section */}
      <div className="bg-[#171a29] text-white py-24 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-block bg-primary p-4 rounded-3xl mb-8">
            <Utensils className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            About FoodWagon
          </h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            FoodWagon is a personal full-stack project built to learn and demonstrate
            real-world food delivery application workflows.
          </p>
        </div>
      </div>

      {/* Project Story */}
      <div className="container mx-auto px-4 max-w-6xl py-20">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2070&auto=format&fit=crop"
              alt="Food App Project"
              className="rounded-3xl shadow-2xl"
            />
          </div>

          <div className="md:w-1/2">
            <h2 className="text-3xl font-extrabold text-dark mb-6">
              Project Overview
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              FoodWagon was developed as a learning-focused project to understand
              how real food delivery platforms work — from user authentication
              to restaurant listings, cart management, and order placement.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This project focuses on clean architecture, API integration,
              and a smooth user experience using modern frontend and backend technologies.
            </p>
          </div>
        </div>
      </div>

      {/* Learning Goals */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-black text-center text-dark mb-20 uppercase tracking-widest">
            What This Project Demonstrates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-orange-50 text-primary rounded-2xl flex items-center justify-center mb-8">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-dark">
                Full-Stack Development
              </h3>
              <p className="text-gray-500 font-medium">
                Implements frontend-backend integration using REST APIs,
                authentication, and data flow.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-dark">
                Real-World Features
              </h3>
              <p className="text-gray-500 font-medium">
                Includes login, signup, restaurant browsing, cart,
                and order placement logic.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-dark">
                Clean Architecture
              </h3>
              <p className="text-gray-500 font-medium">
                Follows modular structure, reusable components,
                and maintainable code practices.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="py-24 text-center">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">

            <div>
              <div className="text-5xl font-black text-primary mb-2">15+</div>
              <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                Screens
              </div>
            </div>

            <div>
              <div className="text-5xl font-black text-primary mb-2">30+</div>
              <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                APIs
              </div>
            </div>

            <div>
              <div className="text-5xl font-black text-primary mb-2">JWT</div>
              <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                Authentication
              </div>
            </div>

            <div>
              <div className="text-5xl font-black text-primary mb-2">100%</div>
              <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                Learning Project
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;
