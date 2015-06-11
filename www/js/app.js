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

    uuid:0
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
    // (Not used in this example, included as a reference.)
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
    $('#found-beacons').empty();
    $('#info').empty();
    
    var timeNow = Date.now();
    
    var rM=-100;//min value of rssi
//    var majorMax=0;//
//    var minorMax=0;
    var uuid=0;//uuid start =0
    // Update beacon list.
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
    $.each(beacons, function (key, beacon)
    {

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
            
            // Create tag to display beacon data.
            var element = $(
                    '<li>'
                    + '<strong>UUID: ' + beacon.uuid + '</strong><br />'
                    + 'Major: ' + beacon.major + '<br />'
                    + 'Minor: ' + beacon.minor + '<br />'
                    + 'Proximity: ' + beacon.proximity + '<br />'
                    + 'RSSI: ' + beacon.rssi + '<br />'
                    + 'RSSI-maX: ' + rM + '<br />'
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
}

//	return app;
//};

//app.initialize();
