import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';

async function requireAdmin() {
    const cookieStore = await cookies();
    const isAuthorized = cookieStore.get('admin_auth')?.value === 'true';

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

// GET – list contacts
export async function GET() {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { data, error } = await supabaseAdmin
        .from('contacts')
        .select('id, name, phone, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('GET /api/admin/contacts error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contacts: data });
}

// POST – add contact
export async function POST(request: Request) {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    try {
        const { name, phone } = await request.json();

        if (!name || !phone) {
            return NextResponse.json(
                { error: 'Name and phone are required' },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from('contacts')
            .insert({ name, phone });

        if (error) {
            console.error('POST /api/admin/contacts error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('POST /api/admin/contacts error:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

// DELETE – remove contact by id
export async function DELETE(request: Request) {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { error: 'Contact id is required' },
            { status: 400 }
        );
    }

    const { error } = await supabaseAdmin.from('contacts').delete().eq('id', id);

    if (error) {
        console.error('DELETE /api/admin/contacts error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
