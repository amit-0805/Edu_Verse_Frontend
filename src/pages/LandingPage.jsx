import React from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  BookOpenIcon,
  BeakerIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const features = [
    {
      icon: AcademicCapIcon,
      title: 'AI Tutor',
      description: 'Get personalized explanations tailored to your learning style and pace.',
    },
    {
      icon: ClipboardDocumentListIcon,
      title: 'Study Planner',
      description: 'Create custom study schedules optimized for your goals and availability.',
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Resource Curator',
      description: 'Discover high-quality educational content from trusted sources.',
    },
    {
      icon: BeakerIcon,
      title: 'Exam Coach',
      description: 'Practice with AI-generated tests and get detailed feedback.',
    },
    {
      icon: DocumentTextIcon,
      title: 'Syllabus Analyzer',
      description: 'Upload your syllabus and get a complete learning roadmap.',
    },
    {
      icon: BookOpenIcon,
      title: 'Learning Paths',
      description: 'Follow structured learning paths designed for optimal knowledge retention.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduVerse</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <SparklesIcon className="h-12 w-12 text-primary-600 mr-3" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              EduVerse
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-Powered Learning System
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Experience personalized education with our multi-agent AI system. 
            Get custom tutoring, study plans, resources, and exam preparation all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              Start Learning Today
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful AI Learning Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our intelligent agents work together to provide you with a comprehensive and personalized learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students already using EduVerse to achieve their academic goals.
            </p>
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors duration-200 inline-flex items-center"
            >
              Get Started for Free
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <AcademicCapIcon className="h-6 w-6 text-primary-400 mr-2" />
            <span className="font-semibold">EduVerse</span>
            <span className="ml-4 text-gray-400">© 2024 All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 