import React from 'react';
import { SectionSchema } from '../data/clientFieldSchemas';

interface DynamicFormRendererProps {
  section: SectionSchema;
  formData: any;
  onChange: (fieldId: string, value: any) => void;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({ section, formData, onChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <h3 className="text-lg font-semibold text-slate-800">{section.title}</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {section.fields.map((field) => {
            const value = formData[field.id] || '';
            const gridClass = field.gridSpan 
              ? `md:col-span-${field.gridSpan}` 
              : 'md:col-span-2';

            return (
              <div key={field.id} className={gridClass}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    value={value}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                    rows={3}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  />
                ) : field.type === 'select' && field.options ? (
                  <select
                    value={value}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Select an option...</option>
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'boolean' ? (
                   <label className="flex items-center space-x-3 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value === true || value === 'Yes'}
                      onChange={(e) => onChange(field.id, e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Yes</span>
                  </label>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => onChange(field.id, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
