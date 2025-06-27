import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

// --- Komponen-komponen UI ---

const LoadingSpinner = ({ text }) => (
    <div className="text-center py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <p className="mt-4 text-cyan">{text || "Memuat..."}</p>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="text-center py-10 text-red-400 bg-red-500/10 p-4 rounded-md">{message}</div>
);

const StatCard = ({ title, value, icon }) => (
    <div className="bg-light-navy p-6 rounded-lg shadow-lg flex items-center gap-4">
        <div className="bg-navy p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-lightest-slate">{value}</p>
            <p className="text-slate">{title}</p>
        </div>
    </div>
);

// Komponen BARU untuk tampilan kosong (Empty State)
const EmptyState = ({ icon, title, message }) => (
    <tr>
        <td colSpan="4" className="text-center py-24 px-6">
            <div className="flex flex-col items-center text-slate">
                <div className="mb-4">{icon}</div>
                <h3 className="text-lg font-semibold text-lightest-slate">{title}</h3>
                <p className="mt-1 text-sm">{message}</p>
            </div>
        </td>
    </tr>
);


const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            await onSave(user.id, formData);
            onClose();
        } catch (err) {
            setError(err.message || "Gagal menyimpan perubahan.");
        } finally {
            setIsSaving(false);
        }
    };
    
    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-navy p-8 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-lightest-slate mb-6">Edit Pengguna</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="full_name" className="block text-slate text-sm font-medium mb-2">Nama Lengkap</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate/50 focus:border-cyan focus:ring-1 focus:ring-cyan" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-slate text-sm font-medium mb-2">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate/50 focus:border-cyan focus:ring-1 focus:ring-cyan" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-slate text-sm font-medium mb-2">Peran</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate/50 focus:border-cyan focus:ring-1 focus:ring-cyan">
                            <option value="volunteer">Volunteer</option>
                            <option value="researcher">Researcher</option>
                        </select>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-slate hover:text-lightest-slate px-4 py-2 rounded-md">Batal</button>
                        <button type="submit" disabled={isSaving} className="btn-cyan-solid font-bold py-2 px-6 rounded-md">
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


function AdminUserManagement() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    // Double-check: Pastikan user adalah admin
    useEffect(() => {
        if (!authLoading && currentUser && currentUser.role !== 'admin') {
            window.location.href = '/unauthorized';
        }
    }, [currentUser, authLoading]);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/users/');
            setUsers(response.data);
        } catch (err) {
            setError("Gagal memuat data pengguna.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const handleUpdateUser = async (userId, updatedData) => {
        try {
            await apiClient.put(`/users/${userId}`, updatedData);
            setEditingUser(null);
            fetchAllUsers();
            alert('Pengguna berhasil diperbarui.');
        } catch (err) {
            throw new Error(err.response?.data?.detail || "Gagal memperbarui pengguna.");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna dengan ID ${userId}?`)) {
            try {
                await apiClient.delete(`/users/${userId}`);
                fetchAllUsers();
                alert('Pengguna berhasil dihapus.');
            } catch (err) {
                alert('Gagal menghapus pengguna.');
            }
        }
    };
    
    // PERBAIKAN: Filter pengguna yang bisa dikelola
    const manageableUsers = useMemo(() => users.filter(user => user.role !== 'admin'), [users]);
    
    const stats = useMemo(() => {
        const researchers = manageableUsers.filter(u => u.role === 'researcher').length;
        const volunteers = manageableUsers.filter(u => u.role === 'volunteer').length;
        return {
            total: researchers + volunteers,
            researchers,
            volunteers,
        }
    }, [manageableUsers]);

    if (loading) return <LoadingSpinner text="Memuat data pengguna..." />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-lightest-slate mb-8">Manajemen Pengguna</h1>

                {/* Bagian Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard title="Total Pengguna" value={stats.total} icon={<svg className="h-6 w-6 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <StatCard title="Researcher" value={stats.researchers} icon={<svg className="h-6 w-6 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                    <StatCard title="Volunteer" value={stats.volunteers} icon={<svg className="h-6 w-6 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                </div>
                
                <div className="bg-light-navy rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-navy">
                            <thead className="bg-navy/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Peran</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy">
                                {/* PERBAIKAN: Cek panjang array yang sudah difilter */}
                                {manageableUsers.length > 0 ? (
                                    manageableUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-navy/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-lightest-slate">{user.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'researcher' ? 'bg-cyan-200 text-cyan-800' : 'bg-slate-700 text-slate-300'}`}>{user.role}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button onClick={() => setEditingUser(user)} className="p-2 rounded-md hover:bg-cyan/10 text-cyan transition-colors" title="Edit Pengguna">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Hapus Pengguna">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState 
                                        icon={<svg className="h-12 w-12 text-slate/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                        title="Tidak Ada Pengguna"
                                        message="Saat ini tidak ada pengguna dengan peran Volunteer atau Researcher."
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {editingUser && (
                <EditUserModal 
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUpdateUser}
                />
            )}
        </>
    );
}

export default AdminUserManagement;