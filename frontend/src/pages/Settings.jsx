import React, { useState } from 'react';
import {
  User,
  Lock,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCw,
  ShieldCheck,
  Save,
  Layers,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateUser } = useAuth();

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || 'Sarah Chen');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'sarah.chen@enterprise.ai');
  const [profileOrg, setProfileOrg] = useState(user?.organization || 'Acme Global Defense & Health AI');
  const [profileRole, setProfileRole] = useState(user?.role || 'Lead AI & Retrieval Engineer');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // API Key state
  const [apiKey, setApiKey] = useState('raglens_live_sk_948f29d8a1c43b8e712a83f94');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      updateUser({
        name: profileName,
        email: profileEmail,
        organization: profileOrg,
        role: profileRole,
      });
      setSavingProfile(false);
      toast.success('Profile details updated successfully');
    }, 400);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    }, 500);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleConfirmRegenerateKey = () => {
    setRegenerating(true);
    setTimeout(() => {
      const newKey = 'raglens_live_sk_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
      setApiKey(newKey);
      setRegenerating(false);
      setRegenerateModalOpen(false);
      toast.success('New API key generated. Previous key invalidated.');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">
          Platform Settings & Credentials
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Manage your enterprise user profile, authentication credentials, and secure API keys.
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-700" />
            <CardTitle>User Profile</CardTitle>
          </div>
          <CardDescription>
            Personal and organizational information associated with this seat
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <Input
                label="Work Email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organization"
                value={profileOrg}
                onChange={(e) => setProfileOrg(e.target.value)}
              />
              <Input
                label="Assigned Role"
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={savingProfile}
              icon={Save}
            >
              Save Profile
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-700" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Ensure password complies with enterprise single sign-on policy (minimum 8 characters)
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSavePassword}>
          <CardContent className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={savingPassword}
            >
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-700" />
            <CardTitle>Enterprise API Access Key</CardTitle>
          </div>
          <CardDescription>
            Bearer token for authenticating external ingestion workers, pipelines, and evaluation runs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Production Secret Key
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-mono text-stone-800 select-all"
                />
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                icon={showApiKey ? EyeOff : Eye}
              >
                {showApiKey ? 'Hide' : 'Reveal'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyApiKey}
                icon={copiedKey ? Check : Copy}
              >
                {copiedKey ? 'Copied' : 'Copy'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={RotateCw}
                onClick={() => setRegenerateModalOpen(true)}
              >
                Regenerate
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-stone-50 p-3 border border-stone-200 text-xs text-stone-600 space-y-1">
            <span className="font-semibold text-stone-900">Key Permissions:</span>
            <p className="text-[11px] text-stone-500">
              Read & Write access to all 8 indexed documents and SSE streaming chat endpoints. Store this key securely.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Parameters Summary */}
      <Card className="bg-stone-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-700" />
            <CardTitle>System Ingestion Parameters</CardTitle>
          </div>
          <CardDescription>Immutable cluster configuration settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-stone-400">Embedding Model:</span>
              <p className="font-semibold text-stone-800 mt-0.5">text-embedding-3-large</p>
            </div>
            <div>
              <span className="text-stone-400">Vector Dimensions:</span>
              <p className="font-semibold text-stone-800 mt-0.5">3,072 dimensions</p>
            </div>
            <div>
              <span className="text-stone-400">Chunk Size & Overlap:</span>
              <p className="font-semibold text-stone-800 mt-0.5">512 / 64 tokens</p>
            </div>
            <div>
              <span className="text-stone-400">Reranker Model:</span>
              <p className="font-semibold text-stone-800 mt-0.5">bge-reranker-large</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate Confirmation Modal */}
      <Modal
        isOpen={regenerateModalOpen}
        onClose={() => !regenerating && setRegenerateModalOpen(false)}
        title="Regenerate API Key"
        description="Are you sure you want to regenerate this API key?"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              disabled={regenerating}
              onClick={() => setRegenerateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={regenerating}
              onClick={handleConfirmRegenerateKey}
            >
              Regenerate Key
            </Button>
          </>
        }
      >
        <p className="text-xs text-stone-600 leading-relaxed">
          Generating a new API key will immediately invalidate your existing key. Any continuous pipelines, automated cron jobs, or background ingestion tasks using the current key will fail until updated.
        </p>
      </Modal>
    </div>
  );
}
