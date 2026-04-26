import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const nav = useNavigate()
  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* AK brand badge — design branding required by spec, sits next to product title */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 grid place-items-center text-white font-extrabold tracking-tight shadow-md"
            aria-label="D_B brand"
            title="D_B"
          >
            D_B
          </motion.div>
          <span className="text-lg font-bold tracking-tight">DreamBridge</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {/* Employer Specific Nav */}
          {isAuthenticated && user?.role === 'EMPLOYER' && (
            <>
              <NavLink to="/" end className={linkCls}>Home</NavLink>
              <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
              <NavLink to="/manage-jobs" className={linkCls}>Manage Jobs</NavLink>
              <NavLink to="/post-job" className={linkCls}>Post Job</NavLink>
            </>
          )}

          {/* Job Seeker Specific Nav */}
          {isAuthenticated && user?.role === 'JOB_SEEKER' && (
            <>
              <NavLink to="/" end className={linkCls}>Home</NavLink>
              <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
              <NavLink to="/my-applications" className={linkCls}>My Applications</NavLink>
            </>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-700 hover:bg-indigo-50'}`
            }>Admin Panel</NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline text-sm text-slate-600">
                Hi, {user?.fullName?.split(' ')[0]}
                {user?.role === 'ADMIN' && <span className="ml-2 badge bg-indigo-100 text-indigo-700">ADMIN</span>}
              </span>
              <button onClick={() => { logout(); nav('/') }} className="btn-ghost text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
