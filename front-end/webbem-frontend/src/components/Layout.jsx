import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Header Toggle (Visible only on mobile) */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between z-20">
            <span className="font-black text-xl text-blue-600 tracking-tighter">SIAKSI</span>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Menu size={24} />
            </button>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F3F4F6] p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;