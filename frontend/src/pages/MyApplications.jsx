import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageWrap from '../components/PageWrap.jsx'
import Spinner from '../components/Spinner.jsx'
import { appsApi, resolveUploadUrl } from '../services/api'
import toast from 'react-hot-toast'
const statusColor = { PENDING: 'bg-amber-50 text-amber-700', REVIEWED: 'bg-blue-50 text-blue-700', ACCEPTED: 'bg-emerald-50 text-emerald-700', REJECTED: 'bg-rose-50 text-rose-700' }
export default function MyApplications() {
  const [apps, setApps] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => {
    try { setApps(await appsApi.mine()) } catch (e) { toast.error(e?.response?.data?.error || 'Failed to load') } finally { setLoading(false) }
  })() }, [])
  return (
    <PageWrap>
      <h1 className="text-3xl font-bold">My Applications</h1>
      <p className="text-slate-500 mt-1">{loading ? 'Loading…' : `${apps.length} application(s)`}</p>
      {loading ? <div className="mt-8"><Spinner /></div> :
        apps.length === 0 ? (
          <div className="card mt-8 text-center">
            <p className="text-slate-600">You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="btn-primary mt-4 inline-flex">Browse Jobs</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {apps.map(a => (
              <div key={a.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <Link to={`/jobs/${a.jobId}`} className="font-semibold text-lg hover:text-brand-600">{a.jobTitle}</Link>
                  <p className="text-sm text-slate-500">{a.company} · Applied {new Date(a.appliedAt).toLocaleDateString()}</p>
                  {a.resumeUrl && (
                    <a href={resolveUploadUrl(a.resumeUrl)} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">📄 View resume</a>
                  )}
                </div>
                <span className={`badge ${statusColor[a.status] || 'bg-slate-100 text-slate-700'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
    </PageWrap>
  )
}
