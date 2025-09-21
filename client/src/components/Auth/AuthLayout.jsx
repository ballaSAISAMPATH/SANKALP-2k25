import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Brain, CheckCircle, Target, Calendar, Clock, Zap, Users, TrendingUp, ArrowLeft } from 'lucide-react'

const AuthLayout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b-2 border-purple-500 py-3 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group -ml-4"
                aria-label="Go back to homepage"
              >
                <ArrowLeft className="w-5 h-5 text-white group-hover:text-purple-500 transition-colors duration-200" />
              </button>
              
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">NexGenT</h1>
                  <p className="text-sm text-white">AI-Powered Requirement Engineering</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-screen pt-[80px]">
        {/* Left side info panel */}
        <div className="hidden md:flex md:w-1/2 xl:w-3/5 bg-black p-6 lg:p-12 flex-col justify-center">
          <div className="max-w-lg mx-auto">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white  mb-3 lg:mb-4">
                Smarter Requirement Gathering with Multi-Agent AI
              </h2>
              <p className="text-base lg:text-lg xl:text-xl text-white leading-relaxed">
                Avoid miscommunication, reduce rework, and capture every detail with AI-driven requirement analysis.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-purple-500 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-sm lg:text-base">AI Requirement Capture</h3>
                  <p className="text-white text-xs lg:text-sm leading-relaxed">
                    Just describe your idea, and AI agents extract structured requirements automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-purple-500 rounded-lg flex-shrink-0">
                  <Target className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-sm lg:text-base">Ambiguity Resolution</h3>
                  <p className="text-white text-xs lg:text-sm leading-relaxed">
                    Specialized agents detect unclear requirements and suggest clarifying questions instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-purple-500 rounded-lg flex-shrink-0">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-sm lg:text-base">Validation & Alignment</h3>
                  <p className="text-white text-xs lg:text-sm leading-relaxed">
                    Business and technical alignment agents validate requirements against goals and constraints.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-purple-500 rounded-lg flex-shrink-0">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-sm lg:text-base">Faster Iterations</h3>
                  <p className="text-white text-xs lg:text-sm leading-relaxed">
                    Requirements evolve dynamically with real-time refinements, saving weeks of manual effort.
                  </p>
                </div>
              </div>
            </div>

            {/* Example in Action */}
            <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" />
                <span className="font-semibold text-white text-sm lg:text-base">Example in Action</span>
              </div>
              <div className="space-y-2 text-xs lg:text-sm">
                <div className="p-2.5 lg:p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-white">You type:</span>
                  <p className="text-purple-600 italic">"I want to build a food delivery app for college students."</p>
                </div>
                <div className="text-center text-gray-400">↓</div>
                <div className="p-2.5 lg:p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-white">AI captures:</span>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    <li>• Business model: Mobile + web app</li>
                    <li>• Target market: Students & local food outlets</li>
                    <li>• Revenue model: Commission + delivery fee</li>
                    <li>• Timeline: Launch within 6 months</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side outlet */}
        <div className="w-full md:w-1/2 xl:w-2/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-sm text-white text-center sm:text-left">© 2025 ReqAI. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <a 
                  onClick={() => navigate('/privacy-policy')} 
                  className="text-sm text-purple-500 hover:text-purple-600 cursor-pointer"
                >
                  Privacy Policy
                </a>
                <a 
                  onClick={() => navigate('/terms-service')} 
                  className="text-sm text-purple-500 hover:text-purple-600 cursor-pointer"
                >
                  Terms of Service
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white">
              <span>Powered by</span>
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-purple-500 font-medium">Multi-Agent AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
