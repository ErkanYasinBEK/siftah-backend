const User = require('../models/user');

const updateActivity = async (req, res, next) => {
    if (req.userData && req.userData.userId) {
        try {
            await User.update(
                { lastActiveAt: new Date() },
                { where: { id: req.userData.userId } }
            );
        } catch (error) {
            console.error("Son görülme güncellenemedi", error);
        }
    }
    next();
};

module.exports = updateActivity;