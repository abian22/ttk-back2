//*****  Check the function of comment media when the front is ready ******/

const User = require("../models/user.model");
const Media = require("../models/media.model");
const Comment = require("../models/comment.model");

async function getComments(req, res) {
  try {
    const comments = await Comment.find();
    if (!comments) {
      return res.status(404).send("No comments found");
    } else {
      return res.status(200).json(comments);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function getCommentsOfMedia(req, res) {
  try {
    const comments = await Comment.find({ commentedMedia: req.params.mediaId });

    if (!comments) {
      return res.status(404).send("No comments for this media found");
    }

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send(error.message);
  }
}


async function postMyComment(req, res) {
  try {
    const user = await User.findById(res.locals.user.id);
    const media = await Media.findById(req.params.mediaId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!media) {
      return res.status(404).json({ message: "Media not found." });
    }

    const newComment = await Comment.create({
      text: req.body.text,
      commentedMedia: media._id,
      commentedBy: user._id,
    });
    const savedComment = await newComment.save();
    console.log("Comment saved", savedComment);
    res
      .status(201)
      .json({ message: "Comment uploaded", comment: savedComment });
  } catch (error) {
    console.error("Error saving the comment:", error);
    return res.status(500).json({
      error: "Error saving the comment",
      details: error.message,
    });
  }
}

async function deleteMyComment(req, res) {
  try {
    const userId = res.locals.user.id;
    const commentIdToDelete = req.params.commentId;

    const commentToDelete = await Comment.findById(commentIdToDelete);

    if (!commentToDelete) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentToDelete.commentedBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: User cannot delete this comment" });
    }

    await Comment.deleteOne({ _id: commentIdToDelete });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting the comment:", error);
    return res.status(500).json({
      error: "Error deleting the comment",
      details: error.message,
    });
  }
}

async function deleteComment(req, res) {
  try {
    const commentIdToDelete = req.params.commentId;
    const commentToDelete = await Comment.findById(commentIdToDelete);

    if (!commentToDelete) {
      return res.status(404).json({ message: "Comment not found" });
    }
    await Comment.deleteOne({ _id: commentIdToDelete });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting the comment:", error);
    return res.status(500).json({
      error: "Error deleting the comment",
      details: error.message,
    });
  }
}

async function updateMyComment(req, res) {
  const userId = res.locals.user.id;
  const commentIdToUpdate = req.params.commentId;
  try {
    if (!commentIdToUpdate) {
      return res.status(404).json({ message: "Comment not found" });
    }
    const commentToUpdate = await Comment.findById(commentIdToUpdate);

    if (commentToUpdate.commentedBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: User cannot delete this comment" });
    }
    await Comment.updateOne(
      { _id: commentIdToUpdate },
      { $set: { text: req.body.text } }
    );
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating the comment:", error);
    return res.status(500).json({
      error: "Error updating the comment",
      details: error.message,
    });
  }
}

async function updateComment(req, res) {
  const commentIdToUpdate = req.params.commentId;
  try {
    if (!commentIdToUpdate) {
      return res.status(404).json({ message: "Comment not found" });
    }
    await Comment.updateOne(
      { _id: commentIdToUpdate },
      { $set: { text: req.body.text } }
    );
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating the comment:", error);
    return res.status(500).json({
      error: "Error updating the comment",
      details: error.message,
    });
  }
}

async function updateCommentLikes(req, res) {
  const { commentId } = req.params;
  const userId = res.locals.user.id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const index = comment.likedBy.indexOf(userId);
    if (index === -1) {
      comment.likedBy.push(userId);
    } else {
      comment.likedBy.splice(index, 1);
    }
    await comment.save();
    
    res.status(200).json({
      message: "Like updated successfully",
      likedBy: comment.likedBy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  postMyComment,
  getComments,
  getCommentsOfMedia,
  deleteMyComment,
  deleteComment,
  updateMyComment,
  updateComment,
  updateCommentLikes
};
