import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';
import twilio from 'twilio';

async function requireAdmin() {
    const cookieStore = await cookies();
    const isAuthorized = cookieStore.get('admin_auth')?.value === 'true';

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const defaultMessage =
    process.env.BROADCAST_MESSAGE || 'Hello from our app!';

let client: ReturnType<typeof twilio> | null = null;

if (!accountSid || !authToken || !fromNumber) {
    console.warn(
        '[Twilio] Missing env vars. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.'
    );
} else if (!accountSid.startsWith('AC')) {
    console.warn(
        `[Twilio] TWILIO_ACCOUNT_SID must start with "AC". Got: ${accountSid}`
    );
} else {
    client = twilio(accountSid, authToken);
}

export async function POST() {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    try {
        console.log('HIT /api/admin/notify');

        const { data: contacts, error } = await supabaseAdmin
            .from('contacts')
            .select('id, name, phone');

        if (error) {
            console.error('Supabase error in /api/admin/notify:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!contacts || contacts.length === 0) {
            return NextResponse.json(
                { error: 'No contacts found' },
                { status: 400 }
            );
        }

        if (!client) {
            return NextResponse.json(
                {
                    error:
                        'Twilio is not configured correctly. Check TWILIO_ACCOUNT_SID (must start with AC), TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.',
                },
                { status: 500 }
            );
        }

        // Check for zero shots notifications that need SMS
        const { data: zeroShotsNotifications } = await supabaseAdmin
            .from('i_notifications')
            .select('id, message')
            .eq('status', 'error')
            .eq('send_sms', true)
            .eq('sms_sent', false)
            .ilike('message', '%zero shots%')
            .is('read_at', null)
            .order('detected_at', { ascending: false })
            .limit(1);

        // Determine the message to send
        let smsMessage = defaultMessage;
        if (zeroShotsNotifications && zeroShotsNotifications.length > 0) {
            // Use the zero shots notification message
            smsMessage = `🚨 Alert: ${zeroShotsNotifications[0].message}`;
            
            // Mark the notification as SMS sent
            await supabaseAdmin
                .from('i_notifications')
                .update({ sms_sent: true })
                .eq('id', zeroShotsNotifications[0].id);
        }

        const results: Array<{
            id: string;
            sid?: string;
            status: 'ok' | 'error';
            error?: string;
        }> = [];

        for (const c of contacts) {
            try {
                const msg = await client.messages.create({
                    body: `${smsMessage} ${c.name ? '(' + c.name + ')' : ''}`,
                    from: fromNumber!,
                    to: c.phone,
                });
                results.push({ id: c.id, sid: msg.sid, status: 'ok' });
            } catch (err: any) {
                console.error('Twilio send error for', c.phone, err?.message);
                results.push({
                    id: c.id,
                    status: 'error',
                    error: err?.message || 'Unknown Twilio error',
                });
            }
        }

        return NextResponse.json({
            success: true,
            count: contacts.length,
            results,
        });
    } catch (err: any) {
        console.error('Route error /api/admin/notify:', err);
        return NextResponse.json(
            { error: err?.message || 'Unexpected server error' },
            { status: 500 }
        );
    }
}
