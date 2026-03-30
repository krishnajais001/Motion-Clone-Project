export default function ProjectFooter() {
    return (
        <footer className="w-full bg-black text-white pt-24 pb-12 px-8 border-t border-white/10 relative z-10 selection:bg-white selection:text-black">
            <div className="max-w-7xl mx-auto mb-32">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-6 space-y-4">
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase select-none">
                            MOTION.
                        </h2>
                        <p className="max-w-md text-[13px] font-medium leading-relaxed opacity-40">
                            Motion redefines productivity as discipline — a high-performance workspace where projects, ideas, and focus converge into a single command system.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-6 flex justify-end gap-16 md:gap-24">
                        {/* Archive Column */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Archive</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-sm font-black uppercase tracking-tight hover:opacity-50 transition-all">Docs</a></li>
                                <li><a href="#" className="text-sm font-black uppercase tracking-tight hover:opacity-50 transition-all">Support</a></li>
                            </ul>
                        </div>

                        {/* System Column */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">System</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-sm font-black uppercase tracking-tight hover:opacity-50 transition-all">Status</a></li>
                                <li><a href="#" className="text-sm font-black uppercase tracking-tight hover:opacity-50 transition-all">Builds</a></li>
                            </ul>
                        </div>

                        {/* Social Column */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Social</h4>
                            <ul className="space-y-4">
                                <li><a href="https://www.linkedin.com/in/krishnajais/" target="_blank" rel="noopener noreferrer" className="text-sm font-black uppercase tracking-tight hover:opacity-50 transition-all">LinkedIn</a></li>
                                <li><a href="https://github.com/krishnajais001" target="_blank" rel="noopener noreferrer" className="text-sm font-black uppercase tracking-tight hover:opacity-50 transition-all">Github</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.5em] opacity-30">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-12">
                     <span className="whitespace-nowrap">© 2026 MT-SYS</span>
                     <span className="whitespace-nowrap">Developed by Krishna Jaiswal</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end items-center gap-6 md:gap-12">
                    <a href="https://github.com/krishnajais001" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity whitespace-nowrap">Github</a>
                    <a href="https://www.linkedin.com/in/krishnajais/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity whitespace-nowrap">LinkedIn</a>
                    <span className="whitespace-nowrap">All-Rights-Reserved</span>
                </div>
            </div>
        </footer>
    );
}
