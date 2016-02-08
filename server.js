var port = process.env.PORT || 5000;
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var server = app.listen(port);
var io = require('socket.io').listen(server);

app.use(cookieParser());
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

app.post('/login', function(req, res) {
    var post = req.body;
    User.findOne({
        'username': post.username
    }, function(err, user) {
        if (err) throw err;
        if (user && post.password == user.password) {
            res.json({
                username: user.username,
				password: user.password
            });
        } else {
            res.json({
                username: '',
				password: ''
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
            res.json({
                username: post.username + 'dummy'
            });
            console.log(post.username + " is already in use!");
        } else {
            if (post.username) {
                res.json({
                    username: post.username
                });
                console.log(post.username + ' added successfully!');
            } else {
                res.json({
                    username: ''
                });
                console.log(post.username + ", there is an error");
            }
        }
    });
});

app.post('/getUserDetails', function(req, res) {
	var post = req.body;
	User.findOne({'username': post.username}, function(err, user) {
        if (err) throw err;
		console.log('username: ' + post.username + ' ' + post.password);
        if (user && post.password == user.password) {
		console.log('2 ' + user.password);
        	res.json({
			username: user.username,
			email: user.email,
            password: user.password
		});
        }
        else{
		console.log(3);
        	res.json({
        		username: '',
			email: '',
            		password: ''
        	});
        }
    });
});

app.get('/try', function(req,res){
	res.json({'try':'OK'});
});

console.log('Working!');
