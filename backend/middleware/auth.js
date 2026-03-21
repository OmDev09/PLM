const jwt = require('jsonwebtoken');

function verifyToken(req, res, next, roles = []) {
    let token = req.header('Authorization');
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
    } else {
        token = req.header('x-auth-token');
    }

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hackathon_secret_123');
        req.user = decoded.user;

        if (roles.length && !roles.includes(req.user.role) && req.user.role !== 'Admin') {
            return res.status(403).json({ msg: `Forbidden: Requires one of roles: ${roles.join(', ')}` });
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}

module.exports = function (reqOrRoles, res, next) {
    if (Array.isArray(reqOrRoles) || typeof reqOrRoles === 'string') {
        const roles = Array.isArray(reqOrRoles) ? reqOrRoles : [reqOrRoles];
        return (req, res, next) => verifyToken(req, res, next, roles);
    }

    if (reqOrRoles && res && next) {
        return verifyToken(reqOrRoles, res, next, []);
    }

    return (req, res, next) => verifyToken(req, res, next, []);
};
