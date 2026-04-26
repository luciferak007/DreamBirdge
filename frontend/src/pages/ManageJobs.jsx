import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageWrap from '../components/PageWrap.jsx'
import Spinner from '../components/Spinner.jsx'
import { jobsApi } from '../services/api'
import toast from 'react-hot-toast'
export default function ManageJobs() {
  const [jobs, setJobs] = useState([]); const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true)
    try { setJobs(await jobsApi.mine()) } catch (e) { toast.error(e?.response?.data?.error || 'Failed') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const remove = async (id) => {
    if (!confirm('Delete this job?')) return
    try { await jobsApi.remove(id); toast.success('Deleted'); load() } catch (e) { toast.error(e?.response?.data?.error || 'Failed') }
  }
  return (
    <PageWrap>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <Link to="/post-job" className="btn-primary">+ Post Job</Link>
      </div>
      {loading ? <div className="mt-8"><Spinner /></div> :
        jobs.length === 0 ? <div className="card mt-6 text-center text-slate-500">No jobs posted yet.</div> :
        <div className="mt-6 space-y-3">
          {jobs.map(j => (
            <div key={j.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <Link to={`/jobs/${j.id}`} className="font-semibold text-lg hover:text-brand-600">{j.title}</Link>
                <p className="text-sm text-slate-500">{j.company} · {j.location} · {j.type.replace('_',' ')}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/manage-jobs/${j.id}/applicants`} className="btn-ghost">View Applicants</Link>
                <button onClick={() => remove(j.id)} className="btn-ghost text-rose-600 hover:bg-rose-50">Delete</button>
              </div>
            </div>
          ))}
        </div>}
    </PageWrap>
  )
}
