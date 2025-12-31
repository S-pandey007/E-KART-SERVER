import mongoose, { Schema } from "mongoose";

const InfluencerSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    images: [{ type: String, required: true }],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
);

InfluencerSchema.index({
  name: "text",
  tags: "text",
});

const Influencer = mongoose.model("Influencer", InfluencerSchema);
export default Influencer;
