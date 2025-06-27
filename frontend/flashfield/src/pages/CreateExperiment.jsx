import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

// Komponen untuk satu baris field di dalam form builder
const FormFieldBuilderRow = ({ field, index, onRemove }) => (
    <div className="flex items-center gap-2 p-2 bg-navy rounded">
        <span className="text-light-slate flex-grow">{field.label} ({field.name}) - Tipe: {field.type}</span>
        <button type="button" onClick={() => onRemove(index)} className="text-red-400 hover:text-red-300 text-xs">Hapus</button>
    </div>
);


function CreateExperiment() {
    const navigate = useNavigate();

    // State untuk form utama
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [requireLocation, setRequireLocation] = useState(true);
    const [inputFields, setInputFields] = useState([]);

    // State untuk form builder (untuk menambah field baru)
    const [newField, setNewField] = useState({
        name: '', label: '', type: 'text', required: true, options: ''
    });

    // State untuk UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleNewFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewField(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAddField = () => {
        // Validasi sederhana
        if (!newField.name || !newField.label) {
            alert('Nama Field dan Label wajib diisi.');
            return;
        }
        
        const fieldToAdd = {
            name: newField.name.toLowerCase().replace(/\s+/g, '_'), // Sanitasi nama field
            label: newField.label,
            type: newField.type,
            required: newField.required,
            options: newField.type === 'select' ? newField.options.split(',').map(opt => opt.trim()) : null,
        };

        setInputFields(prev => [...prev, fieldToAdd]);
        // Reset form builder
        setNewField({ name: '', label: '', type: 'text', required: true, options: '' });
    };

    const handleRemoveField = (indexToRemove) => {
        setInputFields(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            title,
            description,
            deadline: deadline ? new Date(deadline).toISOString() : null,
            require_location: requireLocation,
            input_fields: inputFields,
        };

        try {
            const response = await apiClient.post('/experiments', payload);
            alert('Eksperimen berhasil dibuat!');
            navigate(`/experiments/${response.data.id}`);
        } catch (err) {
            console.error("Gagal membuat eksperimen:", err);
            setError(err.response?.data?.detail || "Terjadi kesalahan. Pastikan Anda memiliki hak akses.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-extrabold text-lightest-slate mb-8">Buat Eksperimen Baru</h1>
            
            <form onSubmit={handleSubmit} className="space-y-10">
                {/* --- Detail Dasar Eksperimen --- */}
                <fieldset className="bg-light-navy p-6 rounded-lg space-y-4">
                    <legend className="text-xl font-bold text-cyan -mb-2 px-2">Informasi Dasar</legend>
                    <div>
                        <label htmlFor="title" className="block text-slate text-sm font-medium mb-2">Judul Eksperimen</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-navy text-lightest-slate rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-slate text-sm font-medium mb-2">Deskripsi</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="w-full p-3 bg-navy text-lightest-slate rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="deadline" className="block text-slate text-sm font-medium mb-2">Deadline (Opsional)</label>
                        <input type="datetime-local" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-3 bg-navy text-lightest-slate rounded-md" />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="requireLocation" checked={requireLocation} onChange={e => setRequireLocation(e.target.checked)} className="h-4 w-4 rounded bg-navy text-cyan focus:ring-cyan" />
                        <label htmlFor="requireLocation" className="text-slate text-sm font-medium">Wajibkan data lokasi (GPS)</label>
                    </div>
                </fieldset>

                {/* --- Form Builder --- */}
                <fieldset className="bg-light-navy p-6 rounded-lg space-y-4">
                    <legend className="text-xl font-bold text-cyan -mb-2 px-2">Formulir Input untuk Volunteer</legend>
                    
                    {/* Daftar field yang sudah ditambahkan */}
                    <div className="space-y-2">
                        {inputFields.length > 0 ? (
                            inputFields.map((field, index) => (
                                <FormFieldBuilderRow key={index} field={field} index={index} onRemove={handleRemoveField} />
                            ))
                        ) : (
                            <p className="text-slate text-sm italic text-center py-4">Belum ada field input. Tambahkan di bawah.</p>
                        )}
                    </div>

                    {/* Form untuk menambah field baru */}
                    <div className="border-t border-navy/50 pt-4 space-y-4">
                        <h4 className="text-lg font-semibold text-lightest-slate">Tambah Field Baru</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="label" value={newField.label} onChange={handleNewFieldChange} placeholder="Label (e.g., Suhu Udara)" className="w-full p-2 bg-navy rounded-md" />
                            <input type="text" name="name" value={newField.name} onChange={handleNewFieldChange} placeholder="Nama Field (e.g., suhu_udara)" className="w-full p-2 bg-navy rounded-md" />
                        </div>
                        <select name="type" value={newField.type} onChange={handleNewFieldChange} className="w-full p-2 bg-navy rounded-md">
                            <option value="text">Teks Singkat</option>
                            <option value="textarea">Teks Panjang</option>
                            <option value="number">Angka</option>
                            <option value="select">Pilihan</option>
                        </select>
                        {newField.type === 'select' && (
                            <input type="text" name="options" value={newField.options} onChange={handleNewFieldChange} placeholder="Pilihan, pisahkan dengan koma (e.g., Cerah,Berawan)" className="w-full p-2 bg-navy rounded-md" />
                        )}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="required" name="required" checked={newField.required} onChange={handleNewFieldChange} className="h-4 w-4 rounded bg-navy" />
                                <label htmlFor="required" className="text-slate text-sm">Wajib diisi</label>
                            </div>
                            <button type="button" onClick={handleAddField} className="btn-cyan font-bold py-1 px-4 rounded-md text-sm">Tambah Field</button>
                        </div>
                    </div>
                </fieldset>
                
                {error && <p className="text-red-400 text-center">{error}</p>}
                
                {/* Tombol Submit Utama */}
                <div className="text-center pt-4">
                     <button type="submit" disabled={loading} className="btn-cyan-solid font-bold py-3 px-12 rounded-md text-lg">
                        {loading ? 'Membuat Eksperimen...' : 'Publikasikan Eksperimen'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateExperiment;