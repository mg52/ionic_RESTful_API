var port = process.env.PORT || 5000;
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var app = express();

app.use(cookieParser());
app.use(expressSession({
    secret: 'MusSecret'
}));
app.use(bodyParser.json());
app.use(cors());
/*mongodb*/
var mongoose = require('mongoose');
var uristring = process.env.MONGOLAB_URI || 'mongodb://localhost/mean_stack';
mongoose.connect(uristring);

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

var User = mongoose.model('User', userSchema);
/*end mongodb*/

/*
app.post('/send', function(req, res) {
    console.log(req.body);
    var sendBack = req.body.a + " server has sent back.";
    res.json(sendBack);
});
*/

app.post('/login', function(req, res) {
    delete req.session.user;
    delete req.session.email;
    var post = req.body;
    User.findOne({
        'username': post.username
    }, function(err, user) {
        if (err) throw err;
        if (user && post.password == user.password) {
            req.session.user = user.username;
            req.session.email = user.email;
            console.log(req.session.user + " logged in.");
            res.json({
                username: req.session.user
            });
        } else {
            req.session.user = '';
            res.json({
                username: req.session.user
            });
        }
    });
});

app.post('/signup', function(req, res) {
    var post = req.body;
    var new_user = new User({
        username: post.username,
        password: post.password,
        email: post.email
    });
    new_user.save(function(err, new_user) {
        if (err) {
            req.session.user = '';
            res.json({
                username: req.session.user + 'dummy'
            });
            console.log(post.username + " is already in use!");
        } else {
            if (post.username) {
                res.json({
                    username: post.username
                });
                console.log(post.username + ' added successfully!');
            } else {
                req.session.user = '';
                res.json({
                    username: req.session.user
                });
                console.log(post.username + ", there is an error");
            }
        }
    });
});


app.get('/getUserDetails', function(req, res) {
    if (req.session.user === undefined) {
        req.session.user = '';
    }
    res.json({
        username: req.session.user
    });
});

app.get('/getMainDetails', function(req, res) {
    if (req.session.user != '') {
        User.findOne({
            'username': req.session.user
        }, function(err, user) {
            res.json({
                username: user.username,
                email: user.email,
                password: user.password
            });
        });

    } else
        res.json('');
});

app.post('/logout', function(req, res) {
    console.log('logout');
    req.session.user = '';
    res.json(req.session.user);
});

app.all('*', function(req, res) {
    res.redirect('/');
});

var server = app.listen(port);
console.log('Working!');
