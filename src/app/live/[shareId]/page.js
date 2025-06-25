// src/app/live/[shareId]/page.js
"use client";

import { use } from 'react';
import { useParams,useRouter } from 'next/navigation';
import LiveEditorWrapper from '@/components/SharedCode/LiveEditorWrapper';

export default function SharePage({ params }) {
  // Unwrap the params promise using React.use()
  const unwrappedParams = use(params);
  const shareId = unwrappedParams?.shareId;
  const router = useRouter();

  if (!shareId) {
    return <div className="p-4 text-center">Loading share ID...</div>;
  }

  return (
    
      <LiveEditorWrapper shareId={shareId} router={router} />
   
  );
}