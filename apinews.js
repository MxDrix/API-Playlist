
var express = require('express'); 
var mongoose = require('mongoose'); 
var News = require('./Models/news_model');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bf22a3d841794ffaa63f903613dd928a');
var bodyParser = require('body-parser'); 
// var usersRoute = require('./Routes/route');

var conn = mongoose.connection;
var collection = conn.collection('news');

const app = express();
const port = process.env.PORT || 5657;
// Connecting to the database
const db = mongoose.connect("mongodb://localhost:27017/utilisateur");

// setting body parser middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// API routes
// app.use('/api', usersRoute);

// Running the server
app.listen(port, () => {
	console.log(`http://localhost:${port}`)
})
// // categories : business entertainment general health science sports technology


var cron = require('node-cron');
cron.schedule('30 * * * * *', function(){
    getNEws();
});

function getNEws(){    
    console.log("test");
    newsapi.v2.topHeadlines({
        category: 'business',
        country: 'fr' 
    }).then(response => { 
        response.articles.forEach(element => {
            let NewsOne = new News({
                category: 'business',
                source: [{id: element.source.id,name: element.source.name}],
                author: element.author,
                title:  element.title,
                description:  element.description,
                url:  element.url,
                urlToImage:  element.urlToImage,
                publishedAt:  element.publishedAt}
            );                 
            var query  = News.where({title:  element.title,url:  element.url});
            query.findOne(function (err, result) {
                if (err) return handleError(err);
                if (result) {
                } else {
                    collection.insert(NewsOne);
                }
            });
        });   
        newsapi.v2.topHeadlines({
            category: 'entertainment',
            country: 'fr'
        }).then(responsetwo => { 
            responsetwo.articles.forEach(element => {
                let NewsTwo = new News({
                    category: 'entertainment',
                    source: [{id: element.source.id,name: element.source.name}],
                    author: element.author,
                    title:  element.title,
                    description:  element.description,
                    url:  element.url,
                    urlToImage:  element.urlToImage,
                    publishedAt:  element.publishedAt}
                );               
                var query  = News.where({title:  element.title,url:  element.url});
                query.findOne(function (err, result) {
                    if (err) return handleError(err);
                    if (result) {
                    } else {
                        collection.insert(NewsTwo);
                    }
                });    
            });  
            newsapi.v2.topHeadlines({
                category: 'general',
                country: 'fr'
            }).then(responsetree => { 
                responsetree.articles.forEach(element => {
                    let NewsTree = new News({
                        category: 'general',
                        source: [{id: element.source.id,name: element.source.name}],
                        author: element.author,
                        title:  element.title,
                        description:  element.description,
                        url:  element.url,
                        urlToImage:  element.urlToImage,
                        publishedAt:  element.publishedAt}
                    );                 
                    var query  = News.where({title:  element.title,url:  element.url});
                    query.findOne(function (err, result) {
                        if (err) return handleError(err);
                        if (result) {
                        } else {
                            collection.insert(NewsTree);
                        }
                    });  
                });  
                newsapi.v2.topHeadlines({
                    category: 'health',
                    country: 'fr'
                }).then(responsefour => { 
                    responsefour.articles.forEach(element => {
                        let NewsFour = new News({
                            category: 'health',
                            source: [{id: element.source.id,name: element.source.name}],
                            author: element.author,
                            title:  element.title,
                            description:  element.description,
                            url:  element.url,
                            urlToImage:  element.urlToImage,
                            publishedAt:  element.publishedAt}
                        );                 
                        var query  = News.where({title:  element.title,url:  element.url});
                        query.findOne(function (err, result) {
                            if (err) return handleError(err);
                            if (result) {
                            } else {
                                collection.insert(NewsFour);
                            }
                        });  
                    });  
                    newsapi.v2.topHeadlines({
                        category: 'science',
                        country: 'fr'
                    }).then(responsefive => {
                        responsefive.articles.forEach(element => {
                            let NewsFive = new News({
                                category: 'science',
                                source: [{id: element.source.id,name: element.source.name}],
                                author: element.author,
                                title:  element.title,
                                description:  element.description,
                                url:  element.url,
                                urlToImage:  element.urlToImage,
                                publishedAt:  element.publishedAt}
                            );                 
                            var query  = News.where({title:  element.title,url:  element.url});
                            query.findOne(function (err, result) {
                                if (err) return handleError(err);
                                if (result) {
                                } else {
                                    collection.insert(NewsFive);
                                }
                            });  
                        });  
                        newsapi.v2.topHeadlines({
                            category: 'sports',
                            country: 'fr'
                        }).then(responsesix => { 
                            responsesix.articles.forEach(element => {
                                let NewsSix =  new News({
                                    category: 'sports',
                                    source: [{id: element.source.id,name: element.source.name}],
                                    author: element.author,
                                    title:  element.title,
                                    description:  element.description,
                                    url:  element.url,
                                    urlToImage:  element.urlToImage,
                                    publishedAt:  element.publishedAt}
                                );                 
                                var query  = News.where({title:  element.title,url:  element.url});
                                query.findOne(function (err, result) {
                                    if (err) return handleError(err);
                                    if (result) {
                                    } else {
                                        collection.insert(NewsSix);
                                    }
                                });  
                            });  
                            newsapi.v2.topHeadlines({
                                category: 'technology',
                                country: 'fr'
                            }).then(responseseven => { 
                                responseseven.articles.forEach(element => {
                                    let NewsSeven = new News({
                                        category: 'technology',
                                        source: [{id: element.source.id,name: element.source.name}],
                                        author: element.author,
                                        title:  element.title,
                                        description:  element.description,
                                        url:  element.url,
                                        urlToImage:  element.urlToImage,
                                        publishedAt:  element.publishedAt}
                                    );                 
                                    var query  = News.where({title:  element.title,url:  element.url});
                                    query.findOne(function (err, result) {
                                        if (err) return handleError(err);
                                        if (result) {
                                        } else {
                                            collection.insert(NewsSeven);
                                        }
                                    });  
                                });  
                                // res.status(200).json({ 
                                //     news :{
                                //         news1: response,
                                //         News2: responsetwo.articles,
                                //         News3: responsetree.articles,
                                //         News4: responsefour.articles,
                                //         News5: responsefive.articles,
                                //         News6: responsesix.articless,
                                //         News7: responseseven.articless             
                                //     } 
                                // });
                            });
                            
                        });
                    });
                });
            });
        });
    });
}