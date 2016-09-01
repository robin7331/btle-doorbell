
   let noble = require('noble');
   let mqtt = require('mqtt');
   let client = mqtt.connect('mqtt://localhost');

   client.on('connect', function() {
      console.log("connected to mqtt service");
   })

   noble.on('stateChange', function(state) {
      if (state === 'poweredOn') {
         noble.startScanning([], true, function(error) {
            console.log("Scanning error " + JSON.stringify(error, null, 4));
         });
      } else {
         noble.stopScanning();
      }
   });

   noble.on('RFduino', function(peripheral) {
      console.log("Found a device called '" + peripheral.advertisement.localName + "'");

      let name = peripheral.advertisement.localName;

      if (name == "doorbell") {
         noble.stopScanning();

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
