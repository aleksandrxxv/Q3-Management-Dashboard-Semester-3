import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_PIN = process.env.ADMIN_PIN;

export async function GET() {
    const cookieStore = await cookies();
    const authorized = cookieStore.get('admin_auth')?.value === 'true';
    return NextResponse.json({ authorized });
}

export async function POST(request: Request) {
    if (!ADMIN_PIN) {
        console.error('ADMIN_PIN is not set in env');
        return NextResponse.json(
            { error: 'Server not configured' },
            { status: 500 }
        );
    }

    const { pin } = await request.json().catch(() => ({ pin: '' }));

    if (pin === ADMIN_PIN) {
        const res = NextResponse.json({ success: true });

        // set auth cookie for ~8 hours
        res.cookies.set('admin_auth', 'true', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 8,
            path: '/',
        });

        return res;
    }

    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
}
