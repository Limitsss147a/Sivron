import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing connection to:', supabaseUrl)
console.log('Using Key starting with:', supabaseKey?.substring(0, 10))

if (!supabaseUrl || !supabaseKey) {
  console.error('URL or Key is missing!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { data, error } = await supabase.from('institutions').select('*').limit(1)

    if (error) {
      console.error('Connection failed:', error.message)
      console.error('Full error:', error)
    } else {
      console.log('Connection successful! Data:', data)
    }
  } catch (err) {
    console.error('Catch error:', err)
  }
}

testConnection()
