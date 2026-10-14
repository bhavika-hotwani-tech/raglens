import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-stone-50 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-stone-200 text-emerald-800 mb-4">
        <FileQuestion className="h-8 w-8 stroke-[1.5]" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-stone-900">
        404 — Page Not Found
      </h1>
      <p className="mt-2 text-xs text-stone-500 max-w-sm">
        The requested retrieval route does not exist or has been relocated to another endpoint.
      </p>

      <div className="mt-6">
        <Button
          variant="primary"
          size="md"
          icon={ArrowLeft}
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
