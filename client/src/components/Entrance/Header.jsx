import React, { useState } from "react";
import {
  Brain,
  Menu,
  Zap,
  Star,
  ChartNoAxesCombined,
  BrainCircuit,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-purple-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo + Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center transform rotate-12 shadow-lg shadow-purple-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-white">NexGent</span>
              <div className="text-xs text-purple-400 font-medium">
                Multi-Agent AI
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
            >
              home
            </a>
            <a
              href="#stats"
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
            >
              Stats
            </a>
            <a
              href="#demo"
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
            >
              Agents
            </a>
            
            <a
              href="#contact"
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
            >
              Contact
            </a>
            <button
              className="bg-purple-500 hover:bg-purple-400 cursor-pointer text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200"
              onClick={() => navigate("/auth/login")}
            >
              Login
            </button>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              className="bg-purple-500 hover:bg-purple-400 text-white font-semibold px-3 py-2 rounded-md transition-colors duration-200 text-sm"
              onClick={() => navigate("/auth/login")}
            >
              Login
            </button>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="text-gray-200 hover:text-purple-400 transition-colors duration-200 p-2 hover:bg-purple-500/10 rounded-lg">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[320px] sm:w-[400px] bg-black border-l border-purple-500/40"
              >
                <SheetHeader className="pb-6 border-b border-gray-800">
                  <SheetTitle className="flex items-center space-x-3 justify-start">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl flex items-center justify-center transform rotate-12 shadow-lg shadow-purple-500/25">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-300 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-white">
                        NexGent
                      </span>
                      <div className="text-xs text-purple-400 font-semibold">
                        Multi-Agent AI
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col space-y-4 mt-8">
                  <a
                    href="#demo"
                    className="group flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Zap className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                    <span>home</span>
                  </a>
                  <a
                    href="#home"
                    className="group flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ChartNoAxesCombined className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                    <span>Stats</span>
                  </a>
                  <a
                    href="#stats"
                    className="group flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BrainCircuit className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                    <span>Agents</span>
                  </a>
                 
                  <a
                    href="#contact"
                    className="group flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Star className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                    <span>Contact</span>
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
