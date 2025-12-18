import React from 'react';
import './LandingPage.css'; 

function LandingPage() {
    return (
        <>
            <header className="sticky top-0 z-50 py-4 px-6 md:px-10 backdrop-blur-md bg-navy/80 shadow-md shadow-black/20">
                <nav className="flex justify-between items-center max-w-7xl mx-auto">
                    <a href="#" className="text-2xl font-bold text-lightest-slate">
                        Flash<span className="text-cyan">Field</span>
                    </a>
                    <div className="flex items-center space-x-4">
                        <a href="/login" className="text-sm font-medium py-2 px-4 rounded-md text-light-slate hover:text-cyan transition-colors">Login</a>
                        <a href="/register" className="btn-cyan text-sm font-medium py-2 px-4 rounded-md">Daftar</a>
                    </div>
                </nav>
            </header>

            <main>
                <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden py-20 px-4">
                    <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-lightest-slate leading-tight">
                            Sains untuk <span className="text-cyan">Semua</span><br />Mulai dari sekitarmu
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-light-slate">
                            FlashField adalah platform kolaboratif untuk mengumpulkan data geospasial lewat eksperimen mikro dari komunitas peneliti dan lingkungan
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <a href="/register" className="w-full sm:w-auto btn-cyan-solid text-lg font-bold py-3 px-8 rounded-md">
                                Mulai Berkontribusi
                            </a>
                            <a href="/login" className="w-full sm:w-auto btn-cyan text-lg font-bold py-3 px-8 rounded-md">
                                Lihat Eksperimen
                            </a>
                        </div>
                    </div>
                </section>
                <section id="how-it-works" className="py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-lightest-slate">Sederhana, Cepat, dan Berdampak</h2>
                            <p className="mt-4 text-lg text-slate">Hanya butuh tiga langkah untuk mulai membuat perubahan.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="card-bg p-8 rounded-lg">
                                <div className="flex justify-center items-center h-16 w-16 bg-navy rounded-full mx-auto mb-6 border-2 border-cyan-500/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-lightest-slate mb-2">1. Jelajahi & Pilih Proyek</h3>
                                <p className="text-slate">Jelajahi berbagai eksperimen yang dibuat oleh para peneliti. Dari memetakan keanekaragaman hayati hingga memantau kualitas udara, selalu ada riset yang bisa Anda ikuti.</p>
                            </div>
                            <div className="card-bg p-8 rounded-lg">
                                <div className="flex justify-center items-center h-16 w-16 bg-navy rounded-full mx-auto mb-6 border-2 border-cyan-500/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-lightest-slate mb-2">2. Submit Data Geospasial</h3>
                                <p className="text-slate">Dengan ponsel di tangan, catat pengamatan Anda. Setiap data yang Anda kirim lengkap dengan lokasi geografis langsung menjadi bagian dari dataset yang lebih besar.</p>
                            </div>
                            <div className="card-bg p-8 rounded-lg">
                                <div className="flex justify-center items-center h-16 w-16 bg-navy rounded-full mx-auto mb-6 border-2 border-cyan-500/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-lightest-slate mb-2">3. Analisis & Buat Perubahan</h3>
                                <p className="text-slate">Saksikan data Anda dan ribuan relawan lainnya terwujud dalam peta interaktif. Bagi peneliti, ini adalah wawasan baru yang siap dianalisis untuk penemuan besar.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-24 text-center px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-lightest-slate">
                            Siap Bergabung dengan Ribuan Relawan Lainnya?
                        </h2>
                        <p className="mt-4 text-lg text-slate">
                            Buat akun Anda sekarang dan mulailah membuat dampak nyata bagi lingkungan dan ilmu pengetahuan, satu data pada satu waktu.
                        </p>
                        <div className="mt-8">
                            <a href="/register" className="btn-cyan-solid text-lg font-bold py-4 px-10 rounded-md">
                                Buat Akun Gratis
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-light-navy border-t border-navy/50">
                <div className="max-w-7xl mx-auto py-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <p className="text-slate text-sm">
                        &copy; 2025 FlashField. Dibuat dengan semangat kolaborasi.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-slate hover:text-cyan transition-colors">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="#" className="text-slate hover:text-cyan transition-colors">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default LandingPage;
