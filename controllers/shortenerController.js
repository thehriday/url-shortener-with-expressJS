exports.getUrlShortener = (req,res)=>{
    res.render("shortener",{title:"Create Your Link Short",path:"/url-shortener"})
}