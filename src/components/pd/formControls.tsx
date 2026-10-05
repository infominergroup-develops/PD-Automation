import React from 'react';

export const SUB_LABEL = 'block text-[10px] uppercase font-bold text-slate-500 mb-1';

/** Standard form field: a wrapper div with the label stacked above its control(s). */
export const Field: React.FC<{
  label: string;
  labelClassName?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, labelClassName = 'block text-xs font-bold text-slate-700 mb-1', className, children }) => (
  <div className={className}>
    <label className={labelClassName}>{label}</label>
    {children}
  </div>
);

/** Set one field on one row of a list held in state, without mutating the existing row. */
export function updateListItem<L extends object[], K extends keyof L[number]>(
  list: L,
  setList: (next: L) => void,
  index: number,
  field: K,
  value: L[number][K],
) {
  setList(list.map((row, i) => (i === index ? { ...row, [field]: value } : row)) as L);
}

/** Remove one row from a list held in state. */
export function removeListItem<L extends unknown[]>(list: L, setList: (next: L) => void, index: number) {
  setList(list.filter((_, i) => i !== index) as L);
}
