
   var noble = require('noble');
   var mqtt = require('mqtt');
   var client = mqtt.connect('mqtt://localhost');

   client.on('connect', function() {
      console.log("connected to mqtt service");
   })

   noble.on('stateChange', function(state) {
      if (state === 'poweredOn') {
         noble.startScanning([], true, function(error) {
            console.log("Scanning error " + JSON.stringify(error, null, 4));
         });
      } else {
         console.log("PowerOff!");
         noble.stopScanning();
      }
   });

   noble.on('scanStart', function() {
      console.log("Started scanning");
   })

   noble.on('scanStop', function() {
      console.log("Stopped scanning");
   })

   noble.on('warning', function(msg) {
      console.log("WARNING " + msg);
   });

   noble.on('RFduino', function(peripheral) {
      console.log("peripheral discovered " + peripheral.advertisement.localName);

      var name = peripheral.advertisement.localName;

      if (name == "doorbell") {
         noble.stopScanning();

         peripheral.on('disconnect', function(){
            noble.startScanning([], true, function(error) {
               console.log("Scanning error " + JSON.stringify(error, null, 4));
            });
         });

         console.log("connecting...");
         peripheral.connect( function(error) {
            peripheral.discoverServices([], function(error, services) {

               for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex ++) {
                  let service = services[serviceIndex];

                  if (service.uuid == 2220) {
                     console.log("Found doorbell service!");

                     service.discoverCharacteristics([], function(error, characteristics) {

                        for (let characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex ++) {
                           var characteristic = characteristics[characteristicIndex];

                           if (characteristic.uuid == 2221) {

                              console.log("Found characteristic!");
                              characteristic.subscribe();
                              characteristic.on('data', function(data, isNotification) {
                                 console.log("Open the frikin door!");
                                 client.publish('office/door/events', 'rings');

                              })


                           }
                        }
                     })
                  }
               }
            });
         });
      }
   });
