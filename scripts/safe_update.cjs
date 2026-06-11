const fs = require('fs');
const path = 'e:\\christop\\finance\\frontend\\src\\pages\\Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replaceAll('var(--brand-navy)', 'var(--navy)');
content = content.replaceAll('var(--brand-sky)', 'var(--blue-50)');
content = content.replaceAll('var(--brand-red)', 'var(--red)');
content = content.replaceAll('var(--brand-gold)', 'var(--gold)');
content = content.replaceAll('var(--brand-red-soft)', 'var(--red-soft)');
content = content.replaceAll('var(--brand-gold-soft)', 'var(--gold-soft)');
content = content.replaceAll('var(--brand-navy-deep)', 'var(--blue)');

if (!content.includes("document.body.classList.add('dashboard-body')")) {
    content = content.replace('const userId = sessionUser?.uid;', "const userId = sessionUser?.uid;\n\n    useEffect(() => {\n        document.body.classList.add('dashboard-body');\n        return () => {\n            document.body.classList.remove('dashboard-body');\n        };\n    }, []);");
}

fs.writeFileSync(path, content, 'utf8');
console.log('Safe replacement complete');
