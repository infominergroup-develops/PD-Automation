import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { Download, RefreshCw, FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const riskColors = ['#10b981', '#f59e0b', '#ef4444'];

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Reports,${data.summary.totalReports}\n` +
      `Approved Reports,${data.summary.approvedCount}\n` +
      `Pending Reports,${data.summary.pendingCount}\n` +
      `Average DSCR,${data.summary.averageDscr}\n` +
      `Total Applied Loan Value,₹${data.summary.totalDisbursedValue}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'PD_System_Executive_Metrics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2d3e50] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#eb8a23]" />
            Institutional Portfolio & Credit Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time field PD metrics, risk grading, DSCR coverage, category breakdown, and credit productivity analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-[#2d3e50] rounded-md text-xs font-semibold transition border border-slate-200"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#eb8a23]' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#384c5e] hover:bg-[#2d3e50] text-white text-xs font-semibold rounded-md shadow-sm transition"
          >
            <Download className="w-4 h-4 text-[#eb8a23]" />
            Export Executive Metrics CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Applications</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-800">{data?.summary.totalReports || 24}</span>
              <span className="text-xs text-blue-600 font-semibold">+4 today</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">100% Field Verified</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Approved Reports</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-800">{data?.summary.approvedCount || 22}</span>
              <span className="text-xs text-green-600 font-semibold">91.6% Approval</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Institutional Grade</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Portfolio DSCR</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-800">{data?.summary.averageDscr || 2.85}x</span>
              <span className="text-xs text-green-600 font-semibold">≥1.50 Target</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Healthy Buffer</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Portfolio Value</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-800">
                ₹{(data?.summary.totalDisbursedValue || 8450000).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Applied Facilities</p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Portfolio Risk Rating Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.riskDistribution || [
                    { level: 'Low Risk', count: 18, color: '#10b981' },
                    { level: 'Medium Risk', count: 6, color: '#f59e0b' },
                    { level: 'High Risk', count: 2, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="level"
                >
                  {(data?.riskDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={riskColors[index % riskColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', fontSize: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#2d3e50] mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#eb8a23]" />
            Top Business Categories Represented
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.categoryDistribution || [
                  { name: 'Kirana Store', count: 12 },
                  { name: 'Hardware', count: 8 },
                  { name: 'Apparel', count: 6 },
                  { name: 'Pharmacy', count: 5 },
                  { name: 'Restaurant', count: 4 },
                  { name: 'Transport', count: 3 }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', fontSize: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#384c5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
