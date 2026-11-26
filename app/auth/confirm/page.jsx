import React, { Suspense } from 'react';
import ConfirmLinkView from '@/components/auth/ConfirmLinkView';

export const dynamic = 'force-dynamic';

export default function ConfirmLinkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050507]" />}>
      <ConfirmLinkView />
    </Suspense>
  );
}
