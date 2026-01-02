import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Plus, 
  LogOut,
  Package,
  TrendingUp,
  RefreshCw,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshData = () => {
    // Force a page reload to refresh all data
    window.location.reload();
    toast.success('Refreshing data...');
  };

  const exportData = () => {
    // Check if we're on the admin dashboard
    if (location.pathname === '/admin') {
      // Trigger export by finding and clicking the export button
      const exportButton = document.querySelector('[data-export="true"]');
      if (exportButton) {
        exportButton.click();
      } else {
        toast.error('Export button not found');
      }
    } else {
      toast.info('Navigate to Admin Dashboard to export data');
      navigate('/admin');
    }
  };

  const navigationItems = [
    ...(isAdmin ? [
      {
        name: 'Dashboard',
        path: '/admin',
        icon: Home,
        adminOnly: true
      },
      {
        name: 'Add Stock',
        path: '/add-stock',
        icon: Plus,
        adminOnly: true
      }
    ] : [
      {
        name: 'Dashboard',
        path: '/shop',
        icon: Home,
        adminOnly: false
      }
    ])
  ];

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item, onClick }) => (
    <button
      onClick={() => {
        navigate(item.path);
        onClick?.();
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-all duration-200 ${
        isActive(item.path)
          ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-600'
          : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
      }`}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{item.name}</span>
    </button>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg border border-secondary-200"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-xl"
            >
              <MobileNavContent 
                navigationItems={navigationItems}
                onItemClick={() => setIsOpen(false)}
                user={user}
                onLogout={handleLogout}
                onRefresh={refreshData}
                onExport={exportData}
                isAdmin={isAdmin}
                currentPath={location.pathname}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <DesktopSidebar 
          navigationItems={navigationItems}
          user={user}
          onLogout={handleLogout}
          onRefresh={refreshData}
          onExport={exportData}
          isAdmin={isAdmin}
          currentPath={location.pathname}
        />
      </div>
    </>
  );
};

// Mobile Navigation Content
const MobileNavContent = ({ navigationItems, onItemClick, user, onLogout, onRefresh, onExport, isAdmin, currentPath }) => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-6 py-8 border-b border-secondary-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-secondary-900">NAKASOGA</h1>
          <p className="text-sm text-secondary-600">Textiles</p>
        </div>
      </div>
    </div>

    {/* User Info */}
    <div className="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
      <p className="text-sm font-medium text-secondary-900">{user?.email}</p>
      <p className="text-xs text-secondary-600 capitalize">
        {user?.email?.includes('admin') ? 'Administrator' : 'Shop User'}
      </p>
    </div>

    {/* Navigation */}
    <div className="flex-1 px-4 py-6 space-y-2">
      {navigationItems.map((item) => (
        <NavLink key={item.path} item={item} onClick={onItemClick} />
      ))}
      
      {/* Admin Actions for Mobile */}
      {isAdmin && (
        <div className="pt-4 mt-4 border-t border-secondary-200">
          <p className="px-4 py-2 text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Admin Actions
          </p>
          <div className="space-y-1">
            <button
              onClick={() => {
                onRefresh();
                onItemClick?.();
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                currentPath === '/admin'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              }`}
            >
              <RefreshCw className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Refresh Data</span>
            </button>
            
            <button
              onClick={() => {
                onExport();
                onItemClick?.();
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                currentPath === '/admin'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              }`}
            >
              <Download className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Export Report</span>
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Footer */}
    <div className="px-4 py-6 border-t border-secondary-200">
      <Button
        variant="danger"
        onClick={onLogout}
        className="w-full flex items-center justify-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </div>
  </div>
);

// Desktop Sidebar
const DesktopSidebar = ({ navigationItems, user, onLogout, onRefresh, onExport, isAdmin, currentPath }) => (
  <div className="w-80 bg-white border-r border-secondary-200 h-screen flex flex-col">
    {/* Header */}
    <div className="px-6 py-8 border-b border-secondary-200">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
          <Package className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">NAKASOGA</h1>
          <p className="text-secondary-600">Premium Textiles</p>
        </div>
      </div>
    </div>

    {/* User Info */}
    <div className="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
      <p className="font-medium text-secondary-900">{user?.email}</p>
      <p className="text-sm text-secondary-600 capitalize">
        {user?.email?.includes('admin') ? 'Administrator' : 'Shop User'}
      </p>
    </div>

    {/* Navigation */}
    <div className="flex-1 px-4 py-6 space-y-2">
      {navigationItems.map((item) => (
        <NavLink key={item.path} item={item} />
      ))}
      
      {/* Admin Actions for Desktop */}
      {isAdmin && (
        <div className="pt-4 mt-4 border-t border-secondary-200">
          <p className="px-4 py-2 text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Admin Actions
          </p>
          <div className="space-y-1">
            <button
              onClick={onRefresh}
              className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                currentPath === '/admin'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              }`}
            >
              <RefreshCw className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Refresh Data</span>
            </button>
            
            <button
              onClick={onExport}
              className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                currentPath === '/admin'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              }`}
            >
              <Download className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Export Report</span>
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Footer */}
    <div className="px-4 py-6 border-t border-secondary-200">
      <Button
        variant="danger"
        onClick={onLogout}
        className="w-full flex items-center justify-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </div>
  </div>
);

// Reusable NavLink component
const NavLink = ({ item, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <button
      onClick={() => {
        navigate(item.path);
        onClick?.();
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-600'
          : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
      }`}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{item.name}</span>
    </button>
  );
};

export default Navigation;
