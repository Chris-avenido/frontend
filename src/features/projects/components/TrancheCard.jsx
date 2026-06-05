import React from 'react';

const TrancheCard = ({ title, count, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="brand-card brand-card-hover brand-focus h-[106px] rounded-[var(--radius-lg)] px-5 text-center"
    >
        <div className="flex h-full flex-col items-center justify-center">
            <p className="text-sm font-bold text-[var(--ink-soft)] md:text-base">{title}</p>
            <p className="mt-3 text-3xl font-extrabold leading-none text-[var(--ink)]">{count.toLocaleString()}</p>
        </div>
    </button>
);

export default TrancheCard;
