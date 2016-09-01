let mqtt = require('mqtt');
let client = mqtt.connect('mqtt://localhost');
let pushover = require('pushover-notifications');

let push = new pushover( {
   user: 'uuaypd1aaw6h3xoei12j1zu28gogdu',
   token: 'aosy7vfwcc1empem5my4zm9v8432e9'
});

client.on('connect', function() {
   client.subscribe('office/door/events');
})

client.on('message', function(topic, message) {
   console.log(topic + " => " + message.toString());

   let msg = {
      message: "Open the frikin door!",
      device: 'iPhone6s'
   }

   push.send( msg, function( err, result ) {
      if (err) {
         console.log("There is a push error:");
         console.log(err);
      }

      console.log(result);
   })
   // send a push notification!
});
