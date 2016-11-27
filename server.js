var http=require('http');
var fs=require('fs');
var path=require('path');
var mime=require('mime');
var cache={};
var chatServer=require('./lib/chat_server');


function send404(response) {
	response.writeHead(404, {'Content-Type':'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}

		);
	response.end(fileContents);
}
function serverStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function (exists) {
			if (exists) {
				fs.readFile(absPath, function (err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath]=data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

var server = http.createServer(function (request, response) {
	var filePath=false;
	if (request.url=='/') {
		filePath='public/index.html';
	} else {
		filePath='public' + request.url;
	}
	var absPath = './' + filePath;
	serverStatic(response, cache, absPath);
});

chatServer.listen(server);




server.listen(56322, function () {
	console.log("server listening on port 56322 !");
});



exports.listen = function(server) {// Запуск Socket.IO-сервера, чтобы выполняться вместе с существующим HTTP-сервером
	io = socketio.listen(server);
	io.set('log level', 1);
	// Определение способа обработки каждого пользовательского соединенияnickNames, namesUsed);
	io.sockets.on('connection', function (socket) {
		// Присваивание подключившемуся пользователю имени guest
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
		// Помещение подключившегося пользователя в комнату Lobby
		joinRoom(socket, 'Lobby');
		// Обработка пользовательских сообщений, попыток изменения имени
		handleMessageBroadcasting(socket, nickNames);
		// и попыток создания/изменения комнат
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);
		// Вывод списка занятых комнат по запросу пользователя
		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
			});
		// Определение логики очистки, выполняемой после выхода пользователя из чата
		handleClientDisconnection(socket, nickNames, namesUsed);
	});
};