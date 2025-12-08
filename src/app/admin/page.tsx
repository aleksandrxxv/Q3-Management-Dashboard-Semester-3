'use client';

import { useState } from 'react';

export default function AdminPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingNotify, setLoadingNotify] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        setLoadingAdd(true);

        try {
            const res = await fetch('/api/admin/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to add contact');
            }

            setMessage('Contact added successfully');
            setName('');
            setPhone('');
        } catch (err: any) {
            setMessage(err.message || 'Something went wrong');
        } finally {
            setLoadingAdd(false);
        }
    }

    async function handleNotify() {
        setMessage(null);
        setLoadingNotify(true);

        try {
            const res = await fetch('/api/admin/notify', {
                method: 'POST',
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to notify contacts');
            }

            setMessage('Notifications sent (or queued) to all contacts');
        } catch (err: any) {
            setMessage(err.message || 'Something went wrong');
        } finally {
            setLoadingNotify(false);
        }
    }

    return (
        <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui' }}>
            <h1>Admin – Contacts</h1>

            <form onSubmit={handleAdd} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                    required
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ padding: 8 }}
                />
                <input
                    required
                    placeholder="Phone (e.g. +31612345678)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ padding: 8 }}
                />
                <button type="submit" disabled={loadingAdd}>
                    {loadingAdd ? 'Adding…' : 'Add contact'}
                </button>
            </form>

            <hr style={{ margin: '24px 0' }} />

            <button onClick={handleNotify} disabled={loadingNotify}>
                {loadingNotify ? 'Sending…' : 'Notify all contacts'}
            </button>

            {message && (
                <p style={{ marginTop: 16 }}>
                    {message}
                </p>
            )}
        </div>
    );
}
