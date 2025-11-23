import User  from '../models/user-model.js'
import debug from 'debug'
import {generateToken} from '../utils/createToken.js'
const userControllerLog = debug('app.usercontroller')
const loginOrSignUp = async(req,res)=>{
    const {phone,address}=req.body;
    // console.log("loginOrSignUp called with ",req.body);
    try {
        let user = await User.findOne({phone});

        if(!user){
            user  = new User({address,phone});
            await user.save();
            userControllerLog("new user created");
        }else{
            user.address =address;
            await user.save();
            userControllerLog("existing user logged in");
            // console.log("existing user logged in : ",user);
        }

        const {accessToken,refreshToken} = generateToken(user);
        
        res.status(201).json({'accessToken':accessToken,'refreshToken':refreshToken,'user':user});
    } catch (error) {
        userControllerLog(error);
        res.status(500).json({error:error.message})
    }
}

export {loginOrSignUp};