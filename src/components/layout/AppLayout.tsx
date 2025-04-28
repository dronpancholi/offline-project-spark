
import { useApp } from '@/contexts/AppContext';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PanelLeftIcon, PlusIcon } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Get the sidebar state from localStorage or default to true
    const savedState = localStorage.getItem('sidebarState');
    return savedState ? JSON.parse(savedState) : true;
  });
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);
  
  // Nav items
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Progress', path: '/progress' },
    { name: 'Settings', path: '/settings' }
  ];
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen bg-card border-r transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* App logo and name */}
        <div className="p-4 flex items-center h-16 border-b">
          {sidebarOpen ? (
            <>
              <span className="text-lg font-bold">First Projects</span>
            </>
          ) : (
            <span className="text-lg font-bold mx-auto">FP</span>
          )}
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  <span className={cn(!sidebarOpen && "sr-only")}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Quick add button */}
        <div className="p-4 border-t">
          <Link to="/tasks/add">
            <Button className="w-full" size={sidebarOpen ? "default" : "icon"}>
              <PlusIcon className="h-5 w-5 mr-2" />
              {sidebarOpen && <span>Add Task</span>}
            </Button>
          </Link>
        </div>
        
        {/* Toggle sidebar button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-0 translate-x-1/2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <PanelLeftIcon
            className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")}
          />
        </Button>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">
            {navItems.find(item => item.path === location.pathname)?.name || 'First Projects'}
          </h1>
          
          {/* Profile info */}
          {profile && (
            <Link to="/settings" className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{profile.fullName}</p>
                {profile.username && (
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture}
                    alt={profile.fullName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          )}
        </header>
        
        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
