import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

// Komponen untuk loading dan error
const LoadingSpinner = () => (
    <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="mt-4 text-cyan">Memuat Profil...</p>
    </div>
);
const ErrorMessage = ({ message }) => <div className="text-center py-20 text-red-400">{message}</div>;

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State untuk form edit
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ fullName: '', email: '' });
    const [editError, setEditError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // State untuk konfirmasi hapus akun
    const [isConfirmingDelete, setConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // Mengambil data pengguna saat halaman dimuat
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get('/users/me');
                setUser(response.data);
                // Inisialisasi data untuk form edit
                setEditData({ 
                    fullName: response.data.full_name, 
                    email: response.data.email 
                });
            } catch (err) {
                console.error("Gagal mengambil data pengguna:", err);
                setError('Gagal memuat profil. Silakan coba login kembali.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Fungsi untuk update profil
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setEditError('');
        try {
            // Backend mengharapkan full_name, bukan fullName
            const payload = { full_name: editData.fullName, email: editData.email };
            
            // Memanggil endpoint PUT /users/me yang sudah benar
            const response = await apiClient.put('/users/me', payload); 
            
            setUser(response.data); // Perbarui tampilan dengan data baru
            setIsEditing(false);    // Tutup form edit
            alert('Profil berhasil diperbarui!');
        } catch (err) {
            console.error("Gagal memperbarui profil:", err);
            setEditError(err.response?.data?.detail || 'Terjadi kesalahan saat memperbarui profil.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Fungsi untuk menangani penghapusan akun
    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setDeleteError('');
        try {
            // Memanggil endpoint DELETE /users/me
            await apiClient.delete('/users/me');
            localStorage.removeItem('accessToken');
            alert('Akun Anda telah berhasil dihapus.');
            navigate('/');
        } catch (err) {
            console.error("Gagal menghapus akun:", err);
            setDeleteError(err.response?.data?.detail || 'Terjadi kesalahan saat menghapus akun.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error && !user) return <ErrorMessage message={error} />;
    if (!user) return <ErrorMessage message="Tidak dapat menemukan data pengguna." />;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Kartu Informasi Profil */}
            <div className="bg-light-navy p-8 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-extrabold text-lightest-slate">{user.full_name}</h1>
                        <p className="text-lg text-slate mt-1">{user.email}</p>
                        <span className="mt-4 inline-block bg-cyan/10 text-cyan text-xs font-bold px-3 py-1 rounded-full">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                    </div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="btn-cyan font-bold py-2 px-6 rounded-md flex-shrink-0">
                            Edit Profil
                        </button>
                    )}
                </div>

                {/* Form Edit */}
                {isEditing && (
                    <div className="mt-8 border-t border-navy/50 pt-8">
                        <h2 className="text-xl font-bold text-lightest-slate mb-6">Edit Informasi Profil</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label htmlFor="fullName" className="block text-slate text-sm font-medium mb-2">Nama Lengkap</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={editData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-navy text-lightest-slate rounded-md"
                                />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-slate text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-navy text-lightest-slate rounded-md"
                                />
                            </div>
                            {editError && <p className="text-red-400 text-sm">{editError}</p>}
                            <div className="flex items-center gap-4">
                                <button type="submit" disabled={isUpdating} className="btn-cyan-solid font-bold py-2 px-6 rounded-md">
                                    {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="text-slate hover:text-lightest-slate">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Zona Berbahaya untuk Hapus Akun */}
            <div className="mt-10 bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-red-300">Zona Berbahaya</h2>
                <p className="text-slate mt-2">Tindakan berikut tidak dapat diurungkan. Harap berhati-hati.</p>
                <div className="mt-4">
                    {!isConfirmingDelete ? (
                        <button 
                            onClick={() => setConfirmingDelete(true)} 
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Hapus Akun Saya
                        </button>
                    ) : (
                        <div className="bg-navy p-4 rounded-md">
                            <p className="text-light-slate mb-4">Apakah Anda yakin ingin menghapus akun Anda secara permanen?</p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun Saya'}
                                </button>
                                <button 
                                    onClick={() => setConfirmingDelete(false)} 
                                    className="text-slate hover:text-lightest-slate"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}
                     {deleteError && <p className="text-red-400 text-sm mt-4">{deleteError}</p>}
                </div>
            </div>
        </div>
    );
}

export default Profile;