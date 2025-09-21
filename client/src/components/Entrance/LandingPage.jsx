import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Brain,
  Zap,
  Calendar,
  Target,
  CheckCircle,
  Tag,
  Workflow,
  Bot,
  ClipboardList,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CountUp from "react-countup";

// Example stats (customizable to your hackathon pitch)
const reqData = [
  { name: "Manual Requirement Effort (hrs)", value: 120 },
  { name: "Effort with NexGent AI (hrs)", value: 40 },
  { name: "Error Reduction (%)", value: 70 },
];

// Demo Component
const RequirementDemo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [demoResponse, setDemoResponse] = useState(null);
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

    const element = document.getElementById("req-demo");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [isVisible]);

  const processRequirements = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setDemoResponse({
        breakdown: [
          {
            step: "Understanding Agent",
            detail:
              "Captures stakeholder input from chats, documents, and forms.",
          },
          {
            step: "Clarifying Agent",
            detail:
              "Interacts with stakeholders to detect and fill gaps in requirements.",
          },
          {
            step: "Refining Agent",
            detail:
              "Cleans raw input, removes ambiguities, redundancies, and inconsistencies.",
          },
          {
            step: "Validating Agent",
            detail:
              "Ensures alignment with business goals, feasibility, and constraints.",
          },
          {
            step: "Visualization Agent",
            detail:
              "Generates diagrams, workflows, and dashboards for better clarity.",
          },
        ],
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div
      id="req-demo"
      className={`bg-white/5 rounded-2xl p-8 border border-white hover:border-purple-500 transition-all duration-300 ${
        isVisible ? "animate-fade-in-up" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex items-center mb-6">
        <Workflow className="w-6 h-6 text-purple-500 mr-3" />
        <h3 className="text-xl font-semibold text-white">
          NexGent AI Agent Workflow
        </h3>
      </div>

      <button
        onClick={processRequirements}
        disabled={isProcessing}
        className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-500/90 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Processing requirements...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>See How Agents Work</span>
          </>
        )}
      </button>

      {demoResponse && (
        <div className="mt-6 space-y-3">
          <h4 className="text-white font-semibold flex items-center">
            <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
            Workflow Breakdown:
          </h4>
          {demoResponse.breakdown.map((item, index) => (
            <div
              key={index}
              className="bg-white/10 rounded-lg p-4 border border-white/20"
            >
              <span className="text-white font-medium">{item.step}</span>
              <p className="text-sm text-purple-300 mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Landing Page
const LandingPage = () => {
  const dispatch = useDispatch();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Requirement Gathering",
      desc: "Captures and understands raw input from multiple channels automatically.",
      example: "Eliminates 60–70% manual effort.",
    },
    {
      icon: Target,
      title: "Clarity & Refinement",
      desc: "Agents resolve ambiguities and standardize requirements.",
      example: "Cuts rework cost by 40%.",
    },
    {
      icon: ClipboardList,
      title: "Validation & Alignment",
      desc: "Cross-checks requirements with goals, priorities, and feasibility.",
      example: "Ensures no critical detail is missed.",
    },
    {
      icon: Calendar,
      title: "Visualization & Tracking",
      desc: "Generates workflows, diagrams, and dashboards dynamically.",
      example: "Improves collaboration and traceability.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          if (entry.isIntersecting && !visibleSections[sectionId]) {
            setVisibleSections((prev) => ({ ...prev, [sectionId]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll("[data-scroll-animate]");
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
      <Header />

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            NexGent AI Agents
            <span className="block text-purple-500">
              Shaping the Future of Requirement Engineering
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-4xl mx-auto leading-relaxed">
            Automating requirement gathering, refining, validation, and
            visualization with a collaborative multi-agent AI system.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border transition-all duration-500 transform hover:scale-105 ${
                    currentFeature === index
                      ? "bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/20"
                      : "bg-white/5 border-white/20 hover:border-purple-500/50"
                  }`}
                >
                  <Icon
                    className={`w-8 h-8 mb-4 mx-auto ${
                      currentFeature === index ? "text-purple-500" : "text-white"
                    }`}
                  />
                  <h3 className="text-white font-semibold mb-2 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-white text-xs mb-3">{feature.desc}</p>
                  <div
                    className={`text-xs italic ${
                      currentFeature === index
                        ? "text-purple-500"
                        : "text-white/70"
                    }`}
                  >
                    {feature.example}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="w-full bg-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-purple-400">
            Requirement Engineering Challenges
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            NexGent reduces manual effort, minimizes errors, and accelerates the
            requirement lifecycle.
          </p>

          {/* Stats Cards */}
          <div className="flex flex-col md:flex-row gap-6 mt-8 justify-between">
            <div className="flex-1 bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="text-gray-400 text-sm uppercase mb-2">
                Manual Effort (hrs)
              </h3>
              <p className="text-3xl font-bold text-purple-400">
                <CountUp end={120} duration={2} />
              </p>
            </div>
            <div className="flex-1 bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="text-gray-400 text-sm uppercase mb-2">
                AI-Powered Effort (hrs)
              </h3>
              <p className="text-3xl font-bold text-purple-400">
                <CountUp end={40} duration={2} />
              </p>
            </div>
            <div className="flex-1 bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="text-gray-400 text-sm uppercase mb-2">
                Error Reduction
              </h3>
              <p className="text-3xl font-bold text-purple-400">
                <CountUp end={70} duration={2} suffix="%" />
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="mt-12 h-64 bg-gray-800 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reqData}>
                <XAxis dataKey="name" tick={{ fill: "white", fontSize: 12 }} />
                <YAxis tick={{ fill: "white", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "purple",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar dataKey="value" fill="purple" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-r from-purple-500/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Multi-Agent Demo
          </h2>
          <p className="text-xl text-white mb-8">
            Experience how NexGent AI agents collaborate to transform raw inputs
            into clear, validated requirements.
          </p>
          <RequirementDemo />
        </div>
      </section>
      <section id="contact">
        <Footer />
      </section>
    </div>
  );
};

export default LandingPage;
