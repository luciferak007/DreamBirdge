import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrap from '../components/PageWrap.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const isSeeker = user?.role === 'JOB_SEEKER'
  const isAdmin = user?.role === 'ADMIN'

  const tiles = isAdmin ? [
    { to: '/admin', t: 'Admin Control Panel', d: 'Full system oversight, users, jobs & audit log.' },
    { to: '/jobs',  t: 'Browse Jobs',          d: 'Public jobs feed (read-only view).' },
  ] : isSeeker ? [
    { to: '/jobs',            t: 'Browse Jobs',     d: 'Discover roles tailored for you.' },
    { to: '/my-applications', t: 'My Applications', d: 'Track every application status.' },
  ] : [
    { to: '/post-job',    t: 'Post a Job',   d: 'Reach thousands of candidates.' },
    { to: '/manage-jobs', t: 'Manage Jobs',  d: 'Edit listings and review applicants.' },
  ]

  return (
    <PageWrap>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 grid place-items-center text-white font-extrabold shadow-md">AK</div>
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.fullName} 👋</h1>
          <p className="text-slate-500 mt-1">
            Role: <span className="font-medium">{user?.role?.replace('_',' ')}</span>
            {isAdmin && <span className="ml-2 badge bg-indigo-100 text-indigo-700">Full Access</span>}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5 mt-8">
        {tiles.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={t.to} className="card block hover:border-brand-200">
              <h3 className="text-lg font-semibold">{t.t}</h3>
              <p className="mt-1 text-slate-600">{t.d}</p>
              <span className="mt-3 inline-block text-brand-600 font-medium">Open →</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageWrap>
  )
}
