import React from 'react';
import { Link } from 'react-router-dom';

const ExperimentCard = ({ experiment }) => {
    return (
        <div className="card-bg rounded-lg overflow-hidden flex flex-col h-full hover:shadow-cyan-500/20 shadow-lg">
            <div className="p-6 flex-grow">
                <p className="text-sm text-cyan mb-2">Oleh: {experiment.owner?.full_name || 'Peneliti'}</p>
                <h3 className="text-xl font-bold text-lightest-slate mb-3">{experiment.title}</h3>
                <p className="text-slate text-sm line-clamp-3">{experiment.description}</p>
            </div>
            <div className="p-6 border-t border-navy/50 mt-auto">
                <Link to={`/experiments/${experiment.id}`} className="text-sm font-bold text-cyan hover:underline">
                    Lihat Detail & Submit
                </Link>
            </div>
        </div>
    );
};

export default ExperimentCard;