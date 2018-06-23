var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    Schema = mongoose.Schema;

app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(bodyParser.urlencoded({extended: true}));

var UserSchema = new Schema({
    username: String,
    following: Array
});

var User =  mongoose.model('User', UserSchema );
    
mongoose.connect("mongodb://localhost:27017/recentlyFollowed");

app.get('/', (req, res, next)=> {
    res.send(JSON.stringify("You have reached the RecentlyFollowed backend!"))
});

app.post('/save', (req, res, next) => {

    User.replaceOne({'username': req.body.user}, {$set: {username: req.body.user, following: req.body.following}}, {upsert: true})
    .then(res.send(JSON.stringify("You saved " + req.body.user + "'s users to the database!")))
    .catch(err => res.send(JSON.stringify(err)))

});

app.post('/compare', (req, res, next) => {
    User.findOne({username: req.body.user}, (err, user) => {
        if (!err && user) {
            console.log(req.body.following);
            var newFollows = [];
            var followlist = req.body.following;

            followlist.map(follow => {
                if ( user.following.indexOf(follow) <= -1 ) {
                    newFollows.push(follow);
                }
            });

            console.log(newFollows);
            
            if (newFollows.length >= 1) {
                res.send(JSON.stringify(newFollows));
            } else {
                res.send(JSON.stringify( user.username + " has not followed anyone new yet!"));
            }
        } else {
            res.send(JSON.stringify("This user has not been saved into the database yet. " + err))
        }
    })
})


app.listen(process.env.PORT || 5000, (req, res)=> {
    console.log("RecentlyFollowed Backend running on port 5000");
})