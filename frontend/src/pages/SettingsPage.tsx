import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
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

/* ─── section card ─── */
function SettingsSection({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    {icon}
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
export default function SettingsPage() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

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
            <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-2xl px-6 py-10">

                {/* ── Page Header ── */}
                <div className="mb-8">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <span>Workspace</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-foreground font-medium">Settings</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your account details and preferences.
                    </p>
                </div>

                {/* ── Profile Card (read-only overview) ── */}
                <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
                    {/* Avatar */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-foreground text-xl font-bold text-background select-none">
                        {avatarLetter}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                            {displayName || 'No name set'}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/70">
                            Member since{' '}
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

                <div className="space-y-4">

                    {/* ── Display Name ── */}
                    <SettingsSection
                        icon={<User className="h-4.5 w-4.5" />}
                        title="Display Name"
                        description="This name appears across your workspace."
                    >
                        <form onSubmit={handleSaveName} className="space-y-3">
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
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" disabled={nameSaving}>
                                    {nameSaving ? 'Saving…' : 'Save name'}
                                </Button>
                            </div>
                        </form>
                    </SettingsSection>

                    {/* ── Email ── */}
                    <SettingsSection
                        icon={<Mail className="h-4.5 w-4.5" />}
                        title="Email Address"
                        description="Changing your email will require confirmation of the new address."
                    >
                        <form onSubmit={handleSaveEmail} className="space-y-3">
                            <SettingsInput
                                id="settings-email"
                                label="Email"
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
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" disabled={emailSaving}>
                                    {emailSaving ? 'Saving…' : 'Update email'}
                                </Button>
                            </div>
                        </form>
                    </SettingsSection>

                    {/* ── Password ── */}
                    <SettingsSection
                        icon={<Lock className="h-4.5 w-4.5" />}
                        title="Password"
                        description="Use a strong password of at least 6 characters."
                    >
                        <form onSubmit={handleSavePassword} className="space-y-3">
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
                                label="Confirm new password"
                                type="password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                placeholder="••••••••"
                                disabled={pwSaving}
                                autoComplete="new-password"
                            />
                            {pwFeedback && (
                                <Feedback type={pwFeedback.type} message={pwFeedback.msg} />
                            )}
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" disabled={pwSaving}>
                                    {pwSaving ? 'Saving…' : 'Change password'}
                                </Button>
                            </div>
                        </form>
                    </SettingsSection>

                </div>
            </div>
        </div>
    );
}
