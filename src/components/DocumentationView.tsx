import React, { useState } from 'react';
import { SRS_DOCUMENTS } from '../data/srsDocsData';
import { BookOpen, Code, Database, Server, ShieldCheck, FileText, Download } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState(SRS_DOCUMENTS[0].id);

  const selectedDoc = SRS_DOCUMENTS.find(d => d.id === selectedDocId) || SRS_DOCUMENTS[0];

  const handleDownloadDoc = () => {
    const blob = new Blob([selectedDoc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2d3e50] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#eb8a23]" />
            Software Requirement Specification & Architecture Documentation
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Enterprise deliverables including SRS, High-Level Architecture, Low-Level Design, Normalized Database Schemas, API Specs, Test Strategy, and Manuals.
          </p>
        </div>

        <button
          onClick={handleDownloadDoc}
          className="flex items-center gap-2 px-4 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white font-semibold text-xs rounded-md shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          Export Selected Spec (.md)
        </button>
      </div>

      {/* Grid: Left Navigation List, Right Document Content Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-sm">
          {SRS_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                selectedDocId === doc.id
                  ? 'bg-[#eb8a23]/10 text-[#2d3e50] border border-[#eb8a23]/40 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{doc.title}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">{selectedDoc.title}</h3>
            <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-mono font-semibold uppercase">
              {selectedDoc.category}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {selectedDoc.content}
          </div>
        </div>
      </div>
    </div>
  );
};
