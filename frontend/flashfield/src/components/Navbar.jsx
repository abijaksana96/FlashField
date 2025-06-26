import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Komponen Navbar untuk Pengguna yang Sudah Login
const Navbar = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const accessToken = localStorage.getItem('accessToken');
    
    // useRef untuk mendeteksi klik di luar dropdown
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    // useEffect untuk menambahkan event listener saat dropdown terbuka
    useEffect(() => {
        // Fungsi untuk menutup dropdown jika klik terjadi di luar
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        // Tambahkan event listener hanya jika dropdown terbuka
        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup: Hapus event listener saat komponen unmount atau dropdown tertutup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]); // Efek ini hanya bergantung pada state isDropdownOpen

    return (
        <header className="sticky top-0 z-50 py-4 px-6 md:px-10 backdrop-blur-md bg-navy/80 shadow-md shadow-black/20">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
                <Link to="/homepage" className="text-2xl font-bold text-lightest-slate">
                    Flash<span className="text-cyan">Field</span>
                </Link>
                
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/homepage" className="text-light-slate hover:text-cyan transition-colors">Beranda</Link>
                    <Link to="/experiments" className="text-light-slate hover:text-cyan transition-colors">Eksperimen</Link>
                    {/* <Link to="/dashboard" className="text-light-slate hover:text-cyan transition-colors">Dashboard</Link> */}
                </div>

                <div className="flex items-center space-x-4">
                    {accessToken ? (
                        // Gunakan ref pada container dropdown
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full text-light-slate hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                {/* Ikon Pengguna */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </button>
                            
                            {/* Tambahkan kelas transisi untuk animasi */}
                            <div 
                                className={`absolute right-0 mt-2 w-56 bg-light-navy rounded-md shadow-lg overflow-hidden z-50 transition-all duration-300 ease-in-out ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                            >
                                <div className="p-2">
                                    {/* Link Profil dengan Ikon */}
                                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-lightest-slate rounded-md hover:bg-navy">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM12 12a5 5 0 00-5 5h10a5 5 0 00-5-5z" clipRule="evenodd" /></svg>
                                        <span>Profil Saya</span>
                                    </Link>
                                    
                                    {/* Garis Pemisah */}
                                    <div className="border-t border-navy/50 my-1"></div>
                                    
                                    {/* Tombol Logout dengan Ikon */}
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 rounded-md hover:bg-navy">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-cyan text-sm font-medium py-2 px-4 rounded-md">Login</Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;