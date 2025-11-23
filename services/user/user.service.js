import User from '../../models/user-model.js';
import logger from '../../config/logger.js';
const getProfile = async(userId)=>{
    try {
        const user = await User.findById(userId).select('-password -__v');
        if(!user){
            logger.warn(`User not found with id: ${userId}`);
            return {success:false, message:'User not found'};
        }
        return {success:true,message:"Profile fetched successfully", data:user};
    } catch (error) {
        
    }
}

export {
    getProfile
}