const fs = require('fs');
const p1 = 'c:\\\\Users\\\\Ancita\\\\Desktop\\\\PLM\\\\backend\\\\routes\\\\eco.js';
let lines = fs.readFileSync(p1, 'utf8').split(/\\r?\\n/);

// Lines 184 to 209 (indices 183 to 208)
const replacement = [
    "        if (nextStage) {",
    "            eco.stage = nextStage._id;",
    "            if (nextStage.isFinal) {",
    "                eco.status = 'Completed';",
    "                await executeFinalization(eco, session);",
    "            }",
    "        } else {",
    "            eco.status = 'Completed';",
    "            await executeFinalization(eco, session);",
    "        }",
    "",
    "        await eco.save({ session });",
    "        await session.commitTransaction();",
    "        session.endSession();",
    "        res.json(await ECO.findById(eco._id).populate('stage'));",
    "    } catch (err) {",
    "        await session.abortTransaction();",
    "        session.endSession();",
    "        res.status(400).json({ msg: err.message || 'Server Error' });",
    "    }",
    "});"
];

// Verify we are at the right place
if (lines[183].includes("if (nextStage) {") && lines[208].includes("});")) {
    lines.splice(183, 26, ...replacement);
    fs.writeFileSync(p1, lines.join('\\n'), 'utf8');
    console.log("Patched eco.js successfully.");
} else {
    console.log("Validation failed. Not patching.");
    console.log("Line 184: ", lines[183]);
    console.log("Line 209: ", lines[208]);
}
