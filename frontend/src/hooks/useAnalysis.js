import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { analyzeText, analyzeFile, analyzeUrl } from '../services/analysisService';

const useAnalysis = () => {
  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState(null);
  const [error,          setError]          = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const reset = useCallback(() => {
    setResult(null); setError(null); setUploadProgress(0);
  }, []);

  const run = useCallback(async ({ mode, text, file, url }) => {
    setLoading(true); setError(null); setResult(null); setUploadProgress(0);
    try {
      let report;
      if (mode === 'text')      report = await analyzeText(text);
      else if (mode === 'file') report = await analyzeFile(file, setUploadProgress);
      else if (mode === 'url')  report = await analyzeUrl(url);
      else throw new Error('Invalid mode');

      setResult(report);
      toast.success('Analysis complete!');
      return report;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Analysis failed.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, result, error, uploadProgress, run, reset };
};

export default useAnalysis;
