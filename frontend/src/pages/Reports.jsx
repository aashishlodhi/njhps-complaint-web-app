import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

export default function Reports() {
  const [filters, setFilters] = useState({ status: '', priority: '', dateFrom: '', dateTo: '' });
  const [downloading, setDownloading] = useState(null);

  const download = async (format) => {
    setDownloading(format);
    try {
      const res = await api.get(`/reports/${format}`, { params: filters, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `njhps-complaints-report.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Reports</h1>
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Date From</label>
            <input type="date" className="input-field" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
          </div>
          <div>
            <label className="label-text">Date To</label>
            <input type="date" className="input-field" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Leave dates blank to include all complaints. Reports respect the same status/priority filters used in
          the complaints list.
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => download('pdf')} disabled={downloading} className="btn-primary">
            {downloading === 'pdf' ? 'Generating...' : 'Export PDF'}
          </button>
          <button onClick={() => download('excel')} disabled={downloading} className="btn-secondary">
            {downloading === 'excel' ? 'Generating...' : 'Export Excel'}
          </button>
          <button onClick={() => download('csv')} disabled={downloading} className="btn-secondary">
            {downloading === 'csv' ? 'Generating...' : 'Export CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
