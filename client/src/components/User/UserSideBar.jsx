import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Home,
  BarChart3,
  TrendingUp,
  User,
  Target,
  LogOut,
  Plus,
  CheckCircle,
  Clock,
  GitBranch ,
  ListChecks ,
  PieChart ,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { logoutUser } from '../../store/auth';
const UserSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);





  const handleLogout = async () => {
    try {
      const data = await dispatch(logoutUser());
      console.log(data.payload);
      if (data.payload.success) {
        toast.success(data.payload.message);
      } else {
        toast.error(data.payload.message);
      }
    } catch (err) {
      toast.error(`something went wrong ${err}`);
    }
  };

const menuItems = [
  {
    icon: Plus,
    label: 'start analysis',
    path: '/user/home',
    description: 'Setup your business environment.'
  },
  {
    icon: TrendingUp,
    label: 'business analysis agent',
    path: '/user/business',
    description: 'Track business metrics.'
  },
  {
    icon: GitBranch,
    label: 'developer agent',
    path: '/user/development',
    description: 'View the tech and development plan.'
  },
  {
    icon: ListChecks,
    label: 'functional requirements agent',
    path: '/user/functional',
    description: 'Break down and analyze core functionalities.'
  },
  {
    icon: BarChart3,
    label: 'non-functional requirements agent',
    path: '/user/non-functional',
    description: 'Align business goals with KPIs.'
  },
  {
    icon: CheckCircle,
    label: 'validator agent',
    path: '/user/validator',
    description: 'refine and validate your plan using AI.'
  },
  {
    icon: PieChart,
    label: 'visualization agent',
    path: '/user/visualization',
    description: 'visual representations.'
  },
  {
    icon: User,
    label: 'Profile',
    path: '/user/profile',
    description: 'Manage your personal account and settings.'
  }
];

  const isActivePath = (path) => location.pathname === path;

  const activeGoals = stats ? stats.totalGoals - stats.completedGoals : 0;
  
  const weeklyProgress = stats?.overallCompletionRate || 0;

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-110 bg-black backdrop-blur-md border-r border-gray-200 z-40 flex-col justify-between">
      <div className="p-6">
        <nav className="space-y-5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={` cursor-pointer w-full group flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-red-500 text-white shadow-lg shadow-purple-500/25 transform scale-[1.02]'
                    : 'text-gray-700 hover:text-purple-500 hover:bg-purple-500/5 hover:translate-x-1'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-purple-500/10'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 group-hover:text-purple-500'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={`font-bold text-md ${
                      isActive ? 'text-white' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-white'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1 h-6 bg-white/50 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

      
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full group flex items-center space-x-3 px-3 py-3 rounded-lg 
                    transition-all duration-300 text-red-700 
                    hover:text-red-500 hover:bg-red-500/5 hover:translate-x-1 cursor-pointer   text-xl"
        >
          <span>Logout</span>
          <LogOut />
        </button>
      </div>
    </aside>
  );
};

export default UserSideBar;