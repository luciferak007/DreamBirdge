import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrap from '../components/PageWrap.jsx'
import Spinner from '../components/Spinner.jsx'
import { jobsApi, appsApi, uploadsApi } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
export default function JobDetail() {
  const { id } = useParams(); const nav = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [job, setJob] = useState(null); const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false); const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState(''); const [resumeName, setResumeName] = useState('')
  const [uploading, setUploading] = useState(false); const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    (async () => {
      try { setJob(await jobsApi.getPublic(id)) }
      catch (e) { toast.error(e?.response?.data?.error || 'Job not found'); nav('/jobs') }
      finally { setLoading(false) }
    })()
  }, [id, nav])
  const apply = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please sign in to apply'); nav('/login', { state: { from: { pathname: `/jobs/${id}` } } }); return }
    if (user?.role !== 'JOB_SEEKER') { toast.error('Only job seekers can apply'); return }
    setSubmitting(true)
    try {
      await appsApi.apply({ jobId: Number(id), coverLetter, resumeUrl })
      toast.success('Application submitted!')
      setOpen(false); setCoverLetter(''); setResumeUrl(''); setResumeName('')
      nav('/my-applications')
    } catch (e) { toast.error(e?.response?.data?.error || 'Failed to apply') }
    finally { setSubmitting(false) }
  }
  if (loading) return <PageWrap><Spinner label="Loading job" /></PageWrap>
  if (!job) return null
  const salary = job.salaryMin && job.salaryMax ? `$${(job.salaryMin/1000).toFixed(0)}k – $${(job.salaryMax/1000).toFixed(0)}k` : 'Competitive'
  return (
    <PageWrap>
      <Link to="/jobs" className="text-sm text-brand-600 hover:underline">← Back to jobs</Link>
      <div className="mt-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="text-slate-500 mt-1">{job.company} · {job.location}</p>
            </div>
            <span className="badge bg-brand-50 text-brand-700">{job.type.replace('_',' ')}</span>
          </div>
          <div className="mt-6 prose max-w-none">
            <h3 className="text-lg font-semibold">Job Description</h3>
            <p className="text-slate-700 whitespace-pre-line">{job.description}</p>
            {job.requirements && (<>
              <h3 className="text-lg font-semibold mt-6">Requirements</h3>
              <p className="text-slate-700 whitespace-pre-line">{job.requirements}</p>
            </>)}
          </div>
        </div>
        <aside className="card h-fit sticky top-24">
          <p className="text-sm text-slate-500">Salary range</p>
          <p className="text-xl font-semibold">{salary}</p>
          <p className="mt-4 text-sm text-slate-500">Category</p>
          <p className="font-medium">{job.category}</p>
          <button onClick={() => setOpen(true)} className="btn-primary w-full mt-6">Apply Now</button>
          {!isAuthenticated && <p className="mt-3 text-xs text-slate-500 text-center">You'll be asked to sign in.</p>}
        </aside>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <motion.form onSubmit={apply} onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Apply to {job.title}</h2>
            <p className="text-sm text-slate-500">at {job.company}</p>
            <label className="block mt-5 text-sm font-medium">Cover Letter *</label>
            <textarea required value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={6} className="input mt-1" placeholder="Why are you a great fit?" />
            <label className="block mt-4 text-sm font-medium">Resume (PDF/DOC/DOCX, max 5MB)</label>
            <div className="mt-1 flex flex-col gap-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setUploading(true)
                  try {
                    const res = await uploadsApi.resume(f)
                    setResumeUrl(res.url); setResumeName(res.originalName || f.name)
                    toast.success('Resume uploaded')
                  } catch (err) {
                    toast.error(err?.response?.data?.error || 'Upload failed')
                  } finally { setUploading(false) }
                }}
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
              {uploading && <p className="text-xs text-slate-500">Uploading…</p>}
              {resumeUrl && !uploading && (
                <p className="text-xs text-emerald-700">✓ Uploaded: {resumeName || 'resume'}</p>
              )}
              <p className="text-xs text-slate-500">Or paste a link instead:</p>
              <input value={resumeUrl} onChange={e => { setResumeUrl(e.target.value); setResumeName('') }} className="input" placeholder="https://…" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
              <button disabled={submitting || uploading} className="btn-primary">{submitting ? 'Submitting…' : 'Submit Application'}</button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </PageWrap>
  )
}
