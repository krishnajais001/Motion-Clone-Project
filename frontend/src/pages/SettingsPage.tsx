import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Settings, Shield, HelpCircle, Bell, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import ProjectFooter from '@/components/ProjectFooter';
import { cn } from '@/lib/utils';

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
        <div className="space-y-2">
            <label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
                className="flex h-12 w-full border-2 border-black dark:border-white/10 bg-transparent px-4 py-1 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-black dark:focus:border-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-medium"
            />
        </div>
    );
}

/* ─── inline feedback banner ─── */
function Feedback({ type, message }: { type: 'success' | 'error'; message: string }) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 border-2 px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all",
                type === 'success'
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-red-500 bg-red-500/10 text-red-500'
            )}
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
    const { user, isLoading, updateProfile, updateEmail, updatePassword } = useUser();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'help'>('profile');

    /* ── name form ── */
    const [displayName, setDisplayName] = useState('');
    const [nameFeedback, setNameFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [isSavingName, setIsSavingName] = useState(false);

    /* ── email form ── */
    const [newEmail, setNewEmail] = useState('');
    const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [isSavingEmail, setIsSavingEmail] = useState(false);

    /* ── password form ── */
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwFeedback, setPwFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [isSavingPw, setIsSavingPw] = useState(false);

    /* ── initialize local state ── */
    useEffect(() => {
        if (user) {
            setDisplayName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '');
            setNewEmail(user?.email ?? '');
        }
    }, [user]);

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
        setIsSavingName(true);
        setNameFeedback(null);
        try {
            await updateProfile({ full_name: displayName.trim() });
            setNameFeedback({ type: 'success', msg: 'Name updated successfully.' });
        } catch (error: any) {
            setNameFeedback({ type: 'error', msg: error.message });
        } finally {
            setIsSavingName(false);
        }
    }, [displayName, updateProfile]);

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
        setIsSavingEmail(true);
        setEmailFeedback(null);
        try {
            await updateEmail(newEmail.trim());
            setEmailFeedback({
                type: 'success',
                msg: 'Verification link sent to your new inbox.',
            });
        } catch (error: any) {
            setEmailFeedback({ type: 'error', msg: error.message });
        } finally {
            setIsSavingEmail(false);
        }
    }, [newEmail, user?.email, updateEmail]);

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
        setIsSavingPw(true);
        setPwFeedback(null);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email ?? '',
                password: currentPassword,
            });
            if (signInError) {
                setPwFeedback({ type: 'error', msg: 'Current password is incorrect.' });
                return;
            }

            await updatePassword(newPassword);
            setPwFeedback({ type: 'success', msg: 'Password updated successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPwFeedback({ type: 'error', msg: error.message });
        } finally {
            setIsSavingPw(false);
        }
    }, [currentPassword, newPassword, confirmPassword, user?.email, updatePassword]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-white dark:bg-black">
                <div className="h-8 w-8 animate-spin rounded-none border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-white dark:bg-background text-black dark:text-white transition-colors duration-300 font-sans">
            <div className="mx-auto max-w-5xl px-6 py-8 lg:py-12">

                {/* Tactical Header */}
                <div className="mb-8 flex items-end justify-between border-b border-black dark:border-white pb-6">
                    <div>
                        <h1 className="text-xl font-black tracking-tighter mb-1 uppercase">Workspace Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Configuration & Identity</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Universal Time</div>
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-black dark:text-white tabular-nums">
                            {new Date().toISOString().split('T')[0].split('-').join(' / ')}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-4 mb-12">
                   {[
                     { id: 'profile', label: 'Identity', icon: User },
                     { id: 'security', label: 'Security', icon: Shield },
                     { id: 'help', label: 'Suppport', icon: HelpCircle }
                   ].map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all border-2",
                            activeTab === tab.id 
                                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                                : "border-gray-100 dark:border-white/5 text-gray-400 hover:border-black dark:hover:border-white"
                        )}
                     >
                        <tab.icon size={14} />
                        {tab.label}
                     </button>
                   ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Identity Banner */}
                        <div className="p-8 lg:p-12 border-2 border-black dark:border-white flex flex-col md:flex-row items-center gap-8 lg:gap-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <User size={120} />
                            </div>
                            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-4xl lg:text-5xl font-black shrink-0">
                                {avatarLetter}
                            </div>
                            <div className="text-center md:text-left min-w-0 flex-1">
                                <h2 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase truncate mb-2">
                                    {displayName || 'Untitled User'}
                                </h2>
                                <p className="text-sm font-bold opacity-40 uppercase tracking-widest truncate">{user?.email}</p>
                                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                        Joined {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="px-3 py-1 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest">
                                        Verified
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Name Update Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-8 border-t border-black/10 dark:border-white/10">
                            <div className="lg:col-span-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-3">Display Name</h3>
                                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-relaxed">
                                    Your alias across all collaborative spaces and ledgers.
                                </p>
                            </div>
                            <div className="lg:col-span-8 max-w-xl">
                                <form onSubmit={handleSaveName} className="space-y-6">
                                    <SettingsInput
                                        id="settings-name"
                                        label="Full Identity"
                                        value={displayName}
                                        onChange={setDisplayName}
                                        placeholder="Enter name"
                                        disabled={isSavingName}
                                        autoComplete="name"
                                    />
                                    {nameFeedback && <Feedback type={nameFeedback.type} message={nameFeedback.msg} />}
                                    <Button 
                                        type="submit" 
                                        disabled={isSavingName || displayName === (user?.user_metadata?.full_name ?? '')} 
                                        className="h-12 px-8 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-30 transition-all rounded-none"
                                    >
                                        {isSavingName ? 'Syncing...' : 'Apply Update'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Email Update Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-12 border-t border-black/10 dark:border-white/10">
                            <div className="lg:col-span-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-3">Email Vector</h3>
                                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-relaxed">
                                    Primary contact for security and tactical notifications.
                                </p>
                            </div>
                            <div className="lg:col-span-8 max-w-xl">
                                <form onSubmit={handleSaveEmail} className="space-y-6">
                                    <SettingsInput
                                        id="settings-email"
                                        label="Email Address"
                                        type="email"
                                        value={newEmail}
                                        onChange={setNewEmail}
                                        placeholder="you@domain.com"
                                        disabled={isSavingEmail}
                                        autoComplete="email"
                                    />
                                    {emailFeedback && <Feedback type={emailFeedback.type} message={emailFeedback.msg} />}
                                    <Button 
                                        type="submit" 
                                        disabled={isSavingEmail || newEmail === user?.email} 
                                        className="h-12 px-8 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-30 transition-all rounded-none"
                                    >
                                        {isSavingEmail ? 'Routing...' : 'Update Vector'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                            <div className="lg:col-span-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-3">Security Vault</h3>
                                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-relaxed">
                                    Update your encryption pathway (password). Verification of current access is required.
                                </p>
                            </div>
                            <div className="lg:col-span-8 max-w-xl">
                                <form onSubmit={handleSavePassword} className="space-y-8">
                                    <SettingsInput
                                        id="settings-current-password"
                                        label="Current Access Code"
                                        type="password"
                                        value={currentPassword}
                                        onChange={setCurrentPassword}
                                        placeholder="••••••••"
                                        disabled={isSavingPw}
                                        autoComplete="current-password"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <SettingsInput
                                            id="settings-new-password"
                                            label="New Access Code"
                                            type="password"
                                            value={newPassword}
                                            onChange={setNewPassword}
                                            placeholder="••••••••"
                                            disabled={isSavingPw}
                                            autoComplete="new-password"
                                        />
                                        <SettingsInput
                                            id="settings-confirm-password"
                                            label="Verification Code"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={setConfirmPassword}
                                            placeholder="••••••••"
                                            disabled={isSavingPw}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    {pwFeedback && <Feedback type={pwFeedback.type} message={pwFeedback.msg} />}
                                    <Button 
                                        type="submit" 
                                        disabled={isSavingPw} 
                                        className="h-12 px-8 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all rounded-none"
                                    >
                                        {isSavingPw ? 'Encrypting...' : 'Update Vault Access'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                {activeTab === 'help' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {[
                                { q: "How do I create a new page?", a: "Click the `+` icon next to the Workspace header in your sidebar. To nest a sub-page, click its internal `+` tactical button." },
                                { q: "Can I reset my vaults?", a: "Individual ledger entries can be purged via the trash icon in Study Mode. Global account purge is available via HQ." },
                                { q: "Universal Time Purpose?", a: "To maintain coordination across distributed workspace cycles and focus sessions." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-8 border-2 border-black/5 dark:border-white/5 bg-transparent group hover:border-black dark:hover:border-white transition-all cursor-default">
                                    <h4 className="text-xs font-black uppercase tracking-tighter mb-4 text-black dark:text-white">{item.q}</h4>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-10 border-2 border-black dark:border-white text-center">
                            <h3 className="text-xl font-black tracking-tighter uppercase mb-4">Tactical Support</h3>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] mb-8">Direct line to coordination headquarters.</p>
                            <a href="mailto:hq@motion.style" className="inline-block px-12 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-xs hover:opacity-80 transition-all">
                                hq@motion.style
                            </a>
                        </div>
                    </div>
                )}

                <div className="mt-20 pt-12 border-t border-black/10 dark:border-white/10 opacity-20 text-[9px] font-black uppercase tracking-[0.5em] text-center">
                    Motion Tactical Workspace v2.4.0
                </div>

            </div>
            <ProjectFooter />
        </div>
    );
}
