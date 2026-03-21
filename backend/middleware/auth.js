const jwt = require('jsonwebtoken');

module.exports = function (roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        (req, res, next) => {
            // Allow Authorization: Bearer token format
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

                // Admin always allowed bypass, otherwise check if role is in array
                if (roles.length && !roles.includes(req.user.role) && req.user.role !== 'Admin') {
                    return res.status(403).json({ msg: `Forbidden: Requires one of roles: ${roles.join(', ')}` });
                }

                next();
            } catch (err) {
                res.status(401).json({ msg: 'Token is not valid' });
            }
        }
    ];
};
