import Editor from '@monaco-editor/react';

export default function EditorPanel({ fileName, language, editorContent, onContentChange }) {
  return (
    <div className="lg:col-span-3">
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-amber-500 rounded-full hover:bg-amber-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full hover:bg-emerald-400 transition-colors cursor-pointer"></div>
            </div>
            <div className="text-slate-500 font-mono text-sm">~/</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30 font-mono">
              EDITOR
            </div>
            <span className="text-slate-400 text-sm font-mono">
              {fileName || 'untitled'}.{language === 'javascript' ? 'js' : language}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="h-[500px]">
            <Editor
              height="100%"
              language={language}
              value={editorContent}
              onChange={onContentChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 20 },
                fontFamily: 'Fira Code, monospace',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'all',
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
