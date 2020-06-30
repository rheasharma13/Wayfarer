var mongoose=require("mongoose");

var commentSchema=new mongoose.Schema(
    {
        text:String,
        author:String
    }
);
module.exports= new mongoose.model("comment",commentSchema);