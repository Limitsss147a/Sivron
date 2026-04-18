'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldLabel, FieldMessage } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Shield, Fingerprint, Lock, User, Mail, Briefcase, Building2 } from 'lucide-react'
import type { Institution } from '@/lib/types/database'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [institutionId, setInstitutionId] = useState('')
  const [position, setPosition] = useState('')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchInstitutions() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching institutions:', error)
      } else if (data) {
        setInstitutions(data)
      }
      setIsLoadingInstitutions(false)
    }
    fetchInstitutions()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Password tidak cocok')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      setIsLoading(false)
      return
    }

    if (!institutionId) {
      setError('Silakan pilih instansi')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            institution_id: institutionId,
            position: position,
            role: 'user',
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mendaftar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0A0A0F] lg:bg-transparent">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0A0A0F] text-white overflow-hidden relative fixed bottom-0 top-0 left-0">
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
              <div className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-white">SYSTEM REGISTRATION</div>
              <div className="font-sans text-sm text-white/50 italic mt-1">"Bergabung untuk kelola anggaran digital secara transparan."</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
           <div className="font-mono text-xs tracking-widest text-sky-500">— SIVRON SISTEM VERIFIKASI RKA ONLINE</div>
        </div>
      </div>

      {/* Right Panel - Form (Diamond Pattern) */}
      <div className="flex w-full lg:w-1/2 lg:ml-[50%] items-center justify-center p-6 sm:p-12 diamond-pattern bg-white min-h-screen">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 my-8">
          
          <div className="mb-10 lg:hidden">
             <h1 className="font-heading text-4xl font-bold tracking-tighter">
              SIVRON<span className="text-sky-500">.</span>
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">DAFTAR</h2>
            <div className="w-12 h-1.5 bg-sky-500 rounded-full"></div>
            <p className="mt-4 text-sm text-gray-500">Lengkapi data untuk membuat akun SIVRON</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <Field>
              <FieldLabel htmlFor="fullName" className="font-mono text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-1 block">Nama Lengkap</FieldLabel>
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus-visible:ring-sky-500 focus-visible:border-sky-500 text-sm"
                  disabled={isLoading}
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="email" className="font-mono text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-1 block">Email</FieldLabel>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@instansi.go.id"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus-visible:ring-sky-500 focus-visible:border-sky-500 text-sm"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="institution" className="font-mono text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-1 block">Instansi</FieldLabel>
              <Select value={institutionId} onValueChange={setInstitutionId} disabled={isLoading || isLoadingInstitutions}>
                <SelectTrigger id="institution" className="w-full h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-sky-500 focus:border-sky-500">
                  <Building2 className="ml-1 mr-1.5 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder={isLoadingInstitutions ? "Memuat..." : "Pilih instansi"} />
                </SelectTrigger>
                <SelectContent>
                  {institutions.length === 0 && !isLoadingInstitutions ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      Tidak ada instansi ditemukan.
                    </div>
                  ) : (
                    institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name} ({inst.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="position" className="font-mono text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-1 block">Jabatan</FieldLabel>
              <div className="relative">
                <Input
                  id="position"
                  type="text"
                  placeholder="Contoh: Kepala Bagian"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="pl-10 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus-visible:ring-sky-500 focus-visible:border-sky-500 text-sm"
                  disabled={isLoading}
                />
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="password" className="font-mono text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-1 block">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 char"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus-visible:ring-sky-500 focus-visible:border-sky-500 text-sm"
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="repeatPassword" className="font-mono text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-1 block">Ulangi Sandi</FieldLabel>
                <div className="relative">
                  <Input
                    id="repeatPassword"
                    type="password"
                    placeholder="Ulangi sandi"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="pl-9 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus-visible:ring-sky-500 focus-visible:border-sky-500 text-sm"
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </Field>
            </div>

            {error && (
              <FieldMessage className="text-sky-600 bg-sky-50 p-3 rounded-lg border border-sky-100 text-sm mt-4">
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
                "DAFTAR SEKARANG"
              )}
            </Button>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500">Sudah punya akun? </span>
              <Link
                href="/auth/login"
                className="font-medium text-sm text-sky-600 hover:text-sky-700 transition-colors"
               >
                Masuk disini
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
