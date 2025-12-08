import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const { name, phone } = await request.json();

        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from('contacts').insert({
            name,
            phone,
        });

        if (error) {
            console.error(error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
