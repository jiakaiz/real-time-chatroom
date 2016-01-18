
# Real-time Chat

A real-time chat application using express, socket.io, redis, and etc.

# DEMO Video

- https://www.youtube.com/watch?v=1cfebfy_T1s

# How to run

This tutorial is for mac environment. The process in Windows environment
should be similar.

```
- install redis database in your computer.

- open a terminal and run redis server in your computer.
$ redis-server

- open another terminal and enter the directory of this chat application.
$ cd jiakaiz_FSE_chatroom

- install dependencies for this application.(if there are no required dependencies)
$ npm install

- run node server.
$ node index.js

- open your several browsers to 'http://localhost:8080' as clients.

- enjoy this fantastic real-time chatting experience.
```

# Features

- A user can join a chat room with a unique username. if the username
is illegal, there will be an alert information.

- Users can post chat messages to the chat room. Each message is displayed
with username, timestamp, text body and a unique color.

- Users can see other users’ chat messages in real time.

- Users can receive the information of whoever is in this chat room in
real time.

- A notification is sent to all other users to inform that whether a user is
typing or not.

- A notification is sent to all users when a user joins or leaves
the chatroom.

- All the chat messages are stored on the server in a redis database and
re-loaded when a user re-enters the chat room. So users are able to see
historical chat messages.

# Development stack

- Client side: the standard “web stack”: HTML, CSS, JavaScript, and Jquery.

- Server side: Node.js with express.js and socket.io.

- Database: redis database.
