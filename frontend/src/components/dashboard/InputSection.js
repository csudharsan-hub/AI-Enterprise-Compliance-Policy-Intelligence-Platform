import React, { useState, useRef } from 'react';
import {
  FiFileText,
  FiUpload,
  FiLink,
  FiAlertCircle,
  FiFile,
  FiX,
} from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';

const MODES = [
  { id: 'text', label: 'Paste Text', icon: FiFileText },
  { id: 'file', label: 'Upload File', icon: FiUpload },
  { id: 'url', label: 'From URL', icon: FiLink },
];

const InputSection = ({ onAnalyze, loading, uploadProgress }) => {
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'text') {
      if (!text.trim() || text.trim().length < 50) return;
      onAnalyze({ mode: 'text', text });
    } else if (mode === 'file') {
      if (!file) return;
      onAnalyze({ mode: 'file', file });
    } else if (mode === 'url') {
      if (!url.trim()) return;
      onAnalyze({ mode: 'url', url });
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const isSubmitDisabled =
    loading ||
    (mode === 'text' && text.trim().length < 50) ||
    (mode === 'file' && !file) ||
    (mode === 'url' && !url.trim());

  return (
    <div className="card p-6 animate-fade-in">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <FiFileText className="text-primary-600" size={20} />
        Analyze Document
      </h2>

      {/* Mode selector */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-dark-700 rounded-lg mb-6">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-150
              ${
                mode === id
                  ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text mode */}
        {mode === 'text' && (
          <div>
            <label className="label">
              Paste Terms of Service, Privacy Policy, or Legal Contract
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the legal document text here... (minimum 50 characters)"
              rows={10}
              className="input-field resize-none font-mono text-xs leading-relaxed"
              disabled={loading}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-slate-400">
                {text.length < 50 && text.length > 0
                  ? `${50 - text.length} more characters needed`
                  : text.length > 0
                  ? `${text.length.toLocaleString()} characters`
                  : 'Minimum 50 characters required'}
              </p>
              {text.length > 0 && (
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* File mode */}
        {mode === 'file' && (
          <div>
            <label className="label">Upload PDF, DOCX, or TXT file</label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${
                  dragOver
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-300 dark:border-dark-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-dark-700'
                }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiFile className="text-primary-600 dark:text-primary-400" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Drop file here or <span className="text-primary-600">browse</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT — up to 10MB</p>
                </>
              )}
            </div>

            {/* Upload progress */}
            {loading && uploadProgress > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL mode */}
        {mode === 'url' && (
          <div>
            <label className="label">Enter URL of Terms of Service page</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/terms-of-service"
              className="input-field"
              disabled={loading}
            />
            <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Some websites block automated requests. If fetching fails, copy and paste the text directly.
              </p>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="btn-primary w-full text-base py-3"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <FiFileText size={18} />
              <span>Analyze Document</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;
