import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const COLONY_TYPES = ['Type I', 'Type II', 'Type III', 'Bachelor Hostel', 'Transit Camp', 'Guest House', 'Office', 'Other'];
const CATEGORIES = ['Plumbing', 'Leakage', 'Roof Leakage', 'Toilet Repair', 'Sewer Blockage', 'Water Supply', 'Door Repair', 'Window Repair', 'Painting', 'Flooring', 'Masonry', 'Crack in Wall', 'Ceiling Damage', 'Road Repair', 'Drain Repair', 'Retaining Wall', 'Street Furniture', 'Others'];
const PRIORITIES = ['Normal', 'Medium', 'High', 'Emergency'];

export default function RegisterComplaint() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [result, setResult] = useState(null);

  const onSubmit = async (data) => {
    try {
      const { data: res } = await api.post('/complaints', data);

      setResult(res);
      toast.success('Complaint registered successfully');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register complaint');
    }
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          ✓
        </div>
        <h2 className="text-lg font-bold mb-1">Complaint Successfully Registered</h2>
        <p className="text-2xl font-mono font-bold text-brand-600 my-4">{result.complaint.complaintNumber}</p>
        {result.qrCode && <img src={result.qrCode} alt="QR Code" className="mx-auto h-32 w-32 mb-4" />}
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.print()} className="btn-secondary">Print Slip</button>
          <a href={result.qrCode} download={`${result.complaint.complaintNumber}.png`} className="btn-primary">
            Download QR
          </a>
        </div>
        <button onClick={() => setResult(null)} className="text-sm text-brand-600 mt-6 underline">
          Register another complaint
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Register Complaint</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <section>
          <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Complainant Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Name *</label>
              <input className="input-field" {...register('complainantName', { required: true })} />
              {errors.complainantName && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>
            <div>
              <label className="label-text">Employee Number</label>
              <input className="input-field" {...register('employeeNumber')} />
            </div>
            <div>
              <label className="label-text">Department</label>
              <input className="input-field" {...register('department')} />
            </div>
            <div>
              <label className="label-text">Quarter Number *</label>
              <input className="input-field" {...register('quarterNumber', { required: true })} />
              {errors.quarterNumber && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>
            <div>
              <label className="label-text">Phone Number *</label>
              <input className="input-field" {...register('phoneNumber', { required: true })} />
              {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" className="input-field" {...register('email')} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Complaint Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Colony Type *</label>
              <select className="input-field" {...register('colonyType', { required: true })}>
                <option value="">Select...</option>
                {COLONY_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Category *</label>
              <select className="input-field" {...register('category', { required: true })}>
                <option value="">Select...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Priority *</label>
              <select className="input-field" {...register('priority', { required: true })} defaultValue="Normal">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Location</label>
              <input className="input-field" placeholder="e.g. Near Temple" {...register('location')} />
            </div>
          </div>
          <div className="mt-4">
            <label className="label-text">Description *</label>
            <textarea rows={4} className="input-field" {...register('description', { required: true })} />
            {errors.description && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>
        </section>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}
