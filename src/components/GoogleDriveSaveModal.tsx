import React, { useState, useEffect } from 'react';
import { PDReportPrintData } from '../utils/pdReportPrinter';
import { generatePdfBlobFromData } from '../services/pdfGeneratorService';
import {
  getStoredGoogleClientId,
  setStoredGoogleClientId,
  getStoredDriveFolderName,
  setStoredDriveFolderName,
  requestGoogleAccessToken,
  getOrCreateDriveFolder,
  uploadPdfToDrive,
  DriveUploadResult
} from '../services/googleDriveService';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Download,
  Settings,
  FolderPlus,
  Key,
  HelpCircle,
  X,
  FileCheck,
  Sparkles,
  Copy,
  Check,
  Camera
} from 'lucide-react';

interface GoogleDriveSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: PDReportPrintData;
}

export const GoogleDriveSaveModal: React.FC<GoogleDriveSaveModalProps> = ({
  isOpen,
  onClose,
  reportData
}) => {
  const [clientId, setClientId] = useState<string>('');
  const [folderName, setFolderName] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<DriveUploadResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cachedPdfBlob, setCachedPdfBlob] = useState<{ blob: Blob; fileName: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setClientId(getStoredGoogleClientId());
      setFolderName(getStoredDriveFolderName());
      setErrorMsg(null);
      setUploadResult(null);
      setProgressPct(0);
      setCurrentStep('');
      setCachedPdfBlob(null);
      // Auto-show settings if client ID is not yet configured
      if (!getStoredGoogleClientId()) {
        setShowSettings(true);
      } else {
        setShowSettings(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    setStoredGoogleClientId(clientId);
    setStoredDriveFolderName(folderName || 'Infominer PD Reports');
    setShowSettings(false);
    setErrorMsg(null);
  };

  const handleDownloadLocalPdf = async () => {
    try {
      let pdfToDownload = cachedPdfBlob;
      if (!pdfToDownload) {
        setIsProcessing(true);
        setCurrentStep('Generating PDF document with photos...');
        setProgressPct(40);
        const result = await generatePdfBlobFromData(reportData, (p) => {
          setCurrentStep(p.step);
          setProgressPct(p.percent);
        });
        pdfToDownload = { blob: result.blob, fileName: result.fileName };
        setCachedPdfBlob(pdfToDownload);
        setIsProcessing(false);
      }

      const url = URL.createObjectURL(pdfToDownload.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfToDownload.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg('Failed to generate local PDF: ' + err.message);
    }
  };

  const handleStartDriveUpload = async () => {
    const activeClientId = clientId.trim() || getStoredGoogleClientId();
    if (!activeClientId) {
      setShowSettings(true);
      setErrorMsg('Please configure your Google OAuth Client ID before connecting.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setUploadResult(null);
    setProgressPct(10);
    setCurrentStep('Compiling PDF report and embedding high-resolution photos...');

    try {
      // Step 1: Generate PDF Blob from HTML Report
      const { blob: pdfBlob, fileName } = await generatePdfBlobFromData(reportData, (p) => {
        setCurrentStep(p.step);
        setProgressPct(Math.min(70, p.percent));
      });
      setCachedPdfBlob({ blob: pdfBlob, fileName });

      // Step 2: Request Google OAuth 2.0 Access Token
      setCurrentStep('Connecting to your Google Account (Please allow popup)...');
      setProgressPct(75);
      const accessToken = await requestGoogleAccessToken(activeClientId);

      // Step 3: Find or Create Google Drive Folder
      setCurrentStep(`Locating or creating Google Drive folder: "${folderName || 'Infominer PD Reports'}"...`);
      setProgressPct(85);
      const targetFolder = await getOrCreateDriveFolder(folderName || 'Infominer PD Reports', accessToken);

      // Step 4: Upload PDF to Google Drive
      setCurrentStep('Uploading complete PDF report directly to your Google Drive...');
      setProgressPct(92);
      const desc = `Infominer PD Report | Applicant: ${reportData.applicantName || 'N/A'} | App No: ${reportData.applicationNumber || 'N/A'} | Bank: ${reportData.clientBankName || 'N/A'}`;
      const result = await uploadPdfToDrive(pdfBlob, fileName, targetFolder.folderId, accessToken, desc);

      setProgressPct(100);
      setCurrentStep('Successfully saved to Google Drive!');
      setUploadResult(result);
    } catch (err: any) {
      console.error('Google Drive Upload error:', err);
      setErrorMsg(err?.message || 'Failed to upload report to Google Drive.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyLink = () => {
    if (uploadResult?.webViewLink) {
      navigator.clipboard.writeText(uploadResult.webViewLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const photoCount = reportData.photos?.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-[#2d3e50] to-[#1e293b] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Cloud className="w-5 h-5 text-[#eb8a23]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                Save Report to Google Drive
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                  PDF & Photos
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {reportData.applicantName} • {reportData.applicationNumber || 'INF PD'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition ${showSettings ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-300'}`}
              title="Google Drive Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Report Summary Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-800">Complete Report Ready</span>
                <p className="text-slate-500 text-[11px]">
                  All Financials, Itemized Waterfall, and Field Observations included
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold text-[11px]">
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'} Embedded</span>
            </div>
          </div>

          {/* Settings Section (Toggleable) */}
          {showSettings && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3.5 text-xs text-slate-700">
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <span className="font-extrabold text-[#2d3e50] flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" /> Google OAuth Configuration
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">Direct Browser OAuth</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Google OAuth Client ID:
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. 1234567890-xyz.apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Obtained from Google Cloud Console &gt; APIs &amp; Services &gt; Credentials (OAuth 2.0 Client ID for Web).
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Google Drive Folder Name:
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Infominer PD Reports"
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  If this folder does not exist in your Google Drive, it will automatically be created for you.
                </p>
              </div>

              <div className="bg-white border border-blue-100 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold flex items-center gap-1 text-blue-700">
                  <HelpCircle className="w-3.5 h-3.5" /> How to get a free Google Client ID:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 text-[10.5px] text-slate-500">
                  <li>Visit <strong>console.cloud.google.com</strong> and create a project.</li>
                  <li>Enable the <strong>Google Drive API</strong>.</li>
                  <li>Under <strong>Credentials</strong>, create an <strong>OAuth 2.0 Client ID (Web application)</strong> with Authorized JavaScript origins: <code className="bg-slate-100 px-1 py-0.5 rounded">{window.location.origin}</code>.</li>
                </ol>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 bg-[#2d3e50] hover:bg-[#1e293b] text-white rounded-lg font-bold text-xs shadow-xs transition"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}

          {/* Progress / Status Display */}
          {isProcessing && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-900 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  {currentStep || 'Processing report...'}
                </span>
                <span className="font-black text-amber-800">{progressPct}%</span>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-linear-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-700">
                Please keep this window open and complete Google sign-in if prompted.
              </p>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Google Drive Operation Alert</span>
                <p className="text-[11px] text-rose-700">{errorMsg}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="underline text-blue-700 font-bold hover:text-blue-900 text-[11px]"
                  >
                    Check Google OAuth Settings
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={handleDownloadLocalPdf}
                    className="underline text-emerald-700 font-bold hover:text-emerald-900 text-[11px]"
                  >
                    Or Download PDF Directly
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Result Card */}
          {uploadResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-900">
                    Report Saved to Google Drive!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Stored in folder <strong>"{uploadResult.folderName}"</strong>
                  </p>
                </div>
              </div>

              <div className="bg-white border border-emerald-100 rounded-lg p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>File Name:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[280px]">
                    {uploadResult.fileName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600">Active on Google Drive</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={uploadResult.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Drive
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 rounded-xl font-bold text-xs transition"
                  title="Copy Google Drive Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadLocalPdf}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition disabled:opacity-50"
            title="Download PDF to computer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Download PDF
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs transition"
            >
              Close
            </button>

            <button
              onClick={handleStartDriveUpload}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-[#eb8a23] to-[#d97917] hover:from-[#d97917] hover:to-[#c0650d] text-white rounded-xl font-extrabold text-xs shadow-md transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Saving to Google Drive...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-white" />
                  {uploadResult ? 'Upload Again / Update' : 'Save to Google Drive'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
