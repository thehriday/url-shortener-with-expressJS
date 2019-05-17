module.exports = (req,res,next)=>{
    if (req.userLogin){
        return res.redirect("/")
    }
    next()
}