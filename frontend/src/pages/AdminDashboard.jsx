import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { adminApi } from '../services/api'
import Spinner from '../components/Spinner.jsx'

/**
 * Admin Dashboard
 * ---------------
 * Single page with tabs: Overview · Users · Jobs · Applications · Audit Trail.
 *
 * Date formatting: change `formatDate` below if you need a different timezone or format.
 * Backend timestamps come from JPA Instant fields (UTC). Adjust the audit query
 * window in backend/src/main/java/com/jobportal/controller/AdminController.java.
 */

const TABS = ['Overview', 'Users', 'Jobs', 'Applications', 'Audit Trail']

const formatDate = (iso) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return String(iso) }
}

function StatCard({ label, value, accent = 'from-indigo-500 to-blue-500' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100"
    >
      <div className={`text-xs font-semibold uppercase tracking-wider bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value ?? '—'}</div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [apps, setApps] = useState([])
  const [audit, setAudit] = useState({ content: [], totalElements: 0 })
  const [auditFilter, setAuditFilter] = useState({ entity: '', actor: '' })
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const [s, u, j, a, au] = await Promise.all([
        adminApi.stats(), adminApi.users(), adminApi.jobs(),
        adminApi.applications(), adminApi.audit({ size: 100 })
      ])
      setStats(s); setUsers(u); setJobs(j); setApps(a); setAudit(au)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load admin data')
    } finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  const reloadAudit = async () => {
    const params = { size: 100 }
    if (auditFilter.entity) params.entity = auditFilter.entity
    if (auditFilter.actor)  params.actor  = auditFilter.actor
    try { setAudit(await adminApi.audit(params)) }
    catch { toast.error('Failed to load audit log') }
  }

  const onChangeRole = async (id, role) => {
    try { await adminApi.changeRole(id, role); toast.success('Role updated'); refresh() }
    catch (e) { toast.error(e.response?.data?.message || 'Cannot change role') }
  }
  const onDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try { await adminApi.deleteUser(id); toast.success('User deleted'); refresh() }
    catch (e) { toast.error(e.response?.data?.message || 'Cannot delete user') }
  }
  const onToggleJob = async (id, active) => {
    try { await adminApi.toggleJob(id, !active); toast.success('Job updated'); refresh() }
    catch { toast.error('Cannot update job') }
  }
  const onDeleteJob = async (id) => {
    if (!confirm('Delete this job?')) return
    try { await adminApi.deleteJob(id); toast.success('Job deleted'); refresh() }
    catch { toast.error('Cannot delete job') }
  }
  const onDeleteApp = async (id) => {
    if (!confirm('Delete this application?')) return
    try { await adminApi.deleteApp(id); toast.success('Application deleted'); refresh() }
    catch { toast.error('Cannot delete application') }
  }

  if (loading && !stats) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner /></div>

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl px-4 py-10"
    >
      {/* Header with AK branding */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 grid place-items-center text-white font-extrabold shadow-md">AK</div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-slate-500">Full system oversight · users, jobs, applications & audit trail</p>
        </div>
        <button onClick={refresh} className="ml-auto btn-ghost text-sm">↻ Refresh</button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>{t}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'Overview' && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users"         value={stats?.totalUsers}        accent="from-indigo-500 to-blue-500" />
          <StatCard label="Job Seekers"         value={stats?.totalJobSeekers}   accent="from-emerald-500 to-teal-500" />
          <StatCard label="Employers"           value={stats?.totalEmployers}    accent="from-amber-500 to-orange-500" />
          <StatCard label="Total Jobs"          value={stats?.totalJobs}         accent="from-pink-500 to-rose-500" />
          <StatCard label="Active Jobs"         value={stats?.activeJobs}        accent="from-fuchsia-500 to-purple-500" />
          <StatCard label="Applications"        value={stats?.totalApplications} accent="from-sky-500 to-cyan-500" />
          <StatCard label="Audit Entries"       value={stats?.totalAuditEntries} accent="from-slate-700 to-slate-900" />
          <StatCard label="System"              value="Healthy"                  accent="from-green-500 to-emerald-600" />
        </div>
      )}

      {/* USERS */}
      {tab === 'Users' && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Created</th><th className="p-3">Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3">
                    {u.role === 'ADMIN' ? (
                      <span className="badge bg-indigo-100 text-indigo-700">ADMIN</span>
                    ) : (
                      <select className="input py-1" value={u.role} onChange={e => onChangeRole(u.id, e.target.value)}>
                        <option value="JOB_SEEKER">JOB_SEEKER</option>
                        <option value="EMPLOYER">EMPLOYER</option>
                      </select>
                    )}
                  </td>
                  <td className="p-3 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="p-3">
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => onDeleteUser(u.id)} className="text-rose-600 hover:underline text-sm">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JOBS */}
      {tab === 'Jobs' && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="p-3">ID</th><th className="p-3">Title</th><th className="p-3">Company</th><th className="p-3">Location</th><th className="p-3">Posted</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className="border-t border-slate-100">
                  <td className="p-3">{j.id}</td>
                  <td className="p-3 font-medium">{j.title}</td>
                  <td className="p-3">{j.company}</td>
                  <td className="p-3 text-slate-600">{j.location}</td>
                  <td className="p-3 text-slate-500">{formatDate(j.postedAt)}</td>
                  <td className="p-3">
                    <span className={`badge ${j.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {j.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => onToggleJob(j.id, j.active)} className="text-indigo-600 hover:underline text-sm">
                      {j.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => onDeleteJob(j.id)} className="text-rose-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPLICATIONS */}
      {tab === 'Applications' && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="p-3">ID</th><th className="p-3">Job</th><th className="p-3">Applicant</th><th className="p-3">Status</th><th className="p-3">Applied</th><th className="p-3">Actions</th></tr>
            </thead>
            <tbody>
              {apps.map(a => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="p-3">{a.id}</td>
                  <td className="p-3 font-medium">#{a.jobId} · {a.jobTitle}</td>
                  <td className="p-3"><div>{a.applicantName}</div><div className="text-xs text-slate-500">{a.applicantEmail}</div></td>
                  <td className="p-3"><span className="badge bg-amber-100 text-amber-700">{a.status}</span></td>
                  <td className="p-3 text-slate-500">{formatDate(a.appliedAt)}</td>
                  <td className="p-3"><button onClick={() => onDeleteApp(a.id)} className="text-rose-600 hover:underline text-sm">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AUDIT TRAIL — read-tracking surface */}
      {tab === 'Audit Trail' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Entity</label>
              <select className="input" value={auditFilter.entity}
                onChange={e => setAuditFilter(f => ({ ...f, entity: e.target.value }))}>
                <option value="">All</option>
                <option>User</option><option>Job</option><option>Application</option>
                <option>Auth</option><option>Seed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Actor email</label>
              <input className="input" value={auditFilter.actor}
                onChange={e => setAuditFilter(f => ({ ...f, actor: e.target.value }))}
                placeholder="contains…" />
            </div>
            <button onClick={reloadAudit} className="btn-primary text-sm">Apply</button>
            <span className="ml-auto text-sm text-slate-500">Total entries: {audit.totalElements ?? audit.content?.length}</span>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-100">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">When</th><th className="p-3">Action</th><th className="p-3">Entity</th>
                  <th className="p-3">Target ID</th><th className="p-3">Actor</th><th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {(audit.content || []).map(row => (
                  <tr key={row.id} className="border-t border-slate-100 align-top">
                    <td className="p-3 text-slate-500 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="p-3">
                      <span className={`badge ${
                        row.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                        row.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                        row.action === 'DELETE' ? 'bg-rose-100 text-rose-700' :
                        row.action === 'STATUS_CHANGE' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>{row.action}</span>
                    </td>
                    <td className="p-3 font-medium">{row.entityType}</td>
                    <td className="p-3">{row.entityId ?? '—'}</td>
                    <td className="p-3"><div>{row.actorEmail}</div><div className="text-xs text-slate-500">{row.actorRole}</div></td>
                    <td className="p-3 text-slate-700">{row.details}</td>
                  </tr>
                ))}
                {(!audit.content || audit.content.length === 0) && (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">No audit entries match the filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.section>
  )
}
