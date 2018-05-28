var mongoose = require('mongoose');
var conn = mongoose.connection;
var collection = conn.collection('news');
const Schema = mongoose.Schema; 

const News = new Schema({
	_id: Schema.ObjectId,
	category: { type:String },
	source: [{ id: String, name: String }],
	author: { type: String },
	title: { type: String },
	description: { type: String },
	url: { type: String },
	urlToImage: { type: Date },
	publishedAt: { type: String }
});

module.exports =  mongoose.model('News', News)