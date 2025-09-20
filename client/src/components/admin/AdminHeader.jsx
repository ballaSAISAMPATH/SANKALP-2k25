import React, { useState } from 'react';
import { Brain, LayoutDashboard, Star, UserCog, LogOut,Users,Presentation,ScrollText  } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/auth';
import { toast } from 'sonner';
const AdminHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

   const menuItems = [
     {
       icon: LayoutDashboard,
       label: 'Dashboard',
       path: '/admin/dashboard',
       description: 'View analytics'
     },
     {
       icon: Users,
       label: 'Users',
       path: '/admin/users',
       description: 'user wise statistics'
     },
     {
       icon: Star,
       label: 'Reviews',
       path: '/admin/reviews',
       description: 'User feedback'
     },
     {
       icon: Presentation,
       label: 'Testimonials',
       path: '/admin/set-testimonials',
       description: 'update testimonials in landing page'
     },
     
     {
       icon: ScrollText ,
       label: 'Recent Logins',
       path: '/admin/recent-logins',
       description: 'view the last recent logins'
     },
     
     {
       icon: UserCog,
       label: 'Profile',
       path: '/admin/profile',
       description: 'Manage account'
     }
   ];
  const handleLogout = async () => {
    try {
      const data = await dispatch(logoutUser());
      if (data.payload.success) {
        toast.success(data.payload.message);
      } else {
        toast.error(data.payload.message);
      }
    } catch (err) {
      toast.error(`Something went wrong ${err}`);
    }
  };

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center transform rotate-12">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">AI TaskFlow</span>
              <div className="text-xs text-green-500 font-medium">Admin Panel</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 relative">
            <button
              className="bg-gradient-to-br from-green-500 cursor-pointer to-green-600 hover:from-[#8FE877] hover:to-green-500 text-white font-bold w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ring-2 ring-white/20"
              onClick={() => navigate('/admin/profile')}
            >
              {user && user.userName?.[0]?.toUpperCase()}
            </button>
          </nav>

          <div className="md:hidden flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="bg-gradient-to-br from-green-500 to-green-600 hover:from-[#8FE877] hover:to-green-500 text-white font-bold w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ring-2 ring-white/20">
                  {user && user.userName?.[0]?.toUpperCase()}
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[320px] sm:w-[400px] bg-white border-l border-green-100 z-[70] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=open]:duration-300 data-[state=closed]:duration-300"
              >
                <SheetHeader className="pb-6 border-b border-green-100 flex-shrink-0">
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center transform rotate-12 shadow-lg">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        {user && user.userName}
                      </span>
                      <div className="text-xs text-green-500 font-medium">Admin Panel</div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                  <nav className="flex flex-col gap-4 mt-6">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                            isActive
                              ? 'bg-green-500/10 text-green-600 font-semibold'
                              : 'text-gray-700 hover:text-green-500 hover:bg-green-500/5'
                          }`}
                        >
                          <div className="p-2 bg-green-500/10 rounded-md">
                            <Icon
                              className={`w-5 h-5 ${
                                isActive ? 'text-green-600' : 'text-green-500'
                              }`}
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="flex-shrink-0 border-t border-green-100 pt-4">
                  <button
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-gray-700 hover:text-red-500 hover:bg-red-50 group"
                    onClick={handleLogout}
                  >
                    <div className="p-2 bg-red-50 group-hover:bg-red-100 rounded-md transition-colors">
                      <LogOut className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Logout</div>
                      <div className="text-xs text-gray-500">Sign out of your account</div>
                    </div>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
