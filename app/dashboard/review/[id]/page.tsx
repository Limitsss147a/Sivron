'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { formatDateTime, formatDate } from '@/lib/format'
import { statusConfig, type Budget, type Revision, type BudgetStatus } from '@/lib/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, ArrowRightLeft, MessageSquare, FileText, Download, Clock, Shield, Lock } from 'lucide-react'
import Link from 'next/link'

type AdminReviewRole = 'review_bapperida' | 'review_setda' | 'review_anggaran' | 'review_aset'
type ReviewAction = 'approve' | 'revision' | 'reject'

interface AdminRoleDef {
  key: AdminReviewRole
  label: string
}

const ADMIN_ROLES: AdminRoleDef[] = [
  { key: 'review_bapperida', label: 'Bapperida' },
  { key: 'review_setda', label: 'Setda' },
  { key: 'review_anggaran', label: 'Bidang Anggaran BKAD' },
  { key: 'review_aset', label: 'Bidang Aset BKAD' },
]

export default function ReviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { profile, isAdmin } = useProfile()
  const budgetId = params.id as string

  const [budget, setBudget] = useState<any>(null)
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [activeRole, setActiveRole] = useState<AdminRoleDef | null>(null)
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null)
  const [comments, setComments] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => { fetchData() }, [budgetId])

  async function fetchData() {
    const supabase = createClient()
    setIsLoading(true)

    const [budgetRes, revisionsRes, docsRes] = await Promise.all([
      supabase.from('budgets')
        .select('*, institution:institutions(name, code), submitter:profiles!budgets_submitted_by_fkey(full_name, position)')
        .eq('id', budgetId).single(),
      supabase.from('revisions')
        .select('*, reviewer:profiles!revisions_reviewer_id_fkey(full_name)')
        .eq('budget_id', budgetId).order('created_at', { ascending: false }),
      supabase.from('budget_documents')
        .select('*')
        .eq('budget_id', budgetId).order('created_at', { ascending: false }),
    ])

    if (budgetRes.data) setBudget(budgetRes.data)
    if (revisionsRes.data) setRevisions(revisionsRes.data as any)
    if (docsRes.data) setDocuments(docsRes.data)
    setIsLoading(false)
  }

  async function handleDownload(doc: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage.from('budget_documents').createSignedUrl(doc.file_path, 3600)
      if (error) throw error
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    } catch (error) {
      toast.error('Gagal membuka dokumen')
    }
  }

  async function handleReview() {
    if (!activeRole || !reviewAction || !profile) return
    if (!comments.trim()) { toast.error('Komentar wajib diisi'); return }

    setIsProcessing(true)
    const supabase = createClient()

    try {
      const roleStatus = reviewAction === 'approve' ? 'approved' : reviewAction === 'revision' ? 'revision' : 'rejected'
      
      const updates: any = {
        [activeRole.key]: roleStatus,
      }

      // Automatically recalculate global status based on the 4 reviews:
      const bApp = activeRole.key === 'review_bapperida' ? roleStatus : budget.review_bapperida
      const sApp = activeRole.key === 'review_setda' ? roleStatus : budget.review_setda
      const aApp = activeRole.key === 'review_anggaran' ? roleStatus : budget.review_anggaran
      const asApp = activeRole.key === 'review_aset' ? roleStatus : budget.review_aset

      const allStatuses = [bApp, sApp, aApp, asApp]
      let newGlobalStatus: BudgetStatus = budget.status

      if (allStatuses.includes('rejected')) {
        newGlobalStatus = 'rejected'
      } else if (allStatuses.includes('revision')) {
        newGlobalStatus = 'revision'
      } else if (allStatuses.every(s => s === 'approved')) {
        newGlobalStatus = 'approved'
      } else {
        newGlobalStatus = 'under_review'
      }

      updates.status = newGlobalStatus
      updates.reviewed_by = profile.id
      updates.review_date = new Date().toISOString()

      const { error: budgetError } = await supabase.from('budgets').update(updates).eq('id', budgetId)
      if (budgetError) throw budgetError

      // Create revision record specifically noting which role reviewed it
      const roleName = ADMIN_ROLES.find(r => r.key === activeRole.key)?.label
      const actionName = reviewAction === 'approve' ? 'Menyetujui' : reviewAction === 'revision' ? 'Meminta Revisi' : 'Menolak'

      const { error: revError } = await supabase.from('revisions').insert({
        budget_id: budgetId,
        reviewer_id: profile.id,
        from_status: budget.status,
        to_status: newGlobalStatus,
        comments: `[${roleName}] - ${actionName}: ${comments}`,
      })
      if (revError) throw revError

      toast.success(`Review ${roleName} berhasil disimpan`)
      setReviewAction(null)
      setActiveRole(null)
      setComments('')
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memproses review')
    } finally {
      setIsProcessing(false)
    }
  }

  // Mark as under_review when admin first views submitted budget
  useEffect(() => {
    if (budget && budget.status === 'submitted' && isAdmin && profile) {
      const supabase = createClient()
      supabase.from('budgets').update({ status: 'under_review', reviewed_by: profile.id }).eq('id', budgetId).then(() => {
        setBudget((prev: any) => prev ? { ...prev, status: 'under_review' } : prev)
      })
    }
  }, [budget?.status, isAdmin])

  if (isLoading) return <div className="space-y-6 max-w-4xl"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>
  if (!budget) return <div className="flex flex-col items-center justify-center py-20"><p>Pengajuan tidak ditemukan</p></div>

  const config = statusConfig[budget.status as BudgetStatus]

  const statusBadgeColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'revision': return 'bg-orange-100 text-orange-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    revision: 'Perlu Revisi',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-5 rounded-xl border border-border/60 shadow-sm">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0 rounded-full h-10 w-10">
            <Link href="/dashboard/review"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{budget.title}</h1>
              <Badge className={`${config.color} border-0 px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wider`}>{config.label}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> {documents.length} Dokumen Terlampir</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Diajukan tgl {formatDate(budget.submission_date || budget.created_at)}</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Oleh {budget.submitter?.full_name}</span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SKPD Pengusul</CardTitle>
          <CardDescription>Informasi Instansi yang mengajukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-semibold text-lg text-primary">{budget.institution?.name || '-'}</p>
            <p className="text-sm text-muted-foreground mt-1">Kode: {budget.institution?.code || '-'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dokumen RKA/DPA</CardTitle>
              <CardDescription>File pendukung yang dilampirkan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length > 0 ? documents.map((doc, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-md bg-background">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className={`h-8 w-8 shrink-0 ${doc.document_type === 'rka_dpa' ? 'text-emerald-500' : 'text-blue-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{doc.document_type.replace('_', ' ')} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleDownload(doc)}>
                    <Download className="mr-2 w-4 h-4" /> Buka
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground italic">Tidak ada dokumen terlampir.</p>
              )}
            </CardContent>
          </Card>

        </div>

        <div>
          {isAdmin && (
            <Card className="border-primary/20 sticky top-6">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-base">Panel Verifikasi 4 Admin</CardTitle>
                <CardDescription>Review pengajuan mewakili bidang masing-masing</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {ADMIN_ROLES.map((role, index) => {
                    const statusStr = budget[role.key] || 'pending'
                    const labelStr = statusLabels[statusStr] || 'Menunggu'
                    
                    const isAuthorized = profile?.admin_role === 'superadmin' || profile?.admin_role === role.key.replace('review_', '')
                    
                    return (
                      <div key={role.key} className={`p-4 flex flex-col gap-3 transition-colors ${!isAuthorized ? 'opacity-70 bg-muted/20' : 'hover:bg-muted/30'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{role.label}</p>
                            {!isAuthorized && <Shield className="h-3 w-3 text-muted-foreground" aria-label="Tidak ada hak akses" />}
                          </div>
                          <Badge className={`${statusBadgeColor(statusStr)} border-0 shadow-none`}>{labelStr}</Badge>
                        </div>
                        {isAuthorized ? (
                          <div className="flex gap-2 mt-1">
                            <Button size="sm" variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50" onClick={() => { setActiveRole(role); setReviewAction('approve') }}>
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Setujui
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => { setActiveRole(role); setReviewAction('revision') }}>
                              <AlertCircle className="mr-1.5 h-3.5 w-3.5" /> Revisi
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 border-red-200 text-red-700 hover:bg-red-50" onClick={() => { setActiveRole(role); setReviewAction('reject') }}>
                              <XCircle className="mr-1.5 h-3.5 w-3.5" /> Tolak
                            </Button>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground flex items-center bg-muted/40 p-2.5 rounded-md mt-1 italic">
                            Anda tidak memiliki hak akses untuk memberikan verifikasi pada bidang ini.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {revisions.length > 0 && (
            <Card className="mt-6">
              <CardHeader><CardTitle className="text-base">Riwayat Review</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revisions.map((rev, index) => (
                    <div key={rev.id} className="relative flex gap-4">
                      {index < revisions.length - 1 && <div className="absolute left-[13px] top-8 bottom-0 w-px bg-border" />}
                      <div className="flex-1 pb-4">
                        <p className="text-xs text-muted-foreground">{(rev as any).reviewer?.full_name || 'System'} • {formatDateTime(rev.created_at)}</p>
                        {rev.comments && (
                          <div className="mt-1.5 rounded-md bg-muted/50 p-2.5 text-sm">{rev.comments}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {activeRole && reviewAction && (
        <Dialog open={!!reviewAction} onOpenChange={() => { setReviewAction(null); setActiveRole(null); setComments('') }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Setujui Dokumen?' : reviewAction === 'revision' ? 'Minta Revisi?' : 'Tolak Dokumen?'}
              </DialogTitle>
              <DialogDescription>
                Anda akan melakukan review mewakili <strong>{activeRole.label}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Komentar dan Catatan *</Label>
                <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Berikan catatan, saran, atau alasan penolakan/revisi..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewAction(null)}>Batal</Button>
              <Button onClick={handleReview} disabled={isProcessing} className={
                reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                reviewAction === 'revision' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-red-600 hover:bg-red-700'
              }>
                {isProcessing ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Konfirmasi {reviewAction === 'approve' ? 'Setuju' : reviewAction === 'revision' ? 'Revisi' : 'Tolak'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
