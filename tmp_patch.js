const fs = require('fs');

try {
    // Patch eco.js
    const p1 = 'c:\\\\Users\\\\Ancita\\\\Desktop\\\\PLM\\\\backend\\\\routes\\\\eco.js';
    let c1 = fs.readFileSync(p1, 'utf8');

    const regex1 = /        if \(nextStage\) eco\.stage = nextStage\._id;\r?\n        eco\.status = \'Completed\';\r?\n\r?\n        \/\/ Apply product\/BOM updates\r?\n        await executeFinalization\(eco, session\);/;

    if (regex1.test(c1)) {
        c1 = c1.replace(regex1, `        if (nextStage) {
            eco.stage = nextStage._id;
            if (nextStage.isFinal) {
                eco.status = 'Completed';
                await executeFinalization(eco, session);
            }
        } else {
            eco.status = 'Completed';
            await executeFinalization(eco, session);
        }`);
        fs.writeFileSync(p1, c1, 'utf8');
        console.log("Patched eco.js successfully.");
    } else {
        console.log("Regex for eco.js did not match. Skipping...");
    }

    // Patch ECOView.jsx
    const p2 = 'c:\\\\Users\\\\Ancita\\\\Desktop\\\\PLM\\\\frontend\\\\src\\\\components\\\\ECOView.jsx';
    let c2 = fs.readFileSync(p2, 'utf8');

    const regex2 = /                    \{\!readOnlyReport && currentStepIndex === 2 && \['Approver', 'Admin'\]\.includes\(user\?\.role\) && \(\r?\n                        <button onClick=\{handleApprove\} className=\"bg-green-600 hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm\">\r?\n                            <CheckSquare size=\{14\} \/> APPROVE\r?\n                        <\/button>\r?\n                    \)\}/;

    if (regex2.test(c2)) {
        c2 = c2.replace(regex2, `                    {!readOnlyReport && currentStepIndex === 2 && ['Approver', 'Admin'].includes(user?.role) && (
                        stage?.approvals?.length > 0 ? (
                            <button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                                <CheckSquare size={14} /> APPROVE
                            </button>
                        ) : (
                            <button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                                <CheckSquare size={14} /> VALIDATE
                            </button>
                        )
                    )}`);
        fs.writeFileSync(p2, c2, 'utf8');
        console.log("Patched ECOView.jsx successfully.");
    } else {
        console.log("Regex for ECOView.jsx did not match. Skipping...");
    }

} catch (err) {
    console.error("Error:", err);
}
