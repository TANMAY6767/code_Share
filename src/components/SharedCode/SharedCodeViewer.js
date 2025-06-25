'use client';
import LoadingState from './Error-Loading/LoadingState';
import ErrorState from './Error-Loading/ErrorState';
import EditableCodeViewer from './EditableCodeViewer/EditableCodeViewer';
import ReadOnlyCodeViewer from './Read-only/ReadOnlyCodeViewer';

export default function SharedCodeViewer({ file, loading, error, router }) {
  if (loading) {
    return <LoadingState />;
  }

  if (error || !file) {
    return <ErrorState router={router} />;
  }

  if (file.type === "editable") {
    return <EditableCodeViewer file={file} router={router} />;
  }

  return <ReadOnlyCodeViewer file={file} router={router} />;
}