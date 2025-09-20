import React, { useState } from 'react'
import AdminSideBar from './AdminSideBar'
import { Outlet } from 'react-router-dom'
import AdminHeader from './AdminHeader'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <AdminHeader toggleSidebar={toggleSidebar} />
      
      <AdminSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      
      <main className="md:ml-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 right-10 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#8FE877]/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      
      <div 
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      >
      </div>
    </div>
  )
}

export default AdminLayout