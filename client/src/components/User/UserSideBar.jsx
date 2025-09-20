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
      icon: Home,
      label: 'task 1',
      path: '/user/home',
      description: 'Update status'
    },
    {
      icon: Plus,
      label: 'task 2',
      path: '..',
      description: 'Add new AI tasks'
    },
    {
      icon: BarChart3,
      label: 'task 3',
      path: '..',
      description: 'View analytics'
    },
    {
      icon: MessageSquare,
      label: 'task 4',
      path: '..',
      description: 'Share feedback'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/user/profile',
      description: 'Manage account'
    }
  ];

  const isActivePath = (path) => location.pathname === path;

  const activeGoals = stats ? stats.totalGoals - stats.completedGoals : 0;
  
  const weeklyProgress = stats?.overallCompletionRate || 0;

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/95 backdrop-blur-md border-r border-gray-200 z-40 flex-col justify-between">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={` cursor-pointer w-full group flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-[#8FE877] text-white shadow-lg shadow-green-500/25 transform scale-[1.02]'
                    : 'text-gray-700 hover:text-green-500 hover:bg-green-500/5 hover:translate-x-1'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-green-500/10'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 group-hover:text-green-500'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium text-sm ${
                      isActive ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-gray-500'
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