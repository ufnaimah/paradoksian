import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yvgfehewmwomgttcmbib.supabase.co'
const supabaseKey = 'sb_publishable_WOUMh1Ayog7HMxK8_hK-Eg_w8fU1ETL'

export const supabase = createClient(supabaseUrl, supabaseKey)