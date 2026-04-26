import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageWrap from '../components/PageWrap.jsx'
import Spinner from '../components/Spinner.jsx'
import { appsApi, resolveUploadUrl } from '../services/api'
import toast from 'react-hot-toast'
const STATUSES = ['PENDING','REVIEWED','ACCEPTED','REJECTED']
export default function JobApplicants() {
  const { id } = useParams()
  const [apps, setApps] = useState([]); const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true)
    try { setApps(await appsApi.forJob(id)) } catch (e) { toast.error(e?.response?.data?.error || 'Failed') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [id])
  const change = async (appId, status) => {
    try { const updated = await appsApi.setStatus(appId, status); setApps(arr => arr.map(a => a.id === appId ? updated : a)); toast.success('Updated') }
    catch (e) { toast.error(e?.response?.data?.error || 'Failed') }
  }
  return (
    <PageWrap>
      <Link to="/manage-jobs" className="text-sm text-brand-600 hover:underline">← Manage jobs</Link>
      <h1 className="text-3xl font-bold mt-2">Applicants</h1>
      {loading ? <div className="mt-8"><Spinner /></div> :
        apps.length === 0 ? <div className="card mt-6 text-center text-slate-500">No applicants yet.</div> :
        <div className="mt-6 space-y-3">
          {apps.map(a => (
            <div key={a.id} className="card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{a.applicantName}</p>
                  <p className="text-sm text-slate-500">{a.applicantEmail} · Applied {new Date(a.appliedAt).toLocaleDateString()}</p>
                  {a.resumeUrl && <a href={resolveUploadUrl(a.resumeUrl)} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">📄 View resume</a>}
                </div>
                <select value={a.status} onChange={e => change(a.id, e.target.value)} className="input md:w-44">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p className="mt-3 text-slate-700 whitespace-pre-line border-t border-slate-100 pt-3">{a.coverLetter}</p>
            </div>
          ))}
        </div>}
    </PageWrap>
  )
}
