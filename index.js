// Setup basic express server bounded with socket.io
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;
// Setup a redis database
var redis = require('redis');
var redisClient = redis.createClient();

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0; // Record the number of users online
var usersList = []; // Record the name of users online
var illegal = true; // Record whether a username is illegal or not

// For a better efficiency, I store the most recent 10 messages into redis database.
var storeMessage = function(name, data) {
  var message = JSON.stringify({name: name, data: data.message, time: data.time});
  redisClient.lpush('messages', message, function(err,response){
    // if we remove the code below, we can store all the messages into database.
    redisClient.ltrim('messages', 0, 9);
  });
};

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data.message,
      time: data.time
    });
    storeMessage(socket.username, data);
  });

  // Check whether a username is illegal or not, and emit it to client.
  socket.on('check username', function(username) {
    if(usersList.indexOf(username) == -1) {
      illegal = false;
      socket.emit('check username outcome', {
        illegal: illegal
      });
    }
    else {
      illegal = true;
      socket.emit('check username outcome', {
        illegal: illegal
      });
    }
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;
    usersList.push(username);

    // Get historical messages form redis database.
    redisClient.lrange('messages', 0, -1, function(err,messages) {
      messages = messages.reverse();

      messages.forEach(function(message) {
        message = JSON.parse(message);
        socket.emit('new message', {
          username: message.name,
          message: message.data,
          time: message.time
        });
      });
    });

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    // Emit a login event back to client.
    socket.emit('login', {
      numUsers: numUsers,
      usersList: usersList
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      usersList: usersList
    });

  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects, perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      var index = usersList.indexOf(socket.username);
      if (index > -1) {
        usersList.splice(index, 1);
      }

      --numUsers;
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers,
        usersList: usersList
      });
    }
  });
});
