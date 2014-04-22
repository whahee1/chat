	
	var express = require('express'), app = express(), // 
server = require("http").createServer(app), io = require("socket.io").listen(server) //

	
	
server.listen(3001);

// ����� 
app.get('/', function (req, res) {
	console.log("11111111111111111111");
  res.sendfile(__dirname + '/index.html');
});

// �� ä�� ������ ���� ������ ����ڸ��� ������ ����
//var usernames = ['user1','user2','user3'];
var usernames = new Array;
0
// ���� ä�ÿ��� ��밡���� �� ����� ������ ����
var rooms = ['room1', 'room2', 'room3'];

io.sockets.on('connection', function (socket) {
	console.log("***************************************");
	console.log("** connection start");
	console.log("***************************************");
  // Ŭ���̾�Ʈ�� sendchat �̺�Ʈ�� ������ ��� ó���� ������ �Լ�
	socket.on('sendchat', function (data) {
		// Ŭ���̾�Ʈ�� updatechat �Լ��� �����ϵ��� �˸���. 
		// �̶� updatechat �Լ��� ������ ���ڴ� 2����.
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	// Ŭ���̾�Ʈ�� adduser �̺�Ʈ�� ������ ��� ó���� ������ �Լ�
	socket.on('adduser', function(username){
		// �� Ŭ���̾�Ʈ�� ���� ���� ���ǿ� username�̶�� �ʵ忡 Ŭ���̾�Ʈ�� ������ ���� �����Ѵ�. 
		socket.username = username;
		// �� Ŭ���̾�Ʈ�� ���� ���� ���ǿ� room�̶�� �ʵ忡 room ���� �����Ѵ�(�⺻ ���� room1�̴�).
		socket.room = 'room1';
		// Ŭ���̾�Ʈ�� username�� ����� ����� �����ϴ� ���� ������ usernames�� �߰��Ѵ�.
		//usernames[usernames.length] = username;
		
		usernames.push(username);
		
		console.log("usernames.length :"+usernames.length);
		
		// Ŭ���̾�Ʈ�� room1 �Ҵ��Ѵ�.
		socket.join('room1');
		// Ŭ���̾�Ʈ���� ä�� ������ ���ӵǾ��ٰ� �˸���.
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// ����ڰ� ä�� ������ �߰��Ǿ��ٴ� �޽����� �ش� �뿡�� ��ε�ĳ�����Ѵ�.
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'room1');
		socket.emit('updateusers', usernames, username);
	});

	socket.on('switchRoom', function(newroom){
		// ���� ���� ������(���� ������ ���� ���ǿ� ����Ǿ� �ִ�)
		socket.leave(socket.room);
		// ���ο� �뿡 �����Ѵ�. ���ο� �� �̸��� �Լ� �Ķ���ͷ� ���޵ȴ�.
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
    // ���� �뿡 ����, ����ڰ� �����ܴ� �޽����� ��ε�ĳ�����Ѵ�.
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// ���� ������ ���̸��� �����Ѵ�.
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	// ����ڰ� ������ ���� ��� ó���� ������ �Լ�
	socket.on('disconnect', function(){
		// ����� ����� �����ϴ� ������������ �ش� ����ڸ� �����Ѵ�.
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
		
		
		// ä���� ����ϴ� ����� ����� ����� Ŭ���̾�Ʈ���� ������Ʈ�ϵ��� updateusers �Լ��� �����ϵ��� �˸���.
		io.sockets.emit('updateusers', usernames);
		// ����ڰ� ä�� �������� �����ٴ� �޽����� ��������(��� Ŭ���̾�Ʈ����) �˸���.
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});