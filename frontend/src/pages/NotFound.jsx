import { Link } from 'react-router-dom'
import PageWrap from '../components/PageWrap.jsx'
export default function NotFound() {
  return (
    <PageWrap className="text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-slate-500 mt-2">Page not found.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Go home</Link>
    </PageWrap>
  )
}
