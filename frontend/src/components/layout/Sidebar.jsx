import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Knowledge Base', path: '/knowledge', icon: Database },
  { name: 'Chat & Citations', path: '/chat', icon: MessageSquare },
  { name: 'Evaluation', path: '/evaluation', icon: BarChart3 },
];

export default function Sidebar({ onRequestLogout, onCloseMobile }) {
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-stone-200 bg-white select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-stone-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-stone-900 tracking-tight text-base">
              RAGLens
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/80">
              v2.4
            </span>
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Advanced RAG Platform
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60 shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* Index Status Card */}
        <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-3.5 mx-1">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Reranker Engine
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-medium">
              BGE Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 leading-relaxed">
            Multi-query expansion & Cross-Encoder active for high recall.
          </p>
        </div>
      </div>

      {/* Sidebar Footer: User profile and Logout */}
      <div className="border-t border-stone-100 p-3 bg-stone-50/50">
        <div className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-white transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SC'}
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-semibold text-stone-900 leading-tight">
                {user?.name || 'Sarah Chen'}
              </p>
              <p className="truncate text-[11px] text-stone-500 leading-tight">
                {user?.email || 'sarah.chen@enterprise.ai'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRequestLogout}
            title="Log out"
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
