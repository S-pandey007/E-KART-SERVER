import User  from '../models/user-model.js'
import debug from 'debug'
import generateToken from '../utils/createToken.js'
const userControllerLog = debug('app.usercontroller')
const loginOrSignUp = async(req,res)=>{
    const {phone,address}=req.body;

    try {
        let user = await User.findOne({phone}).lean();

        if(!user){
            user  = new User({address,phone});
            await user.save();
        }else{
            user.address =address;
            await user.save();
        }

        const {accessToken,refreshToken} = generateToken(user);
        
        res.status(201).json({'accessToken':accessToken,'refreshToken':refreshToken})
    } catch (error) {
        userControllerLog(err);
        res.status(500).json({error:error.message})
    }
}

export {loginOrSignUp};