import logger from '../../config/logger.js';
import {getProfile} from '../../services/user/user.service.js'

const getProfileController = async (req, res) => {
    try {
        const userId = req.userId;
    const result = await getProfile(userId);
    logger.info(`Profile fetch result for userId ${userId}`);
    return res.status(201).json(result);
    } catch (error) {
        logger.error(error,"Error in getProfileController");
        res.status(500).json({success:false, message:error.message});
    }
}

export {
    getProfileController
}