'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldLabel, FieldMessage } from '@/components/ui/field'
import { Shield, Fingerprint, Lock, User, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push(redirectTo)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0A0A0F] lg:bg-transparent">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0A0A0F] text-white overflow-hidden relative">
        <div className="fixed inset-y-0 left-0 w-1/2 pointer-events-none neon-border opacity-50 z-0" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-sky-500 font-bold">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="font-heading font-bold text-lg tracking-widest">PORTAL FISKAL</div>
          </div>
        </div>

        <div className="relative z-10 mt-auto mb-32">
          <h1 className="font-heading text-6xl xl:text-7xl font-bold tracking-tighter mb-4 text-glow">
            SIVRON<span className="text-sky-500">.</span>
          </h1>
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-500">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-white">AUTHENTICATED ACCESS</div>
              <div className="font-sans text-sm text-white/50 italic mt-1">"Sistem terenkripsi untuk akuntabilitas anggaran."</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
           <div className="font-mono text-xs tracking-widest text-sky-500">— SIVRON FISCAL COMMAND CENTER</div>
        </div>
      </div>

      {/* Right Panel - Form (Diamond Pattern) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 diamond-pattern bg-white">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          
          <div className="mb-10 lg:hidden">
             <h1 className="font-heading text-4xl font-bold tracking-tighter">
              SIVRON<span className="text-sky-500">.</span>
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">LOGIN</h2>
            <div className="w-12 h-1.5 bg-sky-500 rounded-full"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Field>
              <FieldLabel htmlFor="email" className="font-mono text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2 block">
                KREDENSIAL PENGGUNA
              </FieldLabel>
              <div className="relative">
                <Input
                  id="email"
                  type="text"
                  placeholder="Email / Username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-14 bg-gray-50/50 border-gray-200 rounded-xl focus-visible:ring-sky-500 focus-visible:border-sky-500 transition-all text-base"
                  disabled={isLoading}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="font-mono text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2 block">
                KATA SANDI
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-14 bg-gray-50/50 border-gray-200 rounded-xl focus-visible:ring-sky-500 focus-visible:border-sky-500 transition-all text-base"
                  disabled={isLoading}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </Field>

            {/* Faux reCAPTCHA for visual matching */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl mt-6">
               <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"></div>
                  <span className="text-sm font-medium text-gray-700">I'm not a robot</span>
               </div>
               <div className="flex flex-col items-center">
                  <RefreshCw className="w-6 h-6 text-blue-500 mb-1" />
                  <span className="text-[8px] text-gray-500">reCAPTCHA</span>
               </div>
            </div>

            {error && (
              <FieldMessage className="text-sky-600 bg-sky-50 p-3 rounded-lg border border-sky-100 text-sm">
                {error}
              </FieldMessage>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold tracking-widest uppercase text-sm mt-8 transition-transform hover:scale-[1.02]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  MEMPROSES...
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  BUKA AKSES <Lock className="w-4 h-4 ml-1" />
                </div>
              )}
            </Button>
            
            <div className="mt-8 text-center">
              <Link
                href="/auth/sign-up"
                className="font-medium text-sm text-gray-500 hover:text-sky-600 transition-colors"
               >
                Belum punya akses? Daftar disini
              </Link>
            </div>
            
            <div className="text-center mt-12">
               <p className="font-mono text-[10px] text-gray-400 tracking-[0.2em] uppercase font-semibold">
                 SIVRON FISCAL PORTAL
               </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <Spinner className="h-8 w-8 text-sky-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
