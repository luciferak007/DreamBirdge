import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrap from '../components/PageWrap.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
export default function Register() {
  const { register } = useAuth(); const nav = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'JOB_SEEKER', company: '' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }))
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await register(form); toast.success('Account created!'); nav('/dashboard', { replace: true })
    } catch (e) { toast.error(e?.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="bg-gradient-mesh min-h-[calc(100vh-4rem)]">
      <PageWrap className="!py-16">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass mx-auto max-w-md rounded-3xl p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-slate-500 mt-1">Start your journey in seconds.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><label className="text-sm font-medium">Full name</label><input required value={form.fullName} onChange={e => set('fullName', e.target.value)} className="input mt-1" /></div>
            <div><label className="text-sm font-medium">Email</label><input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input mt-1" /></div>
            <div><label className="text-sm font-medium">Password</label><input required type="password" minLength={6} value={form.password} onChange={e => set('password', e.target.value)} className="input mt-1" /></div>
            <div><label className="text-sm font-medium">I am a…</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className="input mt-1">
                <option value="JOB_SEEKER">Job Seeker</option>
                <option value="EMPLOYER">Employer</option>
              </select>
            </div>
            {form.role === 'EMPLOYER' && (
              <div><label className="text-sm font-medium">Company</label><input value={form.company} onChange={e => set('company', e.target.value)} className="input mt-1" /></div>
            )}
            <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating…' : 'Create account'}</button>
          </form>
          <p className="mt-4 text-sm text-slate-600 text-center">Already have an account? <Link to="/login" className="text-brand-600 font-medium">Sign in</Link></p>
        </motion.div>
      </PageWrap>
    </div>
  )
}
