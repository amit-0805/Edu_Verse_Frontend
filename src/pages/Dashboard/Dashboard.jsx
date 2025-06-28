import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  BookOpenIcon,
  BeakerIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const agentCards = [
    {
      name: 'AI Tutor',
      path: '/tutor',
      icon: AcademicCapIcon,
      description: 'Get personalized explanations and learning assistance',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Study Planner',
      path: '/study-planner',
      icon: ClipboardDocumentListIcon,
      description: 'Create and manage your personalized study schedules',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Resource Curator',
      path: '/resource-curator',
      icon: MagnifyingGlassIcon,
      description: 'Discover and curate educational resources',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      name: 'Exam Coach',
      path: '/exam-coach',
      icon: BeakerIcon,
      description: 'Practice with AI-generated exams and assessments',
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      name: 'Syllabus Analyzer',
      path: '/syllabus-analyzer',
      icon: DocumentTextIcon,
      description: 'Upload and analyze your course syllabi',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      name: 'Learning Paths',
      path: '/learning-paths',
      icon: BookOpenIcon,
      description: 'Follow structured learning journeys',
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Learning Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Choose an AI agent to start your personalized learning experience.
          </p>
        </div>

        {/* Agent Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Learning Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentCards.map((agent, index) => {
              const Icon = agent.icon;
              
              return (
                <Link
                  key={index}
                  to={agent.path}
                  className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${agent.lightColor}`}>
                      <Icon className={`h-6 w-6 ${agent.textColor}`} />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {agent.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {agent.description}
                  </p>
                  
                  <div className="flex items-center text-primary-600 text-sm font-medium">
                    Start Learning
                    <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-lg opacity-90 mb-6">
              Our AI agents are standing by to provide you with personalized tutoring, 
              study planning, resource curation, and exam preparation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/tutor"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                Ask AI Tutor
                <AcademicCapIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/syllabus-analyzer"
                className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              >
                Upload Syllabus
                <DocumentTextIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 