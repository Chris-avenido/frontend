export const encodeProjectId = (projectId) => {
    const encoded = window.btoa(String(projectId));
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const hasTrancheAmount = (value) => Number(value || 0) > 0;

export const getLatestTrancheStatus = (fund = {}) => {
    if (hasTrancheAmount(fund.tranche_3)) return 'Tranche 3';
    if (hasTrancheAmount(fund.tranche_2)) return 'Tranche 2';
    if (hasTrancheAmount(fund.tranche_1)) return 'Tranche 1';
    return 'No Tranche';
};

export const getLatestTrancheAmount = (fund = {}) => {
    const status = fund.latest_tranche_status || getLatestTrancheStatus(fund);

    if (status === 'Tranche 3') return fund.tranche_3;
    if (status === 'Tranche 2') return fund.tranche_2;
    if (status === 'Tranche 1') return fund.tranche_1;
    return 0;
};

export const getProjectTitle = (project = {}) => {
    const projectName = project.project_name || '';
    const schoolName = project.school_name || '';
    const schoolId = project.school_id || '';
    const schoolLabel = [schoolName, schoolId].filter(Boolean).join(' | ');

    if (projectName && schoolLabel) return `${projectName} (${schoolLabel})`;
    if (projectName) return projectName;

    return schoolLabel || 'Unknown School';
};

export const getStatusStyle = (status) => {
    const normalizedStatus = String(status ?? '').toLowerCase();

    if (normalizedStatus.includes('complete')) {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (normalizedStatus.includes('progress') || normalizedStatus.includes('active') || normalizedStatus.includes('ongoing')) {
        return 'border-[var(--brand-navy)]/20 bg-[var(--brand-sky)] text-[var(--brand-navy)]';
    }

    return 'border-[var(--brand-gold)]/35 bg-[var(--brand-gold-soft)] text-[var(--brand-navy)]';
};
