import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
export default function JobCard({ job }) {
 const salary =
    job.salaryMin && job.salaryMax
      ? `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L`
      : 'Competitive'
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }} className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.company} · {job.location}</p>
        </div>
        <span className="badge bg-brand-50 text-brand-700">{job.type.replace('_',' ')}</span>
      </div>
      <p className="text-sm text-slate-600 line-clamp-2">{job.description}</p>
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-sm font-medium text-slate-700">{salary}</span>
        <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">View details →</Link>
      </div>
    </motion.div>
  )
}
