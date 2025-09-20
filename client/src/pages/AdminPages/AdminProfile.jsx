import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteAccountAction } from '../../store/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/auth';
import { LogOut } from 'lucide-react';

const AdminProfile = () => {
  const navigate = useNavigate()
  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = () => {
    navigate('/admin/set-new-password')
  };

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

  const handleAccountDeletion = async () => {
    try {
      console.log('Account deletion requested for userId:', user?.id);
      
      const result = await dispatch(deleteAccountAction(user?.id)).unwrap();
      
      toast.success('Account deleted successfully. You will be logged out shortly.');
      
      setShowDeleteConfirm(false);
      
      
    } catch (error) {
      console.error('Account deletion failed:', error);
      toast.error(error || 'Failed to delete account. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center cursor-pointer space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={18} />
          <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
      
      <div className="space-y-6">
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={user?.userName || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email address cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sign-up Method
            </label>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                {(user?.authProvider || "email") === 'email' ? '📧 Email' : '🌐 Google'}
              </span>
              <span className="text-sm text-gray-500">
                You signed up using {(user?.authProvider || "email") === 'email' ? 'email and password' : 'Google authentication'}
              </span>
            </div>
          </div>

          {(user?.authProvider || "email") === 'email' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
              >
                Change Password
              </button>
              <p className="text-xs text-gray-500">Update your account password</p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-red-700">
                Danger Zone
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Delete Account'}
              </button>
            </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Account Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone.
                All your data will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccountDeletion}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
              </div>
      </div>
  );
};

export default AdminProfile;