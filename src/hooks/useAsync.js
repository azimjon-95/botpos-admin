// src/hooks/useAsync.js — Generic async data hook
import { useState, useEffect, useCallback, useRef } from 'react'

export function useAsync(asyncFn, deps = [], immediate = true) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error,   setError]   = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const run = useCallback(async (...args) => {
    if (!mountedRef.current) return
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn(...args)
      if (mountedRef.current) setData(result)
      return result
    } catch (e) {
      if (mountedRef.current) setError(String(e))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) run()
  }, [run])

  return { data, loading, error, run, setData }
}

// Paginated list hook
export function useList(fetchFn, initialParams = {}) {
  const [items,   setItems]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [params,  setParams]  = useState(initialParams)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const LIMIT = 15

  const load = useCallback(async (overrides = {}) => {
    setLoading(true)
    setError(null)
    try {
      const p = { page, limit: LIMIT, ...params, ...overrides }
      const r = await fetchFn(p)
      setItems(r?.items || r?.shops || r?.data || [])
      setTotal(r?.total ?? 0)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [page, params])

  useEffect(() => { load() }, [load])

  const updateParams = useCallback(updates => {
    setParams(p => ({ ...p, ...updates }))
    setPage(1)
  }, [])

  const pages = Math.ceil(total / LIMIT)

  return {
    items, total, page, pages, loading, error,
    setPage, updateParams, reload: load,
    setItems,
  }
}
