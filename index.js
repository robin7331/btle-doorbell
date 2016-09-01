
   let noble = require('noble');
   let mqtt = require('mqtt');

   // Connect to the local instance of Mosquitto
   let client = mqtt.connect('mqtt://localhost');

   // Simply log the successful connect.
   client.on('connect', function() {
      console.log("connected to mqtt service");
   })

   // Once BT is powered on start scanning for devices
   noble.on('stateChange', function(state) {
      if (state === 'poweredOn') {
         noble.startScanning([], true, function(error) {
            console.log("Scanning error " + JSON.stringify(error, null, 4));
         });
      } else {
         noble.stopScanning();
      }
   });


   // When a device was found check if it is our doorbell sender.
   noble.on('discover', function(peripheral) {
      console.log("Found a device called '" + peripheral.advertisement.localName + "'");

      let name = peripheral.advertisement.localName;

      // If yes stop scanning and connect to the device.
      if (name == "doorbell") {
         noble.stopScanning();

         // once the device turns off start scanning again.
         peripheral.on('disconnect', function(){
            noble.startScanning([], true, function(error) {
               console.log("Scanning error " + JSON.stringify(error, null, 4));
            });
         });

         console.log("Connecting to " + name + "...");
         peripheral.connect( function(error) {
            peripheral.discoverServices([], function(error, services) {

               for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex ++) {
                  let service = services[serviceIndex];

                  if (service.uuid == 2220) {

                     service.discoverCharacteristics([], function(error, characteristics) {

                        for (let characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex ++) {
                           var characteristic = characteristics[characteristicIndex];

                           if (characteristic.uuid == 2221) {

                              console.log("Successfully connected to Device. Listening for BT messages...");
                              characteristic.subscribe();
                              characteristic.on('data', function(data, isNotification) {
                                 console.log("Open the frikin door!");

                                 // publish an MQTT message though mosquitto.
                                 client.publish('office/door/events', 'rings');
                              });
                           }
                        }
                     })
                  }
               }
            });
         });
      }
   });
