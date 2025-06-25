// src/components/SharedCode/LiveEditorWrapper.js
"use client";

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import LoadingState from './Error-Loading/LoadingState';
import ErrorState from './Error-Loading/ErrorState';
const LiveEditor = dynamic(
  () => import('./LiveEditor'),
  { 
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading editor...</div>
  }
);

const LiveEditorWrapper = ({ shareId ,router}) => {
  const params = useParams();
  
  const [finalShareId, setFinalShareId] = useState(shareId);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Use shareId from props if available, otherwise from URL params
    if (!finalShareId && params?.shareId) {
      setFinalShareId(params.shareId);
    }
  }, [params, finalShareId]);
    useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const res = await fetch(`/api/folder/live/${finalShareId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (!data.success || !data.data) {
          throw new Error('Code not found');
        }

        setFile(data.data);
      } catch (err) {
        setError(true);
        toast.error('Failed to load shared code');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) fetchSharedFile();
  }, [shareId]);

  if (!finalShareId) {
    return <div className="p-4 text-center">Loading share ID...</div>;
  }

  // return <LiveEditor shareId={finalShareId} />;
   if (loading) {
      return <LoadingState />;
    }
  
    if (error || !file) {
      return <ErrorState router={router} />;
    }
  
    
  
    // return <ReadOnlyCodeViewer file={file} router={router} />;
    return <LiveEditor shareId={finalShareId} file={file} router={router}/>
};

export default LiveEditorWrapper;