import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const videoSchema = new mongoose.Schema(
    {
        video: {
            type: String, // cloudinary url
            required: [true, 'video is required']
        },
        thumbnail: {
            type: String, //cloudinary url
            required: [true, 'thumbnail is required']
        },
        title: {
            type: String,
            required: [true, 'title is required']
        },
        description: {
            type: String,
            required: [true, 'description is required']
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)