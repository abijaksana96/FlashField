import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const LoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-slate-700 rounded w-1/2 mb-8"></div>
        <div className="bg-light-navy p-6 rounded-lg space-y-4">
             <div className="h-8 bg-slate-700 rounded w-1/4"></div>
             <div className="h-12 bg-slate-700 rounded w-full"></div>
        </div>
        <div className="bg-light-navy p-6 rounded-lg space-y-4 mt-10">
             <div className="h-8 bg-slate-700 rounded w-1/4"></div>
             <div className="h-12 bg-slate-700 rounded w-full"></div>
        </div>
    </div>
);
const FormFieldBuilderRow = ({ field, index, onRemove }) => (
    <div className="flex items-center gap-2 p-3 bg-navy rounded-md border border-slate-700">
        <span className="text-cyan font-mono text-xs p-1 bg-slate-700 rounded">{field.type}</span>
        <div className="flex-grow">
            <p className="text-lightest-slate font-medium">{field.label}</p>
            <p className="text-xs text-slate">Nama field: <span className="font-mono">{field.name}</span>{field.unit && `, Satuan: ${field.unit}`}</p>
        </div>
        <button type="button" onClick={() => onRemove(index)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Hapus Field">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        </button>
    </div>
);
const LoadingOverlay = ({ text }) => (
    <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <p className="mt-4 text-cyan text-lg">{text}</p>
    </div>
);

function EditExperimentPage() {
    const { id: experimentId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [requireLocation, setRequireLocation] = useState(true);
    const [inputFields, setInputFields] = useState([]);
    const [newField, setNewField] = useState({ name: '', label: '', type: 'text', required: true, unit: '', placeholder: '', options: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchExperimentData = async () => {
            if (!experimentId) return;
            setLoading(true);
            try {
                const response = await apiClient.get(`/experiments/${experimentId}`);
                const exp = response.data;
                
                if (user && exp.owner?.id !== user.id) {
                    setError("Anda tidak memiliki izin untuk mengedit eksperimen ini.");
                    return;
                }
                
                setTitle(exp.title);
                setDescription(exp.description);
                if (exp.deadline) {
                    const date = new Date(exp.deadline);
                    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                    setDeadline(localDate.toISOString().slice(0, 16));
                } else {
                    setDeadline('');
                }
                setRequireLocation(exp.require_location);
                setInputFields(exp.input_fields || []);
            } catch (err) {
                setError("Gagal memuat data eksperimen.");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchExperimentData();
        }
    }, [experimentId, user, authLoading]);

    const handleNewFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewField(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDeadlineChange = (e) => {
        const newDeadline = e.target.value;
        setDeadline(newDeadline);
        
        if (newDeadline) {
            const deadlineDate = new Date(newDeadline);
            const now = new Date();
            
            if (deadlineDate <= now) {
                setError('Deadline harus lebih dari waktu saat ini.');
            } else {
                if (error === 'Deadline harus lebih dari waktu saat ini.') {
                    setError('');
                }
            }
        } else {
            if (error === 'Deadline harus lebih dari waktu saat ini.') {
                setError('');
            }
        }
    };

    const handleAddField = () => {
        if (!newField.name || !newField.label) {
            alert('Nama Field dan Label wajib diisi.');
            return;
        }
        const fieldToAdd = {
            name: newField.name.toLowerCase().replace(/\s+/g, '_'),
            label: newField.label,
            type: newField.type,
            required: newField.required,
            unit: newField.type === 'number' ? newField.unit : null,
            placeholder: newField.placeholder || null,
            options: (newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && newField.options ? newField.options.split(',').map(opt => opt.trim()) : null,
        };
        setInputFields(prev => [...prev, fieldToAdd]);
        setNewField({ name: '', label: '', type: 'text', required: true, unit: '', placeholder: '', options: '' });
    };

    const handleRemoveField = (indexToRemove) => {
        setInputFields(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        if (deadline) {
            const deadlineDate = new Date(deadline);
            const now = new Date();
            
            if (deadlineDate <= now) {
                setError('Deadline harus lebih dari waktu saat ini.');
                setIsSaving(false);
                return;
            }
        }

        if (inputFields.length === 0) {
            setError('Anda harus menambahkan minimal satu field input.');
            setIsSaving(false);
            return;
        }

        const payload = {
            title,
            description,
            deadline: deadline ? new Date(deadline + ':00').toISOString() : null,
            require_location: requireLocation,
            input_fields: inputFields,
        };

        try {
            await apiClient.put(`/experiments/${experimentId}`, payload);
            alert('Eksperimen berhasil diperbarui!');
            navigate(`/experiments/create/${experimentId}`);
        } catch (err) {
            console.error("Gagal memperbarui eksperimen:", err);
            setError(err.response?.data?.detail || "Gagal menyimpan perubahan.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || authLoading) return <div className="max-w-4xl mx-auto py-12 px-4"><LoadingSkeleton /></div>;
    if (error) return <div className="max-w-4xl mx-auto py-12 px-4"><p className="text-red-400">{error}</p></div>;

    return (
        <>
            {isSaving && <LoadingOverlay text="Menyimpan Perubahan..." />}
            <div className="max-w-4xl mx-auto py-12 px-4">
                 <Link to={`/experiments/create/${experimentId}`} className="text-sm text-slate hover:text-cyan mb-4 inline-block">
                    &larr; Kembali ke Panel Kelola
                </Link>
                <h1 className="text-4xl font-extrabold text-lightest-slate mb-8">Edit Eksperimen</h1>
                
                <form onSubmit={handleSubmit} className="space-y-10">
                    <fieldset className="bg-light-navy p-6 rounded-lg space-y-4">
                        <legend className="text-xl font-bold text-cyan -mb-2 px-2">Informasi Dasar</legend>
                        <div>
                            <label htmlFor="title" className="block text-slate text-sm font-medium mb-2">Judul Eksperimen</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate-700 focus:ring-cyan focus:border-cyan" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-slate text-sm font-medium mb-2">Deskripsi</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate-700 focus:ring-cyan focus:border-cyan" />
                        </div>
                        <div>
                            <label htmlFor="deadline" className="block text-slate text-sm font-medium mb-2">Deadline (Opsional)</label>
                            <input 
                                type="datetime-local" 
                                id="deadline" 
                                value={deadline} 
                                onChange={handleDeadlineChange}
                                min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)} // Minimal 5 menit dari sekarang
                                className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate-700 focus:ring-cyan focus:border-cyan" 
                                style={{ colorScheme: 'dark' }} 
                            />
                            <p className="text-xs text-slate mt-1">Deadline harus lebih dari waktu saat ini</p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input type="checkbox" id="requireLocation" checked={requireLocation} onChange={e => setRequireLocation(e.target.checked)} className="h-4 w-4 rounded bg-navy text-cyan focus:ring-cyan border-slate-700" />
                            <label htmlFor="requireLocation" className="text-slate text-sm font-medium">Wajibkan data lokasi (GPS)</label>
                        </div>
                    </fieldset>

                    <fieldset className="bg-light-navy p-6 rounded-lg space-y-4">
                        <legend className="text-xl font-bold text-cyan -mb-2 px-2">Formulir Input</legend>
                        <div className="space-y-2">
                            {inputFields.length > 0 ? (
                                inputFields.map((field, index) => (
                                    <FormFieldBuilderRow key={index} field={field} index={index} onRemove={handleRemoveField} />
                                ))
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-slate-700 rounded-md">
                                    <p className="text-slate text-sm">Belum ada field input.</p>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-navy/50 pt-6 space-y-4">
                            <h4 className="text-lg font-semibold text-lightest-slate">Tambah Field Baru</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="new-label" className="text-xs text-slate">Label</label>
                                    <input id="new-label" type="text" name="label" value={newField.label} onChange={handleNewFieldChange} placeholder="e.g., Suhu Udara" className="w-full p-2 bg-navy text-lightest-slate rounded-md mt-1 border border-slate-700" />
                                </div>
                                <div>
                                    <label htmlFor="new-name" className="text-xs text-slate">Nama Field (tanpa spasi)</label>
                                    <input id="new-name" type="text" name="name" value={newField.name} onChange={handleNewFieldChange} placeholder="e.g., suhu_udara" className="w-full p-2 bg-navy text-lightest-slate rounded-md mt-1 border border-slate-700" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="new-type" className="text-xs text-slate">Tipe Input</label>
                                <select id="new-type" name="type" value={newField.type} onChange={handleNewFieldChange} className="w-full p-2 bg-navy text-lightest-slate rounded-md mt-1 border border-slate-700">
                                    <option value="text">Teks Singkat</option>
                                    <option value="textarea">Teks Panjang</option>
                                    <option value="number">Angka</option>
                                    <option value="select">Pilihan (Dropdown)</option>
                                    <option value="radio">Pilihan (Radio)</option>
                                    <option value="checkbox">Pilihan (Centang)</option>
                                    <option value="date">Tanggal</option>
                                </select>
                            </div>
                            {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
                                <div>
                                    <label htmlFor="new-options" className="text-xs text-slate">Pilihan (pisahkan koma)</label>
                                    <input id="new-options" type="text" name="options" value={newField.options} onChange={handleNewFieldChange} placeholder="e.g., Cerah, Berawan, Hujan" className="w-full p-2 bg-navy text-lightest-slate rounded-md mt-1 border border-slate-700" />
                                </div>
                            )}
                            {newField.type === 'number' && (
                                <div>
                                    <label htmlFor="new-unit" className="text-xs text-slate">Satuan (opsional)</label>
                                    <input id="new-unit" type="text" name="unit" value={newField.unit} onChange={handleNewFieldChange} placeholder="e.g., °C, dB, meter" className="w-full p-2 bg-navy text-lightest-slate rounded-md mt-1 border border-slate-700" />
                                </div>
                            )}
                             <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="required" name="required" checked={newField.required} onChange={handleNewFieldChange} className="h-4 w-4 rounded bg-navy text-cyan focus:ring-cyan border-slate-700" />
                                    <label htmlFor="required" className="text-slate text-sm">Wajib diisi</label>
                                </div>
                                <button type="button" onClick={handleAddField} className="btn-cyan font-bold py-2 px-4 rounded-md text-sm">Tambah Field</button>
                            </div>
                        </div>
                    </fieldset>

                    {error && <p className="text-red-400 text-center">{error}</p>}
                    
                    <div className="text-center pt-4">
                         <button type="submit" disabled={isSaving} className="btn-cyan-solid font-bold py-3 px-12 rounded-md text-lg">
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default EditExperimentPage;