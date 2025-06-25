'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import SharedCodeViewer from '../../components/SharedCode/SharedCodeViewer';

export default function SharedCodePage() {
  const { shareId } = useParams();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const res = await fetch(`/api/folder/share/${shareId}`, {
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

  return (
    <SharedCodeViewer 
      file={file} 
      loading={loading} 
      error={error} 
      router={router} 
    />
  );
}