import { useState } from 'react';
import { STATUSES } from '../constants';

const toForm = (app) => ({
  company: app?.company || '',
  role: app?.role || '',
  status: app?.status || 'Wishlist',
  appliedDate: app?.appliedDate ? app.appliedDate.slice(0, 10) : '',
  link: app?.link || '',
  notes: app?.notes || '',
});

export default function ApplicationForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(toForm(initial));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const payload = { ...form };
    if (!payload.appliedDate) delete payload.appliedDate; // empty string would fail date casting
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save application');
      setSubmitting(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit application' : 'Add application'}</h2>
      {error && <p className="error">{error}</p>}
      <input name="company" placeholder="Company" value={form.company} onChange={handleChange} required />
      <input name="role" placeholder="Role" value={form.role} onChange={handleChange} required />
      <select name="status" value={form.status} onChange={handleChange}>
        {STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <input name="appliedDate" type="date" value={form.appliedDate} onChange={handleChange} />
      <input name="link" type="url" placeholder="Job link (https://...)" value={form.link} onChange={handleChange} />
      <textarea name="notes" placeholder="Notes" rows={3} value={form.notes} onChange={handleChange} />
      <div className="row">
        <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
        <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}