import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import PageWrap from '../components/PageWrap.jsx'
export default function Home() {
  const [q, setQ] = useState(''); const nav = useNavigate()
  const submit = e => { e.preventDefault(); nav(`/jobs?q=${encodeURIComponent(q)}`) }
  return (
    <div className="bg-gradient-mesh">
      <PageWrap className="!py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="badge bg-white/70 backdrop-blur text-brand-700 border border-brand-100">🚀 Trusted by 10k+ companies</span>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-700 bg-clip-text text-transparent">Find your next opportunity.</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Browse thousands of jobs from top companies. Apply in seconds, manage your career in one place.</p>
          <form onSubmit={submit} className="glass mt-8 mx-auto max-w-2xl flex items-center gap-2 rounded-2xl p-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title, company, location…" className="flex-1 bg-transparent px-3 py-2 outline-none" />
            <button className="btn-primary">Search</button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/jobs" className="btn-ghost">Browse all jobs</Link>
            <Link to="/register" className="btn-primary">Create free account</Link>
          </div>
        </motion.div>
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            { t: 'For Job Seekers', d: 'Discover jobs that fit you, apply with one click, and track every application.' },
            { t: 'For Employers', d: 'Post openings, review applicants, and manage your hiring pipeline.' },
            { t: 'Secure & Modern', d: 'JWT authentication, role-based access, and a delightful UI.' }
          ].map((f,i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*0.1 }} className="card">
              <h3 className="text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-slate-600">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </PageWrap>
    </div>
  )
}
