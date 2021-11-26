var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaderSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },

    post : {
        type:String,
        required:true
    },
    phone: {
        type:String,
        required:true,
        unique:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        required: false
    }
}, {
    timestamps: true
});

var Leaders = mongoose.model('Leader', leaderSchema);

module.exports = Leaders;