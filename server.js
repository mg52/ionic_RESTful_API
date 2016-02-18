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
var currentUser = '';
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
    if(post.username == '' || post.password == ''){
    	return;
    }
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
          currentUser = user.username;
        	res.json({
			username: user.username,
			email: user.email,
            password: user.password
		});
        }
        else{
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

/*Socket.IO*/
var users = [];
io.sockets.on('connection', function (socket) {
	var user;
	socket.on('sendInformation', function(data){
		//console.log(data.socketId + ', ' + data.name);
		user = addUser(data.socketId, data.name);
		console.log(users);
	});
  socket.on('send_mouse_pos', function(data){
    var controlBit = 0, friendId = 0;
    for(var i=0; i<users.length; i++){
      if(data.friendName === users[i].name){
        console.log(users[i].name + ' ' + users[i].socketId);
        //io.to(users[i].socketId).emit("send_draw", {drawarray: data.mouse_pos, friendName: data.friendName, currentUser: currentUser});
          io.sockets.connected[users[i].socketId].emit('send_draw', {drawarray: data.mouse_pos, friendName: data.friendName, senderName: data.senderName});
        break;
      }
    }

  });
	socket.on('disconnect', function () {
		console.log('disconnect');
        removeUser(user);
    });
});
var addUser = function(socketId, name) {
	var controlBit = 0;
	for(var i=0; i<users.length; i++){
		if(name === users[i].name){
			controlBit = 1;
			break;
		}
	}
	if(controlBit == 0){
		var user = {
			name: name,
			socketId: socketId
		}
		users.push(user);
		return user;
	}
	else{
		return;
	}
}
var removeUser = function(user) {
    for(var i=0; i<users.length; i++) {
        if(user.name === users[i].name) {
            users.splice(i, 1);
            return;
        }
    }
}
/*Socket.IO*/
console.log('Working!');
