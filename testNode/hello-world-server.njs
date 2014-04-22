	
	var express = require('express'), app = express(), // 
server = require("http").createServer(app), io = require("socket.io").listen(server) //

	
	
server.listen(3001);

// 라우팅 
app.get('/', function (req, res) {
	console.log("11111111111111111111");
  res.sendfile(__dirname + '/index.html');
});

// 이 채팅 서버에 현재 접속한 사용자명을 저장할 변수
//var usernames = ['user1','user2','user3'];
var usernames = new Array;
0
// 현재 채팅에서 사용가능한 룸 목록을 저장할 변수
var rooms = ['room1', 'room2', 'room3'];

io.sockets.on('connection', function (socket) {
	console.log("***************************************");
	console.log("** connection start");
	console.log("***************************************");
  // 클라이언트가 sendchat 이벤트를 전송할 경우 처리할 리스너 함수
	socket.on('sendchat', function (data) {
		// 클라이언트가 updatechat 함수를 실행하도록 알린다. 
		// 이때 updatechat 함수에 전달한 인자는 2개다.
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	// 클라이언트가 adduser 이벤트를 전송할 경우 처리할 리스너 함수
	socket.on('adduser', function(username){
		// 이 클라이언트를 위한 소켓 세션에 username이라는 필드에 클라이언트가 전송한 값을 저장한다. 
		socket.username = username;
		// 이 클라이언트를 위한 소켓 세션에 room이라는 필드에 room 값을 저장한다(기본 값은 room1이다).
		socket.room = 'room1';
		// 클라이언트의 username을 사용자 목록을 관리하는 전역 변수인 usernames에 추가한다.
		//usernames[usernames.length] = username;
		
		usernames.push(username);
		
		console.log("usernames.length :"+usernames.length);
		
		// 클라이언트를 room1 할당한다.
		socket.join('room1');
		// 클라이언트에게 채팅 서버에 접속되었다고 알린다.
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// 사용자가 채팅 서버에 추가되었다는 메시지를 해당 룸에만 브로드캐스팅한다.
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'room1');
		socket.emit('updateusers', usernames, username);
	});

	socket.on('switchRoom', function(newroom){
		// 현재 룸을 떠난다(현재 접속한 룸은 세션에 저장되어 있다)
		socket.leave(socket.room);
		// 새로운 룸에 입장한다. 새로운 룸 이름은 함수 파라미터로 전달된다.
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
    // 이전 룸에 대해, 사용자가 떠났단느 메시지를 브로드캐스팅한다.
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// 소켓 세션의 룸이름을 갱신한다.
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	// 사용자가 접속을 끊을 경우 처리할 리스너 함수
	socket.on('disconnect', function(){
		// 사용자 목록을 관리하는 전역변수에서 해당 사용자를 삭제한다.
		console.log("usernames.length :"+usernames.length);
		console.log("discon :"+socket.username);
		
		for(var i=0; i<usernames.length; i++){
			console.log("usernames["+i+"] :"+usernames[i]);
		}
		
		delete usernames[socket.username];
		usernames.length -=1;
		console.log("usernames.length :"+usernames.length);
		
		for(var i=0; i<usernames.length; i++){
			console.log("usernames["+i+"] :"+usernames[i]);
		}
		
		
		// 채팅을 사용하는 변경된 사용자 목록을 클라이언트에게 업데이트하도록 updateusers 함수를 실행하도록 알린다.
		io.sockets.emit('updateusers', usernames);
		// 사용자가 채팅 서버에서 나갔다는 메시지를 전역으로(모든 클라이언트에게) 알린다.
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});