/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//var app = (function()
//{
// Application object.
//  var max=-100;

var app = {
    rssiArr:[],
    uuid:0,
    rssi:0
};
//alert("start");
// Specify your beacon 128bit UUIDs here.
var regions =
        [
            // Estimote Beacon factory UUID.
            {uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},
            // Sample UUIDs for beacons in our lab.
            {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E'},
            {uuid: '8DEEFBB9-F738-4297-8040-96668BB44281'},
            {uuid: 'A0B13730-3A9A-11E3-AA6E-0800200C9A66'},
            {uuid: 'E20A39F4-73F5-4BC4-A12F-17D1AD07A961'},
            {uuid: 'A4950001-C5B1-4B44-B512-1370F02D74DE'}
        ];

// Dictionary of beacons.
var beacons = {};

// Timer that displays list of beacons.
var updateTimer = null;

app.initialize = function ()
{
//    alert("init");
    document.addEventListener('deviceready', onDeviceReady, false);
};

function onDeviceReady()
{

    window.locationManager = cordova.plugins.locationManager;
//    alert("start scan");
    // Start tracking beacons!
    startScan();

    // Display refresh timer.
    updateTimer = setInterval(displayBeaconList, 500);
}

function startScan()
{
    
    // The delegate object holds the iBeacon callback functions
    // specified below.
    var delegate = new locationManager.Delegate();
    // Called continuously when ranging beacons.
  
    delegate.didRangeBeaconsInRegion = function (pluginResult)
    {
       var maxRSSI=-100;
        for (var i in pluginResult.beacons)
        {
         
//           if(maxRSSI<pluginResult.beacons[i].rssi)
//           {
//               maxRSSI=pluginResult.beacons[i].rssi;
//               console.log(maxRSSI);
//           }
            var beacon = pluginResult.beacons[i];
            beacon.timeStamp = Date.now();
            
            var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
            beacons[key] = beacon;  
        }
//        max=maxRSSI;
    };
    

    // Called when starting to monitor a region.
    // (Not used in this example, included as a reference.)
    delegate.didStartMonitoringForRegion = function (pluginResult)
    {
        //console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
    };

    // Called when monitoring and the state of a region changes.
    // (Not used in this example, include3d as a reference.)
    delegate.didDetermineStateForRegion = function (pluginResult)
    {
        //console.log('didDetermineStateForRegion: ' + JSON.stringify(pluginResult))
    };

    // Set the delegate object to use.
    locationManager.setDelegate(delegate);

    // Request permission from user to access location info.
    // This is needed on iOS 8.
    locationManager.requestAlwaysAuthorization();

    // Start monitoring and ranging beacons.
    for (var i in regions)
    {
//        var obj=regions[i];
//        array.push(obj.rssi);
//        array.sort(function(a,b){return a-b;});
////        a.sort(function(a,b){return a-b;});
//        maxRSSI=array[0];
        var beaconRegion = new locationManager.BeaconRegion(
                i + 1,
                regions[i].uuid);

        // Start ranging.
        locationManager.startRangingBeaconsInRegion(beaconRegion)
                .fail(console.error)
                .done();

        // Start monitoring.
        // (Not used in this example, included as a reference.)
        locationManager.startMonitoringForRegion(beaconRegion)
                .fail(console.error)
                .done();
//        count=count+1;

    }
  
}

function displayBeaconList()
{
    // Clear beacon list.
 
    
    //min value of rssi
//    var majorMax=0;//
//    var minorMax=0;
 
    // Update beacon list.
//    var stek=[];
//    $.each(beacons, function(key,beacon)
//    {if(stek.length<5){
//           stek.push(beacon.rssi); 
//        }
//        else{
//            stek.shift;
//            stek.push(beacon.rssi);
//        }
//        var sum=0;
//        for (var i=0;i<stek.length;i++){
//            sum+=stek[i];
//        }
//        var avarage=sum/stek.length;
//        beacon.rssi=avarage;
//    });
//    ibeacon();
//}


//   function ibeacon(){ 
          $('#found-beacons').empty();
    $('#info').empty();
    
    var timeNow = Date.now();
       var rM=-100;
          var uuid=0;//uuid start =0
      $.each(beacons, function (key, beacon)
    {
        //The cycle find max value of rssi and get this uuid.
        if(beacon.rssi>rM)
        {
            rM=beacon.rssi;
//            majorMax=beacon.major;
//            minorMax=beacon.minor;
            uuid=beacon.uuid;
        }
    });
    //function changeInformation
     FindBeaconInDataBase(uuid);
    scannedBeakonsArr=[];
    $.each(beacons, function (key, beacon)
    {
        var beaconObj={uuid:beacon.uuid,minor:beacon.minor,major:beacon.major,rssi:beacon.rssi,accuracy:beacon.accuracy};
        scannedBeakonsArr.push(beaconObj);
        // Only show beacons that are updated during the last 60 seconds.
        if (beacon.timeStamp + 60000 > timeNow)
        {
            // Map the RSSI value to a width in percent for the indicator.
            var rssiWidth = 1; // Used when RSSI is zero or greater.
            if (beacon.rssi < -100) {
                rssiWidth = 100;
            }
            else if (beacon.rssi < 0) {
                rssiWidth = 100 + beacon.rssi;
            }
            //=================
           
//                if(beacon.rssi===0)
//                {
//                    return -1;
//                }
//                var ratio=beacon.rssi*1/txPower;
//                if(ratio<1){
//                    return pow(ratio,10);
//                }
//                else{
//                    var accuracy=(0.89976)*pow(ratio,7.7095)+0.111;
//                    return accuracy;
//                }
//            
            
            //=================
//            add();
            // Create tag to display beacon data.
//            app.rssi=beacon.rssi;
//            var ratio=-70-beacon.rssi;
//            var distance=beacon.rssi*1/-84;
        var distance=0;
            if(beacon.rssi==0){
                distance=-1;
            }
            var ratio=beacon.rssi*1/-84;
            if(ratio<1){
                distance=Math.pow(ratio,10);
            }
            else{
                distance= 0.89976*Math.pow(ratio,7.7095)+0.111;
            }
//               var d=(beacon.rssi*(-10*2)/-84)-Math.log(1);
//            distance=Math.log((d*(-1)));
           
           // distance=Math.pow(10,d);
            var element = $(
                    '<li>'
                    + '<strong>UUID: ' + beacon.uuid + '</strong><br />'
                    + 'Major: ' + beacon.major + '<br />'
                    + 'Minor: ' + beacon.minor + '<br />'
                    + 'Proximity: ' + beacon.proximity + '<br />'
                    + 'RSSI: ' + beacon.rssi + '<br />'
//                    + 'RSSI-maX: ' + rM + '<br />'
                    + 'Distance: ' + beacon.accuracy  + '<br />'
//                    + 'Max major:' + majorMax + '<br/>'
//                    + 'Max minor:' + minorMax + '<br/>'
                    + '<div style="background:rgb(255,128,64);height:20px;width:'
                    + rssiWidth + '%;"></div>'
                    + '</li>'
                    );
            $('#warning').remove();
            $('#found-beacons').append(element);
           

        }
      
    });
   var beaconsWithRadiuses= buildBeakonsWithRadiusesArray(scannedBeakonsArr,existedBeaconsArr);
    var realPosition = detectRealPosition(beaconsWithRadiuses);
    $('#cordinate').html(realPosition.lat+" "+realPosition.lng);
}

//	return app;
//};

//app.initialize();
//function add(){
//    for(var i=0;i<5;i++)
//    {
//           window.locationManager = cordova.plugins.locationManager;
////    alert("start scan");
//    // Start tracking beacons!
//    startScan();
//
//    // Display refresh timer.
//    updateTimer = setInterval(displayBeaconList, 500);
//         app.rssiArr.push(app.rssi);  
//    }
//   
//  
//}