const fs = require('fs');
const path = 'e:\\christop\\finance\\frontend\\src\\pages\\Login.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replaceAll("import logo from '../assets/new_logo.png';", "import logo from '../assets/new_logo.png';\nimport './Dashboard.css';");

content = content.replaceAll("var(--brand-navy)", "var(--navy)");
content = content.replaceAll("var(--brand-navy-deep)", "var(--blue)");
content = content.replaceAll("var(--brand-gold)", "var(--gold)");
content = content.replaceAll("var(--brand-red)", "var(--red)");
content = content.replaceAll("var(--ink)", "var(--navy)");
content = content.replaceAll("var(--ink-soft)", "var(--muted)");

// Fix alpha custom properties
content = content.replaceAll("bg-[var(--navy)]/10", "bg-[#08315F]/10");
content = content.replaceAll("bg-[var(--gold)]/20", "bg-[#FBBF24]/20");
content = content.replaceAll("bg-[var(--gold)]/24", "bg-[#FBBF24]/24");

// Apply font families
content = content.replaceAll('className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"', 'className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight" style={{ fontFamily: \'var(--font-heading)\' }}');
content = content.replaceAll('className="text-center text-3xl font-extrabold tracking-tight text-[var(--navy)]"', 'className="text-center text-3xl font-extrabold tracking-tight text-[var(--navy)]" style={{ fontFamily: \'var(--font-heading)\' }}');
content = content.replaceAll('className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden py-8 font-sans sm:py-10"', 'className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden py-8 sm:py-10 text-[var(--text)]" style={{ fontFamily: \'var(--font-body)\' }}');

// Replace card classes
content = content.replaceAll('brand-card', 'dashboard-card !gap-0 !p-0 !flex-row');

// Inject useEffect for dashboard-body
if (!content.includes("document.body.classList.add('dashboard-body')")) {
    content = content.replace('useEffect(() => {\n    const loadRegions', "useEffect(() => {\n    document.body.classList.add('dashboard-body');\n    return () => document.body.classList.remove('dashboard-body');\n  }, []);\n\n  useEffect(() => {\n    const loadRegions");
}

fs.writeFileSync(path, content, 'utf8');
console.log('Login update complete');
