import jwt from 'jsonwebtoken';

const generateToken = (user)=>{
   
    const accessToken = jwt.sign({userId:user._id},process.env.JWT_KEY,{expiresIn:"2d"});
    const refreshToken = jwt.sign({userId:user._id},process.env.JWT_KEY,{expiresIn:"15d"});

    return {accessToken,refreshToken};
}

export default generateToken