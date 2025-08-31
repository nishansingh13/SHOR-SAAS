import Razorpay from "razorpay";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Explicitly load env (defensive – backend/index.js loads it too, but this keeps the module standalone)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const keyId = (process.env.RZP_ID || '').trim();
const keySecret = (process.env.RZP_KS || '').trim();
if (!keyId || !keySecret) {
    console.error('[razorpay] Missing credentials. Present keys:', Object.keys(process.env).filter(k => k.startsWith('RZP_')));
    throw new Error('Razorpay credentials not found. Ensure RZP_ID & RZP_KS are set in backend/.env and restart server.');
}

const isTest = keyId.startsWith('rzp_test');
if (isTest) {
    console.log('[razorpay] Using TEST credentials (rzp_test...).');
} else if (keyId.startsWith('rzp_live')) {
    console.log('[razorpay] Using LIVE credentials (rzp_live...).');
} else {
    console.warn('[razorpay] Key format unexpected – double‑check RZP_ID.');
}

const rzp = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
    headers: { 'User-Agent': 'shor-saas-backend/1.0' }
});

export default rzp;
