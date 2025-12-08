'use client';

import { useEffect, useState } from 'react';

type Contact = {
    id: string;
    name: string;
    phone: string;
    created_at?: string;
};

type MessageState = {
    type: 'success' | 'error';
    text: string;
} | null;

export default function AdminPage() {
    const [authorized, setAuthorized] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    const [pin, setPin] = useState('');
    const [pinLoading, setPinLoading] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingNotify, setLoadingNotify] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [message, setMessage] = useState<MessageState>(null);

    // Check if already authorized (cookie)
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/admin/pin');
                const data = await res.json();
                if (data.authorized) {
                    setAuthorized(true);
                    await fetchContacts();
                }
            } catch {
                // ignore
            } finally {
                setAuthChecked(true);
            }
        })();
    }, []);

    async function fetchContacts() {
        try {
            setLoadingContacts(true);
            const res = await fetch('/api/admin/contacts');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load contacts');
            setContacts(data.contacts || []);
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Could not load contacts.',
            });
        } finally {
            setLoadingContacts(false);
        }
    }

    async function handlePinSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPinLoading(true);
        setPinError(null);

        try {
            const res = await fetch('/api/admin/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || 'Invalid PIN');
            }

            setAuthorized(true);
            setPin('');
            await fetchContacts();
        } catch (err: any) {
            setPinError(err.message || 'Invalid PIN');
        } finally {
            setPinLoading(false);
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setLoadingAdd(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to add contact');

            setMessage({ type: 'success', text: 'Contact added!' });
            setName('');
            setPhone('');
            fetchContacts();
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Error adding contact.',
            });
        } finally {
            setLoadingAdd(false);
        }
    }

    async function handleNotify() {
        setLoadingNotify(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/notify', { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to notify contacts');

            setMessage({ type: 'success', text: 'Notifications sent!' });
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Error sending notifications.',
            });
        } finally {
            setLoadingNotify(false);
        }
    }

    async function handleDelete(id: string, name: string) {
        const confirmed = window.confirm(
            `Remove ${name}? This will delete their phone number from the list.`
        );
        if (!confirmed) return;

        setDeletingId(id);
        setMessage(null);

        try {
            const res = await fetch(
                `/api/admin/contacts?id=${encodeURIComponent(id)}`,
                {
                    method: 'DELETE',
                }
            );

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to delete contact');

            setMessage({ type: 'success', text: 'Contact removed.' });
            setContacts((prev) => prev.filter((c) => c.id !== id));
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Error removing contact.',
            });
        } finally {
            setDeletingId(null);
        }
    }

    // While checking cookie
    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100">
                <div className="text-neutral-500 text-sm">Loading…</div>
            </div>
        );
    }

    // PIN screen
    if (!authorized) {
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-semibold text-neutral-900">
                            Admin Access
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Enter the 4-digit PIN to access the contacts panel.
                        </p>
                    </div>

                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={pin}
                            onChange={(e) =>
                                setPin(e.target.value.replace(/[^0-9]/g, ''))
                            }
                            placeholder="••••"
                            className="w-full text-center tracking-[0.5em] text-xl border rounded-xl px-4 py-3 bg-neutral-50 text-neutral-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {pinError && (
                            <p className="text-xs text-red-600 text-center">{pinError}</p>
                        )}
                        <button
                            type="submit"
                            disabled={pin.length !== 4 || pinLoading}
                            className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-neutral-900 text-white px-4 py-3 font-medium hover:bg-neutral-800 transition disabled:opacity-50"
                        >
                            {pinLoading && (
                                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {pinLoading ? 'Checking…' : 'Unlock'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Main admin UI (same vibe as before)
    return (
        <div className="min-h-screen bg-neutral-100">
            <div className="mx-auto max-w-6xl py-12 space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight">
                        Contacts Admin
                    </h1>

                    <button
                        onClick={handleNotify}
                        disabled={loadingNotify || contacts.length === 0}
                        className="mt-4 md:mt-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white font-medium shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loadingNotify && (
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {loadingNotify ? 'Sending…' : 'Notify all contacts'}
                    </button>
                </div>

                {/* Messages */}
                {message && (
                    <div
                        className={`rounded-xl px-4 py-3 text-sm border flex gap-2 ${
                            message.type === 'success'
                                ? 'border-green-300 bg-green-50 text-green-800'
                                : 'border-red-300 bg-red-50 text-red-800'
                        }`}
                    >
            <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`}
            />
                        {message.text}
                    </div>
                )}

                {/* Content layout */}
                <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
                    {/* Form */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-8 space-y-6">
                        <h2 className="text-xl font-semibold text-neutral-800">
                            Add Contact
                        </h2>

                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">
                                    Name
                                </label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full border rounded-lg px-4 py-3 bg-neutral-50 text-neutral-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">
                                    Phone
                                </label>
                                <input
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+31 6 1234 5678"
                                    className="w-full border rounded-lg px-4 py-3 bg-neutral-50 text-neutral-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loadingAdd}
                                className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-neutral-900 text-white px-4 py-3 font-medium hover:bg-neutral-800 transition disabled:opacity-50"
                            >
                                {loadingAdd && (
                                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {loadingAdd ? 'Adding…' : 'Add contact'}
                            </button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-8">
                        <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                            Registered Contacts
                        </h2>

                        <div className="overflow-hidden border rounded-xl">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-neutral-50 border-b">
                                <tr>
                                    <th className="py-3 px-4 font-medium text-neutral-600">
                                        Name
                                    </th>
                                    <th className="py-3 px-4 font-medium text-neutral-600">
                                        Phone
                                    </th>
                                    <th className="py-3 px-4 font-medium text-neutral-600">
                                        Added
                                    </th>
                                    <th className="py-3 px-4 font-medium text-neutral-600"></th>
                                </tr>
                                </thead>
                                <tbody>
                                {loadingContacts ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center py-6 text-neutral-500"
                                        >
                                            Loading…
                                        </td>
                                    </tr>
                                ) : contacts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center py-6 text-neutral-500"
                                        >
                                            No contacts yet
                                        </td>
                                    </tr>
                                ) : (
                                    contacts.map((c) => (
                                        <tr key={c.id} className="border-b last:border-b-0">
                                            <td className="py-3 px-4">{c.name}</td>
                                            <td className="py-3 px-4 font-mono text-xs text-neutral-700">
                                                {c.phone}
                                            </td>
                                            <td className="py-3 px-4 text-neutral-500 text-xs">
                                                {c.created_at
                                                    ? new Date(c.created_at).toLocaleString()
                                                    : '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(c.id, c.name)}
                                                    disabled={deletingId === c.id}
                                                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    {deletingId === c.id ? 'Removing…' : 'Remove'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
