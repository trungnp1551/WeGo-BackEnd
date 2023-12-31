const mongoose = require('mongoose')

const cloudinary = require('../routers/cloudinary')
const Post = require('../models/post')
const User = require('../models/user')

exports.getAll = async (req, res) => {
    try {
        let arrPost = await Post.find()
        console.log(arrPost.length)
        for (let i = 0; i < 0; i++) {
            arrPost[i].listComment.length = 0;
            if (arrPost[i].listUserIdCommented.length != undefined) {
                for (let j = 0; j < arrPost[i].listUserIdCommented.length; j++) {
                    const useTemp = await User.findById(arrPost[i].listUserIdCommented[j])
                    let comment = useTemp.fullName + ": " + arrPost[i].listCommentContent[j]
                    await arrPost[i].listComment.push(comment)
                }
            }
            await arrPost[i].save()
            arrPost.length = 25
            console.log(arrPost.length + 'abc' + i)
        }
        res.status(200).json({
            message: 'getAll',
            data: arrPost
        })
        console.log(arrPost.length+"aa")
    } catch (error) {
        console.log(error)
        req.status(404).json({
            error
        })
    }
}

exports.getOne = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
        res.status(200).json({
            message: 'get one',
            post
        })
    } catch (error) {
        res.status(200).json({
            message: 'error',
            error
        })
    }
}

exports.createAPost = async (req, res) => {
    try {
        var today = new Date()
        let now = today.getFullYear() + "." + (today.getMonth() + 1) + "." + today.getDate()
        const post = new Post({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            update_date: now,
            tag: req.body.tag,
            locationURL: req.body.locationURL,
            content: req.body.content,
        })
        req.files.map(async file => {
            const result = await cloudinary.uploader.upload(file.path)
            post.listImage.push(result.secure_url)
            post.listCloudinary_id.push(result.public_id)
            await post.save()
        })
        res.status(200).json({
            message: "post successful",
            post
        })
    } catch (error) {
        console.log(error)
    }
}

exports.update = async (req, res) => {
    try {
        const updatePost = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true })
        updatePost.save()
        console.log(updatePost)
        res.status(200).json({
            type: "update",
            message: "Update successful",
            updatePost
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error
        })
    }
}

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)

        for (let i = 0; i < post.listLikedUserId.length; i++) {
            const user = await User.findById(post.listLikedUserId[i])
            let y = await user.listLikedPostId.indexOf(post._id)
            user.listLikedPostId.splice(y, 1)
            await user.save()
        }

        for (let i = 0; i < post.listCloudinary_id.length; i++) {
            await cloudinary.uploader.destroy(post.listCloudinary_id[i])
        }
        post.remove()
        res.status(200).json({
            message: "deleted"
        })
    } catch (error) {
        console.log(error)
    }
}

exports.resetAll = async (req, res) => {
    try {
        var arrPost = await Post.find()
        for (let i = 0; i < arrPost.length; i++) {
            arrPost[i].listComment = []
            arrPost[i].listCommentContent = []
            arrPost[i].listUserIdCommented = []
            arrPost[i].listLikedUserId = []
            await arrPost[i].save()
        }
        let arrUser = await User.find()
        for (let i = 0; i < arrUser.length; i++) {
            arrUser[i].listLikedPostId.length = 0
            await arrUser[i].save()

        }
        res.status(200).json({
            message: 'done',
            data: arrPost
        })
    } catch (error) {
        console.log(error)
        res.status(200).json({
            message: 'error',
            error
        })
    }
}