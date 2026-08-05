import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'

const AccountContext = createContext(undefined)

export function AccountProvider({ children }) {
  const { user } = useAuth()
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!user) {
      setMembership(null)
      setLoading(false)
      return Promise.resolve()
    }

    setLoading(true)
    return supabase
      .from('account_members')
      .select('account_id, role, accounts(name, created_at)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data }) => {
        setMembership(data)
        setLoading(false)
      })
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = {
    loading,
    accountId: membership?.account_id ?? null,
    accountName: membership?.accounts?.name ?? null,
    accountCreatedAt: membership?.accounts?.created_at ?? null,
    role: membership?.role ?? null,
    isAdmin: membership?.role === 'admin',
    refresh,
  }

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}
