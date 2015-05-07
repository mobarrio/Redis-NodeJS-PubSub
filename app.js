var  app = require('express')(), 
    util = require('util'),
  server = require('http').Server(app),
serveStatic = require('serve-static'),
   debug = process.env.DEBUG || false;
// set DEBUG=true && node server-pubsub-redis.js

const redis =   require('redis');
const io =      require('socket.io');
const sub = redis.createClient();
const pub = redis.createClient();

app.engine('html', require('ejs').renderFile);
app.use(serveStatic(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res){ res.sendFile(__dirname +'/index.html'); });
app.get('/video', function(req, res) { res.render('video', { videoid: 1 }); });
app.get('/video/:videoid', function(req, res) { res.render('video', { videoid: req.params.videoid }); });

server.listen(3000, function(){ if(debug) console.log('listening on *:3000'); });

sub.on('connect', function() { if(debug) console.log('Sub Connected to Redis'); });
pub.on('connect', function() { if(debug) console.log('Pub Connected to Redis'); });

sub.subscribe('control');
//sub.subscribe('video');
sub.subscribe('video-p1');
sub.subscribe('video-p2');
sub.subscribe('video-p3');
io.listen(server).on('connection', function(socket) {
    socket.on('general', function (data) {
      var msg = JSON.parse(data);
      var reply = "";
	    switch(msg.action) {
          case 'VIDEO-LOAD':
            reply = JSON.stringify({action:'load', channel:msg.channel, destino:msg.destino, videoid:msg.msg });
            if(debug) console.log("Accion VIDEO Respuesta: ",reply);
            pub.publish(msg.channel, reply);
            break;

          case 'VIDEO-PLAY':
            reply = JSON.stringify({action:'play', channel:msg.channel, destino:msg.destino, videoid:msg.msg });
            if(debug) console.log("Accion VIDEO Respuesta: ",reply);
            pub.publish(msg.channel, reply);
            break;

          case 'VIDEO-PAUSE':
            reply = JSON.stringify({action:'pause', channel:msg.channel, destino:msg.destino, videoid:msg.msg });
            if(debug) console.log("Accion VIDEO Respuesta: ",reply);
            pub.publish(msg.channel, reply);
            break;

          case 'VIDEO-REMOVE':
            reply = JSON.stringify({action:'remove', channel:msg.channel, destino:msg.destino, videoid:msg.msg });
            if(debug) console.log("Accion VIDEO Respuesta: ",reply);
            pub.publish(msg.channel, reply);
            break;

          case 'MSG':
            reply = JSON.stringify({action:'control', channel:msg.channel, msg:msg.msg, destino:msg.destino });
            if(debug) console.log("Accion MSG Respuesta: ",reply);
            pub.publish(msg.channel, reply);
            break;
	    }
    });

    sub.on('message', function (channel, message) {
        socket.emit(channel, message);
    });
});


