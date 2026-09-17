import React from 'react';
import { ActiveTab } from '../types';
import { Edit3, BarChart3, Calendar, Home, Settings } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'controllo' as ActiveTab,
      label: 'Controllo',
      fullName: 'Controllo Giornaliero',
      icon: Edit3,
    },
    {
      id: 'riepilogo' as ActiveTab,
      label: 'Riepilogo',
      fullName: 'Riepilogo',
      icon: BarChart3,
    },
    {
      id: 'calendario' as ActiveTab,
      label: 'Calendario',
      fullName: 'Calendario',
      icon: Calendar,
    },
    {
      id: 'home' as ActiveTab,
      label: 'Home',
      fullName: 'Home',
      icon: Home,
    },
    {
      id: 'impostazioni' as ActiveTab,
      label: 'Strumenti',
      fullName: 'Impostazioni',
      icon: Settings,
    },
  ];

  return (
    <nav
      id="bottom-mobile-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-lg px-1 py-1 max-w-xl mx-auto print:hidden"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-h-[50px] min-w-[58px] ${
                isActive
                  ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                  : 'text-gray-500 hover:text-gray-900 active:scale-95 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              <span className="text-[10px] tracking-tight whitespace-nowrap leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
