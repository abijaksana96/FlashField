import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

// Komponen untuk merender satu field input secara dinamis
const DynamicFormField = ({ field, value, onChange }) => {
    const commonClasses = "w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate/50 focus:border-cyan focus:ring-1 focus:ring-cyan focus:outline-none transition-colors";

    switch (field.type) {
        case 'number':
            return <input type="number" name={field.name} value={value || ''} onChange={onChange} className={commonClasses} required={field.required} min={field.min_value} max={field.max_value} />;
        case 'textarea':
            return <textarea name={field.name} value={value || ''} onChange={onChange} rows="4" className={commonClasses} required={field.required} minLength={field.min_length} maxLength={field.max_length} />;
        case 'select':
            return (
                <select name={field.name} value={value || ''} onChange={onChange} className={commonClasses} required={field.required}>
                    <option value="" disabled>Pilih salah satu...</option>
                    {field.options && field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            );
        case 'text':
        default:
            return <input type="text" name={field.name} value={value || ''} onChange={onChange} className={commonClasses} required={field.required} minLength={field.min_length} maxLength={field.max_length} />;
    }
};

function Submission() {
    const { id: experimentId } = useParams();
    const navigate = useNavigate();

    const [experiment, setExperiment] = useState(null);
    const [formData, setFormData] = useState({});
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        const fetchExperimentSchema = async () => {
            try {
                const response = await apiClient.get(`/experiments/${experimentId}/fields`);
                setExperiment(response.data);
                const initialFormData = {};
                if (response.data.input_fields) {
                    response.data.input_fields.forEach(field => {
                        initialFormData[field.name] = '';
                    });
                }
                setFormData(initialFormData);
            } catch (err) {
                setError("Tidak dapat memuat formulir submisi.");
            } finally {
                setLoading(false);
            }
        };
        fetchExperimentSchema();
    }, [experimentId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };
    
    const handleGetLocation = () => {
        setLocationError('');
        if (!navigator.geolocation) {
            setLocationError('Geolocation tidak didukung oleh browser Anda.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toFixed(6));
                setLongitude(position.coords.longitude.toFixed(6));
            },
            () => {
                setLocationError('Tidak dapat mengakses lokasi. Pastikan Anda telah memberikan izin.');
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        
        // PERBAIKAN: Sertakan experiment_id di dalam payload
        const payload = {
            experiment_id: parseInt(experimentId, 10), // <-- TAMBAHKAN INI
            data_json: formData
        };

        if (experiment.require_location) {
            if (!latitude || !longitude) {
                setError('Lokasi wajib diisi untuk eksperimen ini.');
                setSubmitting(false);
                return;
            }
            payload.geo_lat = parseFloat(latitude);
            payload.geo_lng = parseFloat(longitude);
        }

        try {
            await apiClient.post(`/experiments/${experimentId}/submissions`, payload);
            alert('Data berhasil dikirim! Terima kasih atas kontribusi Anda.');
            navigate(`/experiments/${experimentId}`);
        } catch (err) {
            setError(err.response?.data?.detail || 'Gagal mengirim data. Pastikan semua field terisi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-cyan">Memuat formulir...</div>;
    if (!experiment) return <div className="text-center py-20 text-red-400">{error || 'Eksperimen tidak ditemukan.'}</div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="mb-8">
                <Link to={`/experiments/${experimentId}`} className="text-sm text-slate hover:text-cyan">&larr; Kembali ke Detail</Link>
                <h1 className="text-4xl font-extrabold text-lightest-slate mt-2">Submit Data untuk:</h1>
                <p className="text-2xl text-cyan">{experiment.title}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 bg-light-navy p-8 rounded-lg">
                {experiment.require_location && (
                    <fieldset>
                        <legend className="text-xl font-bold text-lightest-slate mb-4">1. Tentukan Lokasi Anda</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="latitude" className="block text-slate text-sm font-medium mb-2">Latitude</label>
                                <input type="number" id="latitude" value={latitude} className="w-full p-3 bg-navy text-lightest-slate rounded-md" readOnly placeholder="Klik tombol di bawah..." />
                            </div>
                            <div>
                                <label htmlFor="longitude" className="block text-slate text-sm font-medium mb-2">Longitude</label>
                                <input type="number" id="longitude" value={longitude} className="w-full p-3 bg-navy text-lightest-slate rounded-md" readOnly placeholder="Klik tombol di bawah..." />
                            </div>
                        </div>
                        <button type="button" onClick={handleGetLocation} className="mt-4 btn-cyan text-sm font-medium py-2 px-4 rounded-md">
                            Gunakan Lokasi Saya Sekarang
                        </button>
                        {locationError && <p className="text-red-400 text-sm mt-2">{locationError}</p>}
                    </fieldset>
                )}

                <fieldset>
                    <legend className="text-xl font-bold text-lightest-slate mb-4">
                        {experiment.require_location ? '2. Isi Data Pengamatan' : '1. Isi Data Pengamatan'}
                    </legend>
                    <div className="space-y-4">
                        {experiment.input_fields && experiment.input_fields.length > 0 ? (
                            experiment.input_fields.map(field => (
                                <div key={field.name}>
                                    <label htmlFor={field.name} className="block text-slate text-sm font-medium mb-2">
                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                    </label>
                                    <DynamicFormField 
                                        field={field} 
                                        value={formData[field.name]} 
                                        onChange={handleInputChange} 
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-slate italic">Eksperimen ini tidak memerlukan input data spesifik.</p>
                        )}
                    </div>
                </fieldset>
                
                {error && <p className="text-red-400 text-center bg-red-500/10 p-3 rounded-md">{error}</p>}
                
                <div className="text-center pt-4">
                    <button type="submit" disabled={submitting} className="btn-cyan-solid font-bold py-3 px-12 rounded-md text-lg disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {submitting ? 'Mengirim...' : 'Kirim Data'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Submission;