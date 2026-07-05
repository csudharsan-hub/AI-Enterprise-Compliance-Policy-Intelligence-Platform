import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiDownload, FiCheckCircle, FiXCircle,
  FiChevronDown, FiChevronUp, FiAlertTriangle, FiInfo,
  FiEdit3, FiFileText, FiExternalLink,
} from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import AppLayout from '../components/common/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RiskBadge, SeverityBadge, StatusBadge } from '../components/common/RiskBadge';
import { getReport, approveReport, rejectReport, downloadReportJSON } from '../services/analysisService';
import { useAuth } from '../context/AuthContext';
import { getRiskColors, getSeverityColors, getDocTypeLabel, getSourceLabel, formatDateTime } from '../utils/riskUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

const TYPE_ICONS = {
  'Data Selling':'💰','Data Sharing':'🔗','Third-Party Sharing':'🤝','Auto Renewal':'🔄',
  'Forced Arbitration':'⚖️','Account Termination':'🚫','User Content License':'📝',
  'Tracking Cookies':'🍪','Location Tracking':'📍','Biometric Data':'👆',
  'AI Model Training':'🤖',"Children's Data":'👶','Data Retention':'🗄️',
  'Payment Renewal':'💳','Subscription Cancellation':'❌','Personal Information Collection':'👤',
  'Privacy Risks':'🔒','Liability Waiver':'🛡️','Non-Compete Clause':'🔐',
  'Intellectual Property Transfer':'©️','Unilateral Amendment':'✏️','Other':'⚠️',
};

const ClauseCard = ({ clause, index }) => {
  const [open, setOpen] = useState(false);
  const { hex } = getSeverityColors(clause.severity);

  return (
    <div className="rounded-xl border overflow-hidden transition-all hover:shadow-md dark:hover:shadow-dark-800"
      style={{ borderColor:`${hex}40` }}>
      <div className="px-4 py-3 flex items-center justify-between cursor-pointer"
        style={{ backgroundColor:`${hex}12` }} onClick={() => setOpen(p=>!p)}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl flex-shrink-0">{TYPE_ICONS[clause.type]||'⚠️'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{clause.type}</span>
              <SeverityBadge severity={clause.severity} />
            </div>
            {!open && <p className="text-xs text-slate-400 truncate mt-0.5 max-w-sm">{clause.plainEnglish}</p>}
          </div>
        </div>
        <span className="text-slate-400 ml-2 flex-shrink-0">{open ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}</span>
      </div>
      {open && (
        <div className="px-4 py-4 space-y-4 bg-white dark:bg-dark-800 border-t border-slate-100 dark:border-dark-700">
          <div>
            <div className="flex items-center gap-2 mb-1.5"><FiFileText size={13} className="text-slate-400"/><span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Original Clause</span></div>
            <blockquote className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-700 rounded-lg px-4 py-3 italic leading-relaxed border-l-4" style={{borderLeftColor:hex}}>
              "{clause.originalText}"
            </blockquote>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5"><FiInfo size={13} className="text-blue-400"/><span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What This Means</span></div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{clause.plainEnglish}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5"><FiAlertTriangle size={13} style={{color:hex}}/><span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Why It Matters</span></div>
            <p className="text-sm leading-relaxed" style={{color:hex}}>{clause.reason}</p>
          </div>
          {clause.rewriteSuggestion && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1.5"><FiEdit3 size={13} className="text-green-600 dark:text-green-400"/><span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">AI Rewrite Suggestion</span></div>
              <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed italic">"{clause.rewriteSuggestion}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canApprove } = useAuth();
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);

  useEffect(() => {
    getReport(id).then(setReport).catch(err => { toast.error(err.message); navigate('/history'); }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleApprove = async () => {
    setActing(true);
    try { setReport(await approveReport(id)); toast.success('Report approved.'); }
    catch (e) { toast.error(e.message); } finally { setActing(false); }
  };

  const handleReject = async () => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    setActing(true);
    try { setReport(await rejectReport(id, reason)); toast.success('Report rejected.'); }
    catch (e) { toast.error(e.message); } finally { setActing(false); }
  };

  if (loading) return <AppLayout title="Report"><div className="flex items-center justify-center h-64"><LoadingSpinner size="lg"/></div></AppLayout>;
  if (!report) return null;

  const colors = getRiskColors(report.riskLevel);
  const high = report.clauses?.filter(c=>c.severity==='High'||c.severity==='Critical').length||0;
  const med  = report.clauses?.filter(c=>c.severity==='Medium').length||0;
  const low  = report.clauses?.filter(c=>c.severity==='Low').length||0;

  const doughnutData = {
    labels:['High/Critical','Medium','Low'],
    datasets:[{data:[high,med,low],backgroundColor:['#ef4444','#f59e0b','#22c55e'],borderWidth:2,hoverOffset:4}],
  };

  return (
    <AppLayout title="">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button onClick={()=>navigate(-1)} className="mt-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"><FiArrowLeft size={18}/></button>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{report.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                <span className="bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded-full font-medium">{getDocTypeLabel(report.documentType)}</span>
                <span className="bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded-full font-medium">{getSourceLabel(report.sourceType)}</span>
                {report.sourceUrl && <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline"><FiExternalLink size={11}/>Source</a>}
                <span>{formatDateTime(report.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <RiskBadge level={report.riskLevel} className="text-sm"/>
            <StatusBadge status={report.status}/>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>downloadReportJSON(report)} className="btn-secondary text-sm"><FiDownload size={15}/>Download JSON</button>
          {canApprove() && report.status === 'PENDING_REVIEW' && (
            <>
              <button onClick={handleApprove} disabled={acting} className="btn-primary text-sm bg-green-600 hover:bg-green-700"><FiCheckCircle size={15}/>{acting?'…':'Approve'}</button>
              <button onClick={handleReject}  disabled={acting} className="btn-danger text-sm"><FiXCircle size={15}/>{acting?'…':'Reject'}</button>
            </>
          )}
          <button onClick={()=>navigate('/compare')} className="btn-secondary text-sm">Compare Versions</button>
        </div>

        {/* Scores + chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Scores */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5 space-y-4">
              {/* Risk bar */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Risk Score</span>
                  <span style={{color:colors.hex}}>{report.riskScore}/100</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{width:`${report.riskScore}%`,backgroundColor:colors.hex}}/>
                </div>
              </div>
              {/* Compliance bar */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Compliance Score</span>
                  <span className="text-green-600">{report.complianceScore}%</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{width:`${report.complianceScore}%`}}/>
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 pt-1">
                {[{l:'Total',v:report.clauses?.length||0,c:'text-slate-700 dark:text-slate-200'},{l:'High',v:high,c:'text-red-600'},{l:'Medium',v:med,c:'text-yellow-600'},{l:'Low',v:low,c:'text-green-600'}].map(({l,v,c})=>(
                  <div key={l} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                    <p className={`text-xl font-black ${c}`}>{v}</p>
                    <p className="text-xs text-slate-500 font-medium">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive summary */}
            {(report.executiveHeadline || report.summary) && (
              <div className="card p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Executive Summary</h3>
                {report.executiveHeadline && <p className="text-base font-bold text-slate-800 dark:text-white">⚡ {report.executiveHeadline}</p>}
                {report.summary && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>}
                {report.keyFindings?.length > 0 && (
                  <ul className="space-y-1.5">
                    {report.keyFindings.map((f,i)=><li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-red-500 flex-shrink-0 mt-0.5">•</span>{f}</li>)}
                  </ul>
                )}
                {report.immediateActions?.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-dark-700">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Immediate Actions</p>
                    <ul className="space-y-1">
                      {report.immediateActions.map((a,i)=><li key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400"><FiCheckCircle size={13} className="flex-shrink-0 mt-0.5"/>{a}</li>)}
                    </ul>
                  </div>
                )}
                {report.recommendedReviewer && (
                  <p className="text-xs text-slate-500">Recommended reviewer: <span className="font-semibold text-primary-600 dark:text-primary-400">{report.recommendedReviewer}</span></p>
                )}
              </div>
            )}
          </div>

          {/* Doughnut chart */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">Clause Breakdown</h3>
            {(high+med+low) > 0
              ? <Doughnut data={doughnutData} options={{plugins:{legend:{position:'bottom',labels:{font:{size:11},usePointStyle:true}}},maintainAspectRatio:true}}/>
              : <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No clauses detected</div>
            }
          </div>
        </div>

        {/* Clauses */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            Red Flag Clauses
            {report.clauses?.length > 0 && <span className="ml-2 text-sm font-normal text-slate-500">({report.clauses.length} detected)</span>}
          </h2>
          {!report.clauses?.length
            ? <div className="text-center py-10"><p className="text-4xl mb-3">✅</p><p className="text-slate-500">No dangerous clauses detected.</p></div>
            : <div className="space-y-3">
                {[...report.clauses]
                  .sort((a,b)=>{const o={High:0,Critical:0,Medium:1,Low:2};return (o[a.severity]??3)-(o[b.severity]??3);})
                  .map((c,i)=><ClauseCard key={i} clause={c} index={i}/>)}
              </div>
          }
        </div>
      </div>
    </AppLayout>
  );
}
