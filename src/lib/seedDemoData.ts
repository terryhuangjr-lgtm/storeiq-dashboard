/// <reference types="vite/client" />
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fhmjvnphxsbtwcutqkvq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export async function seedDemoData() {
  console.log('Seeding demo data via edge function...')

  const functionUrl = `${supabaseUrl}/functions/v1/seed-demo-data`

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })

    const result = await response.json()

    if (!response.ok || result.error) {
      throw new Error(result.error || `HTTP ${response.status}`)
    }

    console.log('Demo data seeded successfully!')
    return result
  } catch (err) {
    console.error('Error seeding demo data:', err)
    throw err
  }
}
