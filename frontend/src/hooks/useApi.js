import { useEffect, useState, useCallback } from 'react'
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const refetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await fn()) } catch (e) { setError(e?.response?.data?.error || e.message) }
    finally { setLoading(false) }
  }, deps) // eslint-disable-line
  useEffect(() => { refetch() }, [refetch])
  return { data, loading, error, refetch, setData }
}
