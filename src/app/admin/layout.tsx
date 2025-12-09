import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-100 flex">
            <AdminSidebar />

            <main className="flex-1 flex flex-col">
                {/* Top bar inside admin area (optional, simple for now) */}
                <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center px-6">
                    <div className="text-sm text-slate-500">
                        Admin / <span className="font-medium text-slate-900">Contacts</span>
                    </div>
                </header>

                <div className="flex-1 px-6 py-6">
                    {/* This is where your existing AdminPage renders */}
                    {children}
                </div>
            </main>
        </div>
    );
}
