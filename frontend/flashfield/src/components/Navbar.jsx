import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const accessToken = localStorage.getItem('accessToken');
    
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 py-4 px-6 md:px-10 backdrop-blur-md bg-navy/80 shadow-md shadow-black/20">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
                <Link to="/dashboard" className="text-2xl font-bold text-lightest-slate">
                    Flash<span className="text-cyan">Field</span>
                </Link>
                
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/dashboard" className="text-light-slate hover:text-cyan transition-colors">Beranda</Link>
                    <Link to="/experiments" className="text-light-slate hover:text-cyan transition-colors">Eksperimen</Link>
                </div>

                <div className="flex items-center space-x-4">
                    {accessToken ? (
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full text-light-slate hover:text-cyan">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-light-navy rounded-md shadow-lg py-1 z-50">
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-lightest-slate hover:bg-navy">Profil Saya</Link>
                                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-navy">
                                        Logout
                                    </button>
                                </div>
                            )}
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
