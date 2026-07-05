import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText, FiUpload, FiLink, FiFile, FiX,
  FiAlertCircle, FiCheckCircle, FiArrowRight,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AppLayout from '../components/common/AppLayout';
import { LoadingOverlay } from '../components/common/LoadingSpinner';
import { RiskBadge } from '../components/common/RiskBadge';
import { analyzeText, analyzeFile, analyzeUrl } from '../services/analysisService';
import { getRiskColors, getDocTypeLabel } from '../utils/riskUtils';

const MODES = [
  { id:'text', icon:FiFileText, label:'Paste Text',   desc:'Paste legal document text directly' },
  { id:'file', icon:FiUpload,   label:'Upload File',  desc:'PDF, DOCX or TXT up to 20MB'       },
  { id:'url',  icon:FiLink,     label:'From URL',     desc:'Fetch from a public web page'       },
];

const ClassificationBadge = ({ classification }) => {
  if (!classification) return null;
  const conf = Math.round((classification.primaryConfidence || 0) * 100);
  const label = getDocTypeLabel(classification.primaryType);
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
      <FiCheckCircle className="text-primary-600 dark:text-primary-400 flex-shrink-0" size={16} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          AI classified as: <span className="font-black">{label}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-primary-200 dark:bg-primary-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full" style={{ width:`${conf}%` }} />
          </div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{conf}%</span>
        </div>
      </div>
    </div>
  );
};

export default function UploadCenterPage() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);
  const [mode,    setMode]    = useState('text');
  const [text,    setText]    = useState('');
  const [file,    setFile]    = useState(null);
  const [url,     setUrl]     = useState('');
  const [drag,    setDrag]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [prog,    setProg]    = useState(0);
  const [result,  setResult]  = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null); setProg(0);
    try {
      let report;
      if (mode === 'text')      report = await analyzeText(text);
      else if (mode === 'file') report = await analyzeFile(file, setProg);
      else                      report = await analyzeUrl(url);
      setResult(report);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading ||
    (mode==='text' && text.trim().length < 50) ||
    (mode==='file' && !file) ||
    (mode==='url'  && !url.trim());

  return (
    <AppLayout title="Upload & Analyze">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Mode tabs */}
        <div className="card p-6">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-dark-700 rounded-xl mb-6">
            {MODES.map(({ id, icon:Icon, label }) => (
              <button key={id} onClick={() => { setMode(id); setResult(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all
                  ${mode===id ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <Icon size={15} /><span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'text' && (
              <div>
                <label className="label">Paste Legal Document Text</label>
                <textarea value={text} onChange={e=>setText(e.target.value)} rows={12}
                  placeholder="Paste Terms of Service, Privacy Policy, NDA, Contract… (minimum 50 characters)"
                  className="input-field resize-none font-mono text-xs leading-relaxed" disabled={loading} />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-400">
                    {text.length < 50 && text.length > 0 ? `${50-text.length} more chars needed` : `${text.length.toLocaleString()} chars`}
                  </p>
                  {text && <button type="button" onClick={()=>setText('')} className="text-xs text-slate-400 hover:text-red-500">Clear</button>}
                </div>
              </div>
            )}

            {mode === 'file' && (
              <div>
                <label className="label">Upload PDF, DOCX or TXT</label>
                <div onClick={() => !file && fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
                  onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files?.[0];if(f)setFile(f);}}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${drag?'border-primary-400 bg-primary-50 dark:bg-primary-900/20':'border-slate-300 dark:border-dark-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-dark-700'}`}>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)setFile(f);}} disabled={loading} />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <FiFile className="text-primary-600" size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size/1024/1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={e=>{e.stopPropagation();setFile(null);}} className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="mx-auto text-slate-400 mb-3" size={32} />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Drop file here or <span className="text-primary-600">browse</span></p>
                      <p className="text-xs text-slate-400 mt-1">PDF · DOCX · TXT — max 20MB</p>
                    </>
                  )}
                </div>
                {loading && prog > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Uploading…</span><span>{prog}%</span></div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{width:`${prog}%`}} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'url' && (
              <div>
                <label className="label">Website URL</label>
                <input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/terms-of-service"
                  className="input-field" disabled={loading} />
                <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-xs text-amber-700 dark:text-amber-400">Some sites block automated requests. If it fails, copy-paste the text instead.</p>
                </div>
              </div>
            )}

            <button type="submit" disabled={disabled} className="btn-primary w-full py-3 text-base">
              {loading ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>AI Analyzing…</span></span>
                : <span className="flex items-center gap-2 justify-center"><FiUpload size={18}/><span>Run Full AI Analysis</span></span>}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && <div className="card animate-fade-in"><LoadingOverlay text="Running 4 AI analysis modules…" /></div>}

        {/* Result preview */}
        {result && !loading && (
          <div className="card p-6 animate-slide-up space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">{result.title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{result.clauses?.length || 0} red flags detected</p>
              </div>
              <RiskBadge level={result.riskLevel} className="flex-shrink-0 text-sm" />
            </div>

            {/* AI Classification */}
            {result.classificationProbabilities && (
              <ClassificationBadge classification={{ primaryType: result.documentType, primaryConfidence: result.classificationConfidence, allProbabilities: result.classificationProbabilities }} />
            )}

            {/* Scores */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'Risk Score',       val:`${result.riskScore}/100`,       color: getRiskColors(result.riskLevel).hex },
                { label:'Compliance Score', val:`${result.complianceScore}%`,    color:'#22c55e' },
                { label:'Total Clauses',    val:result.clauses?.length || 0,     color:'#3b82f6' },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl bg-slate-50 dark:bg-dark-700 p-3 text-center">
                  <p className="text-xl font-black" style={{color}}>{val}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {result.summary && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{result.summary}</p>}

            {result.executiveHeadline && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">⚡ {result.executiveHeadline}</p>
              </div>
            )}

            <button onClick={() => navigate(`/report/${result.id||result._id}`)} className="btn-primary w-full">
              View Full Report <FiArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
