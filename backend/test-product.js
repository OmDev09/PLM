const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const AuditLog = require('./models/AuditLog');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plm');
        console.log('Connected to DB');

        const product = new Product({ name: 'Test', price: 10, costPrice: 0, attachments: [] });
        await product.save();
        console.log('Product saved successfully:', product._id);

        const obj = product.toObject();
        console.log('To Object:', obj);

        const log = new AuditLog({
            action: 'PRODUCT_CREATED',
            entityId: product._id,
            oldValue: null,
            newValue: obj,
            user: new mongoose.Types.ObjectId()
        });

        await log.save();
        console.log('AuditLog saved successfully:', log._id);

    } catch (err) {
        console.error('TRACE ERROR:', err);
    } finally {
        process.exit(0);
    }
}
run();
