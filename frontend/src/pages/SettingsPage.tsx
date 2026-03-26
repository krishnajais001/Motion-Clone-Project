import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/* ─── tiny reusable input ─── */
function SettingsInput({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled,
    autoComplete,
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    autoComplete?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium text-foreground">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
        </div>
    );
}

/* ─── inline feedback banner ─── */
function Feedback({ type, message }: { type: 'success' | 'error'; message: string }) {
    return (
        <div
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${type === 'success'
                    ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'border-destructive/40 bg-destructive/10 text-destructive'
                }`}
        >
            {type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message}</span>
        </div>
    );
}


/* ══════════════════════════════════════════════════════ */
export default function SettingsPage() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'help'>('profile');

    /* ── name form ── */
    const [displayName, setDisplayName] = useState('');
    const [nameFeedback, setNameFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [nameSaving, setNameSaving] = useState(false);

    /* ── email form ── */
    const [newEmail, setNewEmail] = useState('');
    const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [emailSaving, setEmailSaving] = useState(false);

    /* ── password form ── */
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwFeedback, setPwFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [pwSaving, setPwSaving] = useState(false);

    /* ── load user ── */
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setDisplayName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '');
            setNewEmail(user?.email ?? '');
            setLoading(false);
        });
    }, []);

    /* ── derived avatar letter ── */
    const avatarLetter = displayName?.trim()?.[0]?.toUpperCase()
        ?? user?.email?.[0]?.toUpperCase()
        ?? '?';

    /* ── update name ── */
    const handleSaveName = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim()) {
            setNameFeedback({ type: 'error', msg: 'Name cannot be empty.' });
            return;
        }
        setNameSaving(true);
        setNameFeedback(null);
        const { error } = await supabase.auth.updateUser({
            data: { full_name: displayName.trim() },
        });
        setNameSaving(false);
        if (error) {
            setNameFeedback({ type: 'error', msg: error.message });
        } else {
            setNameFeedback({ type: 'success', msg: 'Name updated successfully.' });
            // refresh local user
            const { data: { user: updated } } = await supabase.auth.getUser();
            setUser(updated);
        }
    }, [displayName]);

    /* ── update email ── */
    const handleSaveEmail = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim()) {
            setEmailFeedback({ type: 'error', msg: 'Email cannot be empty.' });
            return;
        }
        if (newEmail.trim() === user?.email) {
            setEmailFeedback({ type: 'error', msg: 'This is already your current email.' });
            return;
        }
        setEmailSaving(true);
        setEmailFeedback(null);
        const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
        setEmailSaving(false);
        if (error) {
            setEmailFeedback({ type: 'error', msg: error.message });
        } else {
            setEmailFeedback({
                type: 'success',
                msg: 'Confirmation email sent. Check your inbox to verify the new address.',
            });
        }
    }, [newEmail, user?.email]);

    /* ── update password ── */
    const handleSavePassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !currentPassword) {
            setPwFeedback({ type: 'error', msg: 'Please fill in all password fields.' });
            return;
        }
        if (newPassword.length < 6) {
            setPwFeedback({ type: 'error', msg: 'New password must be at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwFeedback({ type: 'error', msg: 'Passwords do not match.' });
            return;
        }
        setPwSaving(true);
        setPwFeedback(null);

        // Re-authenticate first to verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user?.email ?? '',
            password: currentPassword,
        });
        if (signInError) {
            setPwSaving(false);
            setPwFeedback({ type: 'error', msg: 'Current password is incorrect.' });
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setPwSaving(false);
        if (error) {
            setPwFeedback({ type: 'error', msg: error.message });
        } else {
            setPwFeedback({ type: 'success', msg: 'Password updated successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [currentPassword, newPassword, confirmPassword, user?.email]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-white">
                <div className="h-6 w-6 animate-spin rounded-none border-2 border-black border-t-white" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-background text-black dark:text-[#F0F0F0] transition-colors duration-300">
            <div className="mx-auto max-w-4xl px-8 py-16">

                {/* ── Page Header ── */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Workspace Settings</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Manage your account details, preferences, and workspace configuration.
                    </p>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-8 mb-10 border-b border-black/10 dark:border-white/10">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`pb-4 text-sm font-medium transition-all relative ${
                            activeTab === 'profile' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        Profile
                        {activeTab === 'profile' && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white"></span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('help')}
                        className={`pb-4 text-sm font-medium transition-all relative ${
                            activeTab === 'help' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        Help & Support
                        {activeTab === 'help' && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white"></span>
                        )}
                    </button>
                </div>

                {/* ── Help Section ── */}
                {activeTab === 'help' && (
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-10 animate-in fade-in duration-500">
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Frequently Asked Questions</h2>
                            
                            <div className="space-y-6">
                                <div className="border-b border-gray-100 dark:border-white/5 pb-6">
                                    <h3 className="text-base font-medium text-black dark:text-white">How do I create a new page?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Click the `+` icon next to the Workspace header in your sidebar. To nest a sub-page, hover over an existing page and click its `+` icon.</p>
                                </div>
                                <div className="border-b border-gray-100 dark:border-white/5 pb-6">
                                    <h3 className="text-base font-medium text-black dark:text-white">Can I change my password?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Yes. Head to the Profile tab on this settings page, verify your current password, and enter a new one securely.</p>
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-black dark:text-white">How do I use my daily planner?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Go to 'My Planner' in the sidebar menu. Click on any date to view its schedule, then use the right-hand panel and click 'New Task' to organize your day.</p>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10">
                                <h2 className="text-sm font-medium text-black dark:text-white mb-2">Need direct assistance?</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You can reach out to our dedicated support team 24/7.</p>
                                <a href="mailto:support@motion.style" className="inline-flex items-center text-sm font-medium text-black dark:text-white hover:underline underline-offset-4">
                                    support@motion.style
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Combined Settings Card (Profile) ── */}
                {activeTab === 'profile' && (
                    <div className="border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-white/5 overflow-hidden animate-in fade-in duration-500">
                        {/* ── Profile Header ── */}
                        <div className="flex items-center gap-6 p-10 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-black dark:bg-white text-3xl font-medium text-white dark:text-black select-none">
                                {avatarLetter}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-2xl font-semibold text-black dark:text-white tracking-tight">
                                    {displayName || 'Unnamed User'}
                                </p>
                                <p className="truncate text-base text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                            </div>
                            <div className="text-right shrink-0 self-start">
                                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Member since
                                </p>
                                <p className="text-sm font-medium text-black dark:text-white mt-1">
                                    {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })
                                        : '—'}
                                </p>
                            </div>
                        </div>

                        {/* ── Details Sections Container ── */}
                        <div className="divide-y divide-gray-100 dark:divide-white/10">

                            {/* ── Display Name ── */}
                            <div className="p-10 flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3 shrink-0">
                                    <h2 className="text-base font-semibold text-black dark:text-white">Display Name</h2>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">This is the public name that will be displayed across your entire workspace.</p>
                                </div>
                                <div className="flex-1 max-w-lg">
                                    <form onSubmit={handleSaveName} className="space-y-4">
                                        <SettingsInput
                                            id="settings-name"
                                            label="Full name"
                                            value={displayName}
                                            onChange={setDisplayName}
                                            placeholder="Your name"
                                            disabled={nameSaving}
                                            autoComplete="name"
                                        />
                                        {nameFeedback && (
                                            <Feedback type={nameFeedback.type} message={nameFeedback.msg} />
                                        )}
                                        <div className="flex justify-end pt-2">
                                            <Button type="submit" disabled={nameSaving} className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-colors text-sm px-6">
                                                {nameSaving ? 'Saving…' : 'Save changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* ── Email ── */}
                            <div className="p-10 flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3 shrink-0">
                                    <h2 className="text-base font-semibold text-black dark:text-white">Email Address</h2>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Changing your email will require immediate verification from your new inbox.</p>
                                </div>
                                <div className="flex-1 max-w-lg">
                                    <form onSubmit={handleSaveEmail} className="space-y-4">
                                        <SettingsInput
                                            id="settings-email"
                                            label="Email address"
                                            type="email"
                                            value={newEmail}
                                            onChange={setNewEmail}
                                            placeholder="you@example.com"
                                            disabled={emailSaving}
                                            autoComplete="email"
                                        />
                                        {emailFeedback && (
                                            <Feedback type={emailFeedback.type} message={emailFeedback.msg} />
                                        )}
                                        <div className="flex justify-end pt-2">
                                            <Button type="submit" disabled={emailSaving} className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-colors text-sm px-6">
                                                {emailSaving ? 'Saving…' : 'Update email'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* ── Password ── */}
                            <div className="p-10 flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3 shrink-0">
                                    <h2 className="text-base font-semibold text-black dark:text-white">Password</h2>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Ensure your account is using a long, random password to stay secure.</p>
                                </div>
                                <div className="flex-1 max-w-lg">
                                    <form onSubmit={handleSavePassword} className="space-y-4">
                                        <SettingsInput
                                            id="settings-current-password"
                                            label="Current password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={setCurrentPassword}
                                            placeholder="••••••••"
                                            disabled={pwSaving}
                                            autoComplete="current-password"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <SettingsInput
                                                id="settings-new-password"
                                                label="New password"
                                                type="password"
                                                value={newPassword}
                                                onChange={setNewPassword}
                                                placeholder="••••••••"
                                                disabled={pwSaving}
                                                autoComplete="new-password"
                                            />
                                            <SettingsInput
                                                id="settings-confirm-password"
                                                label="Confirm new"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={setConfirmPassword}
                                                placeholder="••••••••"
                                                disabled={pwSaving}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        {pwFeedback && (
                                            <Feedback type={pwFeedback.type} message={pwFeedback.msg} />
                                        )}
                                        <div className="flex justify-end pt-2">
                                            <Button type="submit" disabled={pwSaving} className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-colors text-sm px-6">
                                                {pwSaving ? 'Updating…' : 'Update password'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
