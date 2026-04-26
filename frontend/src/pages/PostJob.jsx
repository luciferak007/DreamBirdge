import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrap from '../components/PageWrap.jsx'
import { jobsApi } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
export default function PostJob() {
  const nav = useNavigate(); const { user } = useAuth()
  const [form, setForm] = useState({ title: '', company: user?.company || '', location: '', type: 'FULL_TIME', category: '', salaryMin: '', salaryMax: '', description: '', requirements: '' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }))
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await jobsApi.create({ ...form, salaryMin: form.salaryMin ? Number(form.salaryMin) : null, salaryMax: form.salaryMax ? Number(form.salaryMax) : null })
      toast.success('Job posted!'); nav('/manage-jobs')
    } catch (e) { toast.error(e?.response?.data?.error || 'Failed to post') }
    finally { setLoading(false) }
  }
  return (
    <PageWrap>
      <h1 className="text-3xl font-bold">Post a Job</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4 max-w-3xl">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Job title *</label><input required value={form.title} onChange={e=>set('title',e.target.value)} className="input mt-1" /></div>
          <div><label className="text-sm font-medium">Company *</label><input required value={form.company} onChange={e=>set('company',e.target.value)} className="input mt-1" /></div>
          <div><label className="text-sm font-medium">Location *</label><input required value={form.location} onChange={e=>set('location',e.target.value)} className="input mt-1" /></div>
          <div><label className="text-sm font-medium">Type *</label>
            <select value={form.type} onChange={e=>set('type',e.target.value)} className="input mt-1">
              <option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option><option value="REMOTE">Remote</option>
            </select>
          </div>
          <div><label className="text-sm font-medium">Category *</label><input required value={form.category} onChange={e=>set('category',e.target.value)} className="input mt-1" placeholder="Engineering, Design…" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-sm font-medium">Salary min</label><input type="number" value={form.salaryMin} onChange={e=>set('salaryMin',e.target.value)} className="input mt-1" /></div>
            <div><label className="text-sm font-medium">Salary max</label><input type="number" value={form.salaryMax} onChange={e=>set('salaryMax',e.target.value)} className="input mt-1" /></div>
          </div>
        </div>
        <div><label className="text-sm font-medium">Description *</label><textarea required rows={5} value={form.description} onChange={e=>set('description',e.target.value)} className="input mt-1" /></div>
        <div><label className="text-sm font-medium">Requirements</label><textarea rows={4} value={form.requirements} onChange={e=>set('requirements',e.target.value)} className="input mt-1" /></div>
        <div className="flex justify-end gap-2"><button type="button" onClick={()=>nav(-1)} className="btn-ghost">Cancel</button><button disabled={loading} className="btn-primary">{loading ? 'Posting…' : 'Post Job'}</button></div>
      </form>
    </PageWrap>
  )
}
