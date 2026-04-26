import { motion } from 'framer-motion'
export default function Spinner({ label }) {
  return (
    <div className="flex items-center gap-3 text-slate-500">
      <motion.span className="block h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent"
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
      {label && <span>{label}</span>}
    </div>
  )
}
