const fs = require('fs');
const path = 'e:\\christop\\finance\\frontend\\src\\pages\\Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/import \{ clearSessionUser, getSessionUser \} from '\.\.\/utils\/authSession';/g, "import { clearSessionUser, getSessionUser } from '../utils/authSession';\nimport './Dashboard.css';");

content = content.replace(/bg-\[var\(--brand-sky\)\] text-\[var\(--brand-navy\)\]/g, "bg-[var(--blue-50)] text-[var(--navy)]");
content = content.replace(/bg-\[var\(--brand-gold-soft\)\] text-\[var\(--brand-navy\)\]/g, "bg-amber-50 text-[var(--navy)]");
content = content.replace(/bg-\[var\(--brand-red-soft\)\] text-\[var\(--brand-red\)\]/g, "bg-red-50 text-[var(--red)]");

content = content.replace(/<div className="flex h-screen bg-\[\#F8FAFC\] font-sans overflow-hidden">/g, "<div className=\"flex h-screen overflow-hidden text-[var(--text)]\" style={{ fontFamily: 'var(--font-body)' }}>");

content = content.replace(/<h1 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight drop-shadow-sm">/g, "<h1 className=\"text-2xl sm:text-3xl font-black text-white capitalize tracking-tight drop-shadow-sm\" style={{ fontFamily: 'var(--font-heading)' }}>");
content = content.replace(/<p className="text-\[\#A3C6E8\] font-bold text-sm md:text-base mt-0\.5 uppercase tracking-\[0\.15em\] drop-shadow-sm">/g, "<p className=\"text-[#A3C6E8] font-bold text-sm md:text-base mt-0.5 uppercase tracking-[0.15em] drop-shadow-sm\" style={{ fontFamily: 'var(--font-body)' }}>");

content = content.replace(/<div className="bg-white rounded-\[2rem\] shadow-sm p-4 sm:p-5 space-y-3 border border-slate-100">/g, '<div className="dashboard-card !flex-col !items-stretch !gap-0 p-4 sm:p-5 space-y-3">');

content = content.replace(/<motion\.div key="detail-view" initial=\{\{ x: 50, opacity: 0 \}\} animate=\{\{ x: 0, opacity: 1 \}\} exit=\{\{ x: -50, opacity: 0 \}\} transition=\{\{ type: 'spring', stiffness: 300, damping: 30 \}\} className="bg-white rounded-\[2rem\] shadow-sm p-6 sm:p-8 min-h-\[400px\] border border-slate-100">/g, '<motion.div key="detail-view" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ type: \'spring\', stiffness: 300, damping: 30 }} className="dashboard-card !flex-col !items-stretch !gap-0 p-6 sm:p-8 min-h-[400px]">');

content = content.replace(/<button onClick=\{\(\) => setShowLogoutModal\(true\)\} className="w-full flex items-center justify-between p-6 rounded-\[2rem\] bg-white border border-red-100 hover:border-red-300 hover:shadow-md transition-all group overflow-hidden relative">/g, '<button onClick={() => setShowLogoutModal(true)} className="dashboard-card !gap-0 w-full flex items-center justify-between p-6 hover:border-[var(--red)]/30 hover:shadow-md transition-all group overflow-hidden relative">');

content = content.replace(/var\(--brand-navy\)/g, "var(--navy)");
content = content.replace(/var\(--brand-sky\)/g, "var(--blue-50)");
content = content.replace(/var\(--brand-red\)/g, "var(--red)");
content = content.replace(/var\(--brand-gold\)/g, "var(--gold)");
content = content.replace(/var\(--brand-red-soft\)/g, "var(--red)/10");
content = content.replace(/var\(--brand-gold-soft\)/g, "var(--gold)/20");
content = content.replace(/var\(--brand-navy-deep\)/g, "var(--blue)");

if (!content.includes("document.body.classList.add('dashboard-body')")) {
    content = content.replace(/const sessionUser = getSessionUser\(\);\s*const userId = sessionUser\?\.uid;/g, "const sessionUser = getSessionUser();\n    const userId = sessionUser?.uid;\n\n    useEffect(() => {\n        document.body.classList.add('dashboard-body');\n        return () => {\n            document.body.classList.remove('dashboard-body');\n        };\n    }, []);");
}

fs.writeFileSync(path, content, 'utf8');
console.log('Update Complete');
