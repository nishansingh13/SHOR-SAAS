import jwt from 'jsonwebtoken';

export const verifyUser = (req, res, next) => {
    // accept case-insensitive header and trim whitespace
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            console.warn("Auth failed: Missing Authorization header for", req.method, req.originalUrl);
            return res.status(401).json({ message: "Missing Authorization header" });
    }

        const token = authHeader.replace("Bearer ", "");

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('[auth] JWT_SECRET is not set');
            return res.status(500).json({ message: 'Server misconfiguration' });
        }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
            console.log("Auth OK:", req.method, req.originalUrl, "user:", req.user);
        next();
    } catch (error) {
            console.warn("Auth failed: Invalid token for", req.method, req.originalUrl, error?.message);
            return res.status(401).json({ message: "Invalid or expired token" });
    }
};
