const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/grocery')//blog_mern is a name of DB
mongoose.connection.on('connected',()=>{
console.log('Connect to MongoDB')
})

mongoose.connection.on('error',(err)=>{
console.error('Connenction Error:',err)

})
module.exports = mongoose
