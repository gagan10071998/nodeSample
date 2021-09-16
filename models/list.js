const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ListModel = new Schema({
    List: {
        type: String,
        default: '[]'
    },
}, { timestamps: true });
const List = mongoose.model('lists', ListModel);
module.exports = List;