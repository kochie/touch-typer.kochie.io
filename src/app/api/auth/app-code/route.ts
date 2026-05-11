import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(_request: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('app_auth_codes')
    .insert({ user_id: user.id })
    .select('code')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }

  return NextResponse.json({ code: data.code });
}
