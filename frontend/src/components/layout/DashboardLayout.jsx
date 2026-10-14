import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      toast.success('Logged out successfully');
      setShowLogoutModal(false);
      navigate('/login');
    } catch {
      toast.error('Failed to log out cleanly.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-50 font-['Inter',sans-serif]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar onRequestLogout={() => setShowLogoutModal(true)} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-white z-50">
            <Sidebar
              onRequestLogout={() => {
                setMobileMenuOpen(false);
                setShowLogoutModal(true);
              }}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar
          onToggleMobile={() => setMobileMenuOpen((prev) => !prev)}
          onRequestLogout={() => setShowLogoutModal(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => !loggingOut && setShowLogoutModal(false)}
        title="Confirm Session Sign-out"
        description="Are you sure you want to log out of your RAGLens enterprise workspace?"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              disabled={loggingOut}
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={loggingOut}
              onClick={handleConfirmLogout}
            >
              Log out
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-lg bg-stone-50 p-3.5 border border-stone-200">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-stone-600 leading-relaxed">
            Your current active retrieval sessions and unsaved settings will be preserved for your account, but you will need to re-authenticate with your enterprise credentials.
          </p>
        </div>
      </Modal>
    </div>
  );
}
