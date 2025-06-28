import React, { useState, useEffect, useRef } from 'react';
import { 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  SparklesIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { agentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';

const TutorPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI tutor. I\'m here to help you learn and understand any topic. What would you like to study today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const [sessionData, setSessionData] = useState({
    subject: '',
    topic: '',
    level: 'intermediate',
    questions: []
  });

  // Make session data readable to CopilotKit
  useCopilotReadable({
    description: "Current learning session data including subject, topic, and difficulty level",
    value: sessionData,
  });

  // Make messages readable to CopilotKit
  useCopilotReadable({
    description: "Chat conversation history between student and AI tutor",
    value: messages,
  });

  // CopilotKit action for answering questions
  useCopilotAction({
    name: "answerQuestion",
    description: "Answer a student's question about any academic topic",
    parameters: [
      {
        name: "question",
        type: "string",
        description: "The student's question",
        required: true,
      },
      {
        name: "subject",
        type: "string",
        description: "The academic subject (optional)",
      },
      {
        name: "difficulty",
        type: "string",
        description: "The difficulty level (beginner, intermediate, advanced)",
      },
    ],
    handler: async ({ question, subject, difficulty }) => {
      try {
        const response = await agentAPI.tutorQuery({
          query: question,
          subject: subject || sessionData.subject || 'general',
          difficulty_level: difficulty || sessionData.level
        });

        let answer = '';
        
        // Handle different response formats
        if (response.data.success) {
          if (response.data.result) {
            // Check if there's an error in the result
            if (response.data.result.error) {
              const isQuotaError = response.data.result.error.includes('quota') || 
                                  response.data.result.error.includes('429');
              
              if (isQuotaError) {
                answer = `I'm currently experiencing high demand and have reached my daily API limit. However, I can still help you with "${question}"! 

Here's what I can tell you based on my knowledge:

**For ${subject || sessionData.subject || 'your topic'}:**
- This appears to be about ${question.toLowerCase()}
- At ${difficulty || sessionData.level} level, this typically involves understanding core concepts and applying them practically
- I recommend starting with foundational concepts and building up to more complex applications

**Study Tips:**
- Break down complex topics into smaller, manageable parts
- Use active learning techniques like summarizing and teaching others
- Practice with examples and real-world applications
- Don't hesitate to ask follow-up questions!

**Next Steps:**
- Try rephrasing your question or asking about specific aspects
- Consider using textbooks, educational videos, or online resources

I'll be back to full capacity tomorrow. Thank you for your patience!`;
                toast.error('API quota reached - providing offline assistance');
              } else {
                answer = 'I\'m having trouble processing your request right now. Could you please rephrase your question or try again in a moment?';
                toast.error('Processing error - please try again');
              }
            } else {
              // Normal successful response
              answer = response.data.result.explanation || 
                      response.data.result.content || 
                      response.data.result || 
                      'I received your question but couldn\'t generate a proper response. Could you please rephrase it?';
            }
          } else {
            answer = response.data.response || 'I apologize, but I couldn\'t process your question properly. Could you please rephrase it?';
          }
        } else {
          answer = 'I\'m having trouble connecting to my knowledge base right now. Could you please try again?';
        }
        
        // Add to chat history
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: question,
          timestamp: new Date().toLocaleTimeString()
        };

        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: answer,
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage, aiMessage]);
        
        // Update session data
        setSessionData(prev => ({
          ...prev,
          questions: [...prev.questions, { 
            question, 
            answer, 
            timestamp: new Date().toLocaleTimeString() 
          }]
        }));

        return answer;
      } catch (error) {
        console.error('Tutor query error:', error);
        
        let fallbackContent = '';
        const isQuotaError = error.response?.data?.result?.error?.includes('quota') || 
                            error.response?.data?.result?.error?.includes('429') ||
                            error.response?.status === 429;
        
        if (isQuotaError) {
          fallbackContent = `I'm currently experiencing high demand and have reached my daily API limit. However, I can still help you with "${question}"! 

Here's what I can tell you based on my knowledge:

**For ${subject || sessionData.subject || 'your topic'}:**
- This appears to be about ${question.toLowerCase()}
- At ${difficulty || sessionData.level} level, this typically involves understanding core concepts and applying them practically
- I recommend starting with foundational concepts and building up to more complex applications

**Study Tips:**
- Break down complex topics into smaller, manageable parts
- Use active learning techniques like summarizing and teaching others
- Practice with examples and real-world applications
- Don't hesitate to ask follow-up questions!

**Next Steps:**
- Try rephrasing your question or asking about specific aspects
- Consider using textbooks, educational videos, or online resources

I'll be back to full capacity tomorrow. Thank you for your patience!`;
          toast.error('API quota reached - providing offline assistance');
        } else {
          fallbackContent = 'I\'m having trouble connecting to my knowledge base right now. However, I can still help you! Could you tell me more about what you\'re trying to learn? I\'ll do my best to provide guidance based on the information you give me.';
          toast.error('Connection issue - providing offline assistance');
        }
        
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: fallbackContent,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
        return fallbackContent;
      }
    },
  });

  // CopilotKit action for setting study session
  useCopilotAction({
    name: "setStudySession",
    description: "Set up a study session with specific subject, topic, and difficulty level",
    parameters: [
      {
        name: "subject",
        type: "string",
        description: "The academic subject to study",
        required: true,
      },
      {
        name: "topic",
        type: "string",
        description: "The specific topic within the subject",
      },
      {
        name: "level",
        type: "string",
        description: "The difficulty level (beginner, intermediate, advanced)",
      },
    ],
    handler: async ({ subject, topic, level }) => {
      setSessionData(prev => ({
        ...prev,
        subject: subject || prev.subject,
        topic: topic || prev.topic,
        level: level || prev.level
      }));

      return `Study session set for ${subject}${topic ? ` - ${topic}` : ''} at ${level || 'intermediate'} level.`;
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await agentAPI.tutorQuery({
        query: userMessage,
        subject: sessionData.subject || 'general',
        difficulty_level: sessionData.level
      });

      let botMessageText;
      
      // Extract the actual response data
      const responseData = response.data;
      
      if (responseData.success && responseData.result) {
        // Check if there's an error in the result
        if (responseData.result.error) {
          const isQuotaError = responseData.result.error.includes('quota') || 
                              responseData.result.error.includes('429');
          
          if (isQuotaError) {
            botMessageText = `I understand you're asking about "${userMessage}". While I'm temporarily unable to access my full knowledge base due to high demand, here are some study tips:

📚 **Study Approach:**
- Break down complex topics into smaller, manageable parts
- Use active recall: try to explain the concept without looking at notes
- Create visual aids like diagrams or mind maps
- Practice with real examples and applications

🔍 **Next Steps:**
- Try rephrasing your question in the CopilotKit sidebar (if available)
- Look for reliable educational resources online
- Consider discussing with classmates or instructors

Please try again in a few minutes, or use the CopilotKit sidebar for enhanced assistance!`;
            toast.error('API quota reached. Using fallback response.');
          } else {
            botMessageText = 'I\'m having trouble processing your request right now. Could you please rephrase your question or try again in a moment?';
            toast.error('Processing error - please try again');
          }
        } else {
          // No error in result, process the response
          let dataToFormat = responseData.result;
          
          // Handle the specific case where explanation is a JSON string
          if (dataToFormat.explanation && typeof dataToFormat.explanation === 'string') {
            // Try to parse the explanation as JSON
            try {
              const explanationData = JSON.parse(dataToFormat.explanation);
              botMessageText = formatTutorResponse(explanationData);
            } catch (e) {
              // If explanation is not JSON, check if it's markdown-wrapped JSON
              botMessageText = formatTutorResponse(dataToFormat.explanation);
            }
          } else if (typeof dataToFormat === 'string') {
            try {
              dataToFormat = JSON.parse(dataToFormat);
              botMessageText = formatTutorResponse(dataToFormat);
            } catch (e) {
              // If not valid JSON, use as is
              botMessageText = dataToFormat;
            }
          } else if (typeof dataToFormat === 'object' && dataToFormat !== null) {
            botMessageText = formatTutorResponse(dataToFormat);
          } else {
            botMessageText = dataToFormat || 'I received your question but couldn\'t generate a proper response.';
          }
        }
      } else {
        botMessageText = responseData.response || 'I apologize, but I couldn\'t process your question properly. Could you please rephrase it?';
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: botMessageText,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages([...updatedMessages, botMessage]);
      
      // Update session data
      setSessionData(prev => ({
        ...prev,
        questions: [...prev.questions, { 
          question: userMessage, 
          answer: botMessageText, 
          timestamp: new Date().toLocaleTimeString() 
        }],
        lastQuery: userMessage,
        totalQuestions: (prev.totalQuestions || 0) + 1
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's a quota error
      const isQuotaError = error.response?.data?.result?.error?.includes('quota') || 
                          error.response?.data?.result?.error?.includes('429') ||
                          error.response?.status === 429;
      
      let fallbackMessage;
      if (isQuotaError) {
        fallbackMessage = `I understand you're asking about "${userMessage}". While I'm temporarily unable to access my full knowledge base due to high demand, here are some study tips:

📚 **Study Approach:**
- Break down complex topics into smaller, manageable parts
- Use active recall: try to explain the concept without looking at notes
- Create visual aids like diagrams or mind maps
- Practice with real examples and applications

🔍 **Next Steps:**
- Try rephrasing your question in the CopilotKit sidebar (if available)
- Look for reliable educational resources online
- Consider discussing with classmates or instructors

Please try again in a few minutes, or use the CopilotKit sidebar for enhanced assistance!`;
        
        toast.error('API quota reached. Using fallback response.');
      } else {
        fallbackMessage = `I'd love to help you with "${userMessage}"! Could you provide a bit more context about what specific aspect you'd like to learn about? This will help me give you a more targeted explanation.`;
        toast.error('Connection issue. Please try again.');
      }

      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: fallbackMessage,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // Function to format the tutor response from JSON to readable text
  const formatTutorResponse = (data) => {
    // If data is a string, try to extract JSON from markdown format
    if (typeof data === 'string') {
      // Remove ```json and ``` wrappers if present
      let cleanedData = data.trim();
      if (cleanedData.startsWith('```json')) {
        cleanedData = cleanedData.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }
      
      try {
        data = JSON.parse(cleanedData);
      } catch (e) {
        // If parsing fails, return the original string
        return cleanedData;
      }
    }
    
    let formattedText = '';
    
    // Main explanation
    if (data.explanation) {
      formattedText += `${data.explanation}\n\n`;
    }
    
    // Examples section
    if (data.examples && data.examples.length > 0) {
      formattedText += `📚 **Examples:**\n\n`;
      data.examples.forEach((example, index) => {
        formattedText += `${index + 1}. **${example.title}**\n`;
        formattedText += `   ${example.description}\n\n`;
      });
    }
    
    // Learning tips
    if (data.learning_tips && data.learning_tips.length > 0) {
      formattedText += `💡 **Learning Tips:**\n\n`;
      data.learning_tips.forEach((tip, index) => {
        formattedText += `• ${tip}\n`;
      });
      formattedText += '\n';
    }
    
    // Additional resources
    if (data.additional_resources && data.additional_resources.length > 0) {
      formattedText += `🔗 **Additional Resources:**\n\n`;
      data.additional_resources.forEach((resource, index) => {
        formattedText += `• [${resource.title}](${resource.url})\n`;
      });
    }
    
    return formattedText || 'I received your question but had trouble formatting the response.';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'Explain quantum physics basics',
    'Help me with calculus derivatives',
    'What is machine learning?',
    'Explain photosynthesis process',
    'How does gravity work?',
    'What is the water cycle?'
  ];

  const subjects = [
    'Mathematics', 'Science', 'History', 'Literature', 'Physics', 
    'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Philosophy'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const quickTopics = [
    'Algebra', 'Calculus', 'Physics Laws', 'Chemical Reactions', 
    'World History', 'Literature Analysis', 'Programming Basics', 'Statistics'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AI Tutor</h1>
            <div className="ml-4 flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                CopilotKit Enhanced
              </div>
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Active
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Get personalized explanations and learning assistance powered by AI. Use the chat interface below or the CopilotKit sidebar for enhanced assistance with voice commands and advanced features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={sessionData.subject}
                    onChange={(e) => setSessionData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Level
                  </label>
                  <select
                    value={sessionData.level}
                    onChange={(e) => setSessionData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Topic
                  </label>
                  <input
                    type="text"
                    value={sessionData.topic}
                    onChange={(e) => setSessionData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="What would you like to learn about?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Topics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Quick Topics</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSessionData(prev => ({ ...prev, topic }))}
                    className="text-left p-2 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">AI Tutor Chat</h3>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Online
                  </div>
                </div>
                {sessionData.subject && (
                  <p className="text-sm text-gray-600 mt-1">
                    Studying: {sessionData.subject} ({sessionData.level})
                    {sessionData.topic && ` - ${sessionData.topic}`}
                  </p>
                )}
              </div>

              {/* Chat Interface */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-75 mt-1 block">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything about your studies..."
                    className="flex-1 resize-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-20"
                    rows={1}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Quick Questions */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(question)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <SparklesIcon className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Learning</h3>
            <p className="text-gray-600 text-sm">
              AI adapts to your learning level and provides customized explanations.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <DocumentTextIcon className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Concept Breakdown</h3>
            <p className="text-gray-600 text-sm">
              Complex topics broken down into easy-to-understand components.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <ClockIcon className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
            <p className="text-gray-600 text-sm">
              Get help whenever you need it, no matter the time or day. Use the sidebar for quick assistance!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPage; 