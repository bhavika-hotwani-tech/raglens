import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

const PAGE_TITLES = {
  '/': 'Overview & Telemetry',
  '/knowledge': 'Knowledge Base & Ingestion',
  '/chat': 'Enterprise Grounded Chat',
  '/evaluation': 'Automated RAG Evaluation Suite',
};

export default function TopBar({ onToggleMobile, onRequestLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'RAGLens';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="p-2 text-stone-500 hover:text-stone-900 md:hidden rounded-lg hover:bg-stone-100"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-stone-900">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Health Badge */}
        <div className="hidden md:flex items-center">
          <Badge variant="success" dot size="sm" className="bg-emerald-50 text-emerald-800 border-emerald-200">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3 w-3" />
              Pipeline Healthy (14ms)
            </span>
          </Badge>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/60 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition-colors cursor-pointer"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : 'S'}
            </div>
            <span className="hidden sm:inline font-semibold">{user?.name || 'User'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <p className="text-xs font-semibold text-stone-900 truncate">
                  {user?.name || 'Sarah Chen'}
                </p>
                <p className="text-[11px] text-stone-500 truncate">
                  {user?.role || 'Lead AI Engineer'}
                </p>
              </div>



              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onRequestLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span className="font-semibold">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
