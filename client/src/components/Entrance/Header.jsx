import React, { useState } from 'react';
import { Brain, Menu, Zap,Contact,Star,ChartNoAxesCombined,BrainCircuit } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { useNavigate } from 'react-router-dom';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center transform rotate-12">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">
                AI TaskFlow
              </span>
              <div className="text-xs text-green-500 font-medium">Powered by AI</div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#demo" className="text-gray-600 hover:text-green-500 transition-colors duration-200">Try Demo</a>
            <a href="#reviews" className="text-gray-600 hover:text-green-500 transition-colors duration-200">Reviews</a>
            <a href="#stats" className="text-gray-600 hover:text-green-500 transition-colors duration-200">Stats</a>
            <a href="#features" className="text-gray-600 hover:text-green-500 transition-colors duration-200">AI Features</a>
            <a href="#contact" className="text-gray-600 hover:text-green-500 transition-colors duration-200">Contact Us</a>
            <button 
              className="bg-green-500 hover:bg-[#8FE877] cursor-pointer text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200"
              onClick={() => navigate('/auth/login')}
            >
              Login
            </button>
          </nav>
          
          <div className="md:hidden flex items-center space-x-3">
            <button 
              className="bg-green-500 hover:bg-[#8FE877] text-white font-semibold px-3 py-2 rounded-md transition-colors duration-200 text-sm"
              onClick={() => navigate('/auth/login')}
            >
              Login
            </button>
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="text-gray-900 hover:text-green-500 transition-colors duration-200 p-2 hover:bg-[#66B539]/5 rounded-lg">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[320px] sm:w-[400px] bg-white border-l border-green-500"
              >
                <SheetHeader className="pb-6 border-b border-gray-200">
                  <SheetTitle className="flex items-center space-x-3 justify-start">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-[#8FE877] rounded-xl flex items-center justify-center transform rotate-12 shadow-lg shadow-[#66B539]/25">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-500 to-[#66B539] rounded-full animate-pulse shadow-sm"></div>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-900">AI TaskFlow</span>
                      <div className="text-xs text-green-500 font-semibold">Powered by AI</div>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  <a 
                    href="#demo" 
                    className="group flex items-center space-x-3 text-gray-700 hover:text-[#66B539] transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Zap className="w-5 h-5 text-green-500 group-hover:text-[#66B539] transition-colors duration-300" />
                    <span>Try Demo</span>
                  </a>
                  <a 
                    href="#reviews" 
                    className="group flex items-center space-x-3 text-gray-700 hover:text-green-500 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Star className="w-5 h-5 text-green-500 group-hover:text-[#66B539] transition-colors duration-300" />
                    <span>Reviews</span>
                  </a>
                  <a 
                    href="#stats" 
                    className="group flex items-center space-x-3 text-gray-700 hover:text-green-500 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ChartNoAxesCombined className="w-5 h-5 text-green-500 group-hover:text-[#66B539] transition-colors duration-300" />
                    <span>Stats</span>
                  </a>
                  <a 
                    href="#features" 
                    className="group flex items-center space-x-3 text-gray-700 hover:text-green-500 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BrainCircuit className="w-5 h-5 text-green-500 group-hover:text-[#66B539] transition-colors duration-300" />
                    <span>AI Features</span>
                  </a>
                  <a 
                    href="#contact" 
                    className="group flex items-center space-x-3 text-gray-700 hover:text-green-500 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Contact className="w-5 h-5 text-green-500 group-hover:text-[#66B539] transition-colors duration-300" />
                    <span>Contact Us</span>
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;