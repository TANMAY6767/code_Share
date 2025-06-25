'use client';
import { useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import Header from '../Navbar/Header';
import EditorPanel from './EditorPanel';
import ConfigPanel from './ConfigPanel';
import ShareModal from '../Modal/ShareModal';
import ReadOnlyWarning from '../Modal/ReadOnlyWarning';

export default function EditableCodeViewer({ file, router }) {
  const [language, setLanguage] = useState(file.language || 'javascript');
  const [fileName, setFileName] = useState(file.filename || '');
  const [type, setType] = useState(file.type || 'editable');
  const [editorContent, setEditorContent] = useState(file.content || '');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [expiryTime, setExpiryTime] = useState('1h');
  const [copied, setCopied] = useState(false);
  const [showReadOnlyWarning, setShowReadOnlyWarning] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [pendingReadOnlySave, setPendingReadOnlySave] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // Add this state

  useEffect(() => {
  const query = new URLSearchParams(window.location.search);
  const shouldDownload = query.has('download');

  const alreadyDownloaded = sessionStorage.getItem('downloaded');
  
  if (shouldDownload && file?.content && !alreadyDownloaded) {
    const element = document.createElement('a');
    const fileBlob = new Blob([file.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = file.filename || 'shared-code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    sessionStorage.setItem('downloaded', 'true'); // prevent double download
  }
}, [file]);


  const saveFile = async () => {
  try {
    setSaveStatus('saving');
    
    const res = await fetch(`/api/folder/done/${file.shareId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: fileName,
        language,
        content: editorContent,
        type,
        expiryTime
      })
    });

    if (!res.ok) throw new Error('Failed to save');
    const data = await res.json();
    if (!data.success) throw new Error('Failed to save file');

    // Add delay AFTER successful save for UI feedback
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('File saved successfully!');
    setSaveStatus('saved');
    
    // Reset to idle after 2 seconds
    setTimeout(() => setSaveStatus('idle'), 1000);
    
    return true;
  } catch (err) {
    toast.error('Failed to save file');
    setSaveStatus('idle');
    return false;
  }
};

  const handleSaveClick = () => {
  if (type === 'editable') {
    saveFile();
  } else if (type === 'read-only') {
    setSaveStatus('saving');
    setShowReadOnlyWarning(true);
  }
};

  const handleCancelReadOnly = () => {
  setShowReadOnlyWarning(false);
  setSaveStatus('idle'); // Reset save status when cancelled
  if (type === 'read-only') {
    setType('editable');
  }
};

const handleConfirmReadOnly = () => {
    setType('read-only');
    if (dontAskAgain) {
      localStorage.setItem('hideReadOnlyWarning', 'true');
    }
    setShowReadOnlyWarning(false);
    
    // Show share modal after confirmation
    setIsShareModalOpen(true);
    // Mark that we need to save after share modal closes
    setPendingReadOnlySave(true);
  };

   const handleDontAskAgainChange = (checked) => {
    setDontAskAgain(checked);
  };
  const copyCode = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const fileBlob = new Blob([editorContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = fileName || 'shared-code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <Header 
        router={router} 
        onShare={() => setIsShareModalOpen(true)}
        onCopy={copyCode}
        onDownload={downloadCode}
        onSave={handleSaveClick} 
        saveStatus={saveStatus} 
        copied={copied}
        isSaved={isSaved}
        fileType={type}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <EditorPanel 
            fileName={fileName}
            language={language}
            editorContent={editorContent}
            onContentChange={setEditorContent}
          />
          
          <ConfigPanel 
            fileName={fileName}
            language={language}
            type={type}
            expiryTime={expiryTime}
            editorContent={editorContent}
            onFileNameChange={setFileName}
            onLanguageChange={setLanguage}
            onTypeChange={setType}
            onExpiryTimeChange={setExpiryTime}
            onSave={saveFile}
          />
        </div>
      </div>

      {isShareModalOpen && file?.shareId && (
        <ShareModal
          onClose={() => {
            setIsShareModalOpen(false);
            // Save and reload after share modal is closed for read-only flow
            if (pendingReadOnlySave) {
              saveFile().then(() => {
               window.location.reload()
              });
              setPendingReadOnlySave(false);
            }
          }}
          shareId={file.shareId}
        />
      )}
      {showReadOnlyWarning && (
        <ReadOnlyWarning
          onConfirm={handleConfirmReadOnly}
          onCancel={handleCancelReadOnly}
          onDontAskAgainChange={handleDontAskAgainChange}
          dontAskAgain={dontAskAgain}
        />
      )}
    </div>
  );
} 