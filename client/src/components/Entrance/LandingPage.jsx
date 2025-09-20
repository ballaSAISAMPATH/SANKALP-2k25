import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Brain, Zap, Calendar, Target, CheckCircle, Tag } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const AIDemo = () => {
  const [userInput, setUserInput] = useState("Finish my React project by next week");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('ai-demo');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isVisible]);

  const processTask = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setAiResponse({
        breakdown: [
          { task: "Set up project structure", priority: "High", deadline: "Today", tags: ["setup", "urgent"] },
          { task: "Create component architecture", priority: "High", deadline: "Day 2", tags: ["design", "planning"] },
          { task: "Implement core features", priority: "Medium", deadline: "Day 3-5", tags: ["development"] },
          { task: "Write unit tests", priority: "Medium", deadline: "Day 6", tags: ["testing"] },
          { task: "Final review and deployment", priority: "Low", deadline: "Day 7", tags: ["deployment"] }
        ]
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div id="ai-demo" className={`bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-green-500 transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
      <div className="flex items-center mb-6">
        <Brain className="w-6 h-6 text-green-500 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">Demo AI Task Breakdown</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Tell AI what you want to accomplish:
          </label>
          <input 
            type="text" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors duration-200"
            placeholder="e.g., Prepare for product launch next month"
            readOnly
          />
        </div>
        
        <button 
          onClick={processTask}
          disabled={isProcessing}
          className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-500/90 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>AI is thinking...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Let AI Break It Down</span>
            </>
          )}
        </button>
        
        {aiResponse && (
          <div className="mt-6 space-y-3">
            <h4 className="text-gray-900 font-semibold flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              AI Generated Breakdown:
            </h4>
            {aiResponse.breakdown.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-900 font-medium">{item.task}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.priority === 'High' ? 'bg-red-100 text-red-700' :
                    item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.deadline}
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const dispatch = useDispatch();
  
  const [currentFeature, setCurrentFeature] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  
  const aiFeatures = [
    { 
      icon: Brain, 
      title: "Smart Task Breakdown", 
      desc: "AI automatically breaks complex tasks into manageable subtasks",
      example: "\"Launch new product\" → 15 organized subtasks with timelines"
    },
    { 
      icon: Target, 
      title: "Intelligent Prioritization", 
      desc: "AI learns your patterns to auto-prioritize tasks by importance",
      example: "AI detects urgency from language and assigns priority levels"
    },
    { 
      icon: Calendar, 
      title: "Smart Scheduling", 
      desc: "AI schedules tasks based on your availability and deadlines",
      example: "Automatically finds optimal time slots for each subtask"
    },
    { 
      icon: Tag, 
      title: "Auto-Tagging & Deadlines", 
      desc: "AI suggests tags and deadlines based on task context",
      example: "\"Meeting prep\" → tagged as #meeting, #urgent with smart deadline"
    }
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % aiFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          if (entry.isIntersecting && !visibleSections[sectionId]) {
            setVisibleSections(prev => ({ ...prev, [sectionId]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-scroll-animate]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, [visibleSections]);

  return (
    <div className="min-h-screen bg-black">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
      `}</style>
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="inline-flex items-center bg-green-500/10 border border-green-500/30 rounded-full px-6 py-2 mb-8">
              <Zap className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-green-500 font-medium text-sm">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              AI That Manages
              <span className="block text-green-500">
                Your Tasks
              </span>
              <span className="block text-gray-900">Intelligently</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Just tell our AI what you want to accomplish, and watch as it automatically breaks down complex projects, 
              prioritizes tasks, schedules deadlines, and learns from your behavior to boost productivity.
            </p>
            
            
            {/* AI Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {aiFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className={`p-6 rounded-2xl border transition-all duration-500 transform hover:scale-105 ${
                      currentFeature === index 
                        ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20' 
                        : 'bg-gray-50 border-gray-200 hover:border-green-500/50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-4 mx-auto transition-colors duration-300 ${
                      currentFeature === index ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <h3 className="text-gray-900 font-semibold mb-2 text-sm">{feature.title}</h3>
                    <p className="text-gray-600 text-xs mb-3">{feature.desc}</p>
                    <div className={`text-xs italic transition-colors duration-300 ${
                      currentFeature === index ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {feature.example}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-r from-green-500/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="demo-header" data-scroll-animate className={`text-center mb-12 ${visibleSections['demo-header'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See AI in Action
            </h2>
            <p className="text-xl text-gray-600">
              Experience how our AI breaks down your tasks intelligently
            </p>
          </div>
          <AIDemo />
        </div>
      </section>

      


      {/* AI Features Detail */}
      <section id="features" className="py-20 bg-gradient-to-br from-green-500/5 to-green-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="features-header" data-scroll-animate className={`text-center mb-16 ${visibleSections['features-header'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI-Powered Features
            </h2>
            <p className="text-xl text-gray-600">
              Discover how AI transforms your task management experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div id="features-left" data-scroll-animate className={`space-y-8 ${visibleSections['features-left'] ? 'animate-fade-in-left' : 'opacity-0 translate-x-[-30px]'}`}>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Task Breakdown</h3>
                  <p className="text-gray-600">
                    Simply describe your goal and watch AI automatically break it into actionable subtasks with optimal sequencing.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligent Prioritization</h3>
                  <p className="text-gray-600">
                    AI analyzes task language, deadlines, and your past behavior to automatically assign priority levels.
                  </p>
                </div>
              </div>
            </div>
            
            <div id="features-right" data-scroll-animate className={`space-y-8 ${visibleSections['features-right'] ? 'animate-fade-in-right' : 'opacity-0 translate-x-[30px]'}`}>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
                  <p className="text-gray-600">
                    AI schedules each subtask based on your calendar, workload, and optimal productivity patterns.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-Tagging & Deadlines</h3>
                  <p className="text-gray-600">
                    AI automatically suggests relevant tags and realistic deadlines based on task context and complexity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;