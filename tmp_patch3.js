const fs = require('fs');
const p1 = 'c:\\\\Users\\\\Ancita\\\\Desktop\\\\PLM\\\\backend\\\\routes\\\\eco.js';
let c1 = fs.readFileSync(p1, 'utf8');

const targetFunctionStart = "router.post('/:id/approve', auth, async (req, res) => {";
const targetFunctionEnd = "// @route   PUT /api/eco/:id/changes";

const startIdx = c1.indexOf(targetFunctionStart);
const endIdx = c1.indexOf(targetFunctionEnd);

if (startIdx !== -1 && endIdx !== -1) {
    const head = c1.substring(0, startIdx);
    const tail = c1.substring(endIdx);

    const replacement = `router.post('/:id/approve', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let eco = await ECO.findById(req.params.id).populate('stage').session(session);
        if (!eco) throw new Error('ECO not found');

        if (eco.status === 'Completed') throw new Error('ECO already completed');

        const currentSeq = eco.stage ? eco.stage.sequence : 0;
        const nextStage = await EcoStage.findOne({ sequence: { $gt: currentSeq } }).sort({ sequence: 1 }).session(session);

        if (nextStage) {
            eco.stage = nextStage._id;
            if (nextStage.isFinal) {
                eco.status = 'Completed';
                await executeFinalization(eco, session);
            }
        } else {
            eco.status = 'Completed';
            await executeFinalization(eco, session);
        }

        await eco.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json(await ECO.findById(eco._id).populate('stage'));
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ msg: err.message || 'Server Error' });
    }
});

`;
    fs.writeFileSync(p1, head + replacement + tail, 'utf8');
    console.log("Patched eco.js successfully.");
} else {
    console.log("Could not find bounds.");
}
