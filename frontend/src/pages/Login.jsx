import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrap from '../components/PageWrap.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
export default function Login() {
  const { login } = useAuth(); const nav = useNavigate(); const loc = useLocation()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      const to = loc.state?.from?.pathname || '/dashboard'
      nav(to, { replace: true })
    } catch (e) { toast.error(e?.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="bg-gradient-mesh min-h-[calc(100vh-4rem)]">
      <PageWrap className="!py-20">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass mx-auto max-w-md rounded-3xl p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to continue.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><label className="text-sm font-medium">Email</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="input mt-1" /></div>
            <div><label className="text-sm font-medium">Password</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="input mt-1" /></div>
            <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <p className="mt-4 text-sm text-slate-600 text-center">No account? <Link to="/register" className="text-brand-600 font-medium">Create one</Link></p>
        </motion.div>
      </PageWrap>
    </div>
  )
}
