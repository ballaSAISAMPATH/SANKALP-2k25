import React from "react";
import { Brain, Mail, Phone, Globe, Linkedin, Github, Users } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-purple-500/20" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center transform rotate-12 shadow-lg shadow-purple-500/30">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">NexGent</span>
                <div className="text-xs text-purple-400 font-medium">Multi-Agent AI</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Explore next-gen multi-agent AI that intelligently coordinates tasks, 
              optimizes workflows, and delivers seamless collaboration for smarter outcomes.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Brain className="w-4 h-4 mr-2 text-purple-400" />
              AI Agents
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#demo" className="text-gray-300 hover:text-purple-400 transition-colors duration-200">
                  Smart Coordination
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors duration-200">
                  Task Optimization
                </a>
              </li>
              <li>
                <a href="#stats" className="text-gray-300 hover:text-purple-400 transition-colors duration-200">
                  Predictive Analytics
                </a>
              </li>
              <li>
                <a href="#team" className="text-gray-300 hover:text-purple-400 transition-colors duration-200">
                  Collaboration Insights
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <a
                  href="mailto:praveengamini009@gmail.com"
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                >
                  praveengamini009@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-purple-400" />
                <a
                  href="tel:+917013268191"
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                >
                  +91 7013268191
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <a
                  href="https://praveengamini.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                >
                  praveengamini.netlify.app
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Linkedin className="w-4 h-4 text-purple-400" />
                <a
                  href="https://www.linkedin.com/in/praveen-gamini-3bb729273"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                >
                  LinkedIn
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-purple-400" />
                <a
                  href="https://github.com/praveengamini"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-purple-500/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Balla Sai Sampath. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <p className="text-purple-400 text-sm font-medium">Available for Collaboration</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
