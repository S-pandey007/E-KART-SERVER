import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index:true
    },

    sessionId:{
        type: String,
        required: true,
        index:true
    },

    refreshToken:{
        type: String,
        required: true,
        select:false
    },

    isActive:{
        type: Boolean,
        default: true,
        index:true
    },

    expiresAt:{
        type: Date,
        required: true,
        index:{expires:0},
    }

},{timestamps:true})

sessionSchema.index({userId:1, sessionId:1}, {unique:true});

const SessionModel = mongoose.model('Session', sessionSchema);
export default SessionModel;