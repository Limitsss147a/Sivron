import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDb() {
  console.log('--- DB Check ---')
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, full_name, institution_id, role')
  console.log('Profiles:', profiles, pErr ? pErr.message : '')

  const { data: programs, error: progErr } = await supabase.from('programs').select('id, institution_id, code, name')
  console.log('Programs:', programs, progErr ? progErr.message : '')

  const { data: insts, error: instErr } = await supabase.from('institutions').select('id, name')
  console.log('Institutions:', insts, instErr ? instErr.message : '')
}

checkDb()
