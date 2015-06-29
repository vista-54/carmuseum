

//alert("start");
// Specify your beacon 128bit UUIDs here.
var regions =
        [
            // Sample UUIDs for beacons in our lab.
            {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E'},
        ];

// Dictionary of beacons.
var beacons = {};
var scannedBeaconsArr = [];
var avgArrayCount = 12;

// Timer that displays list of beacons.
var updateTimer = null;


function initIndoorLocation()
{
    if (isMobile) {
        window.locationManager = cordova.plugins.locationManager;
        // Start tracking beacons!
        startScan();
    } else {

        //==========================   emulation for chrome  ============
        scannedBeaconsArr = [
            {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '14575', minor: '21386', rssi: -82, accuracy: 8.2 /*10*/},
            {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46650', minor: '37051', rssi: -76, accuracy: 4.2},
            {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46609', minor: '33951', rssi: -62, accuracy: 7}
        ];


        var beaconsWithRadiuses = buildBeaconsWithRadiusesArray(scannedBeaconsArr, existedBeaconsArr);
        var realPosition = corelateResult(beaconsWithRadiuses);
        //var realPosition = detectRealPosition(beaconsWithRadiuses);

        setInterval(function () {
            updateIndoorMap(beaconsWithRadiuses, realPosition);
        }, 4000);
    }

    // Display refresh timer.
    updateTimer = setInterval(displayBeaconList, 500);

    initIndoorMap();

}

function stopIndoorLocation() {
    updateTimer.clearInterval();
}



//====utils
function findBeaconInArr(scannedBeaconsArr, beacon) {
    var count = scannedBeaconsArr.length;
    //var beaconObj={uuid:uuid,minor:minor,major:major};

    for (var i = 0; i < count; i++) {
        var currScannedBeacon = scannedBeaconsArr[i];
        if ((beacon.uuid == currScannedBeacon.uuid) && (beacon.minor == currScannedBeacon.minor) && (beacon.major == currScannedBeacon.major))
        {
            return scannedBeaconsArr[i];
        }
    }
    return null;
}

function getNameOfBeacon(existedBeacons, beacon) {
    var searched = findBeaconInArr(existedBeacons, beacon);
    return (searched === null) ? null : searched.name;
}


function avgFromArray(arr) {
    var sum = 0;
    var count = 0;
    for (var i in arr) {
        sum += arr[i];
        count++;
    }
    if (count > 0) {
        return sum / count;
    }
    return 0;
}




function startScan()
{

    // The delegate object holds the iBeacon callback functions
    // specified below.
    var delegate = new locationManager.Delegate();
    // Called continuously when ranging beacons.

    delegate.didRangeBeaconsInRegion = function (pluginResult)
    {
        var maxRSSI = -100;
        var tempScannedBeakons = [];
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


            var relevantBeacon = findBeaconInArr(scannedBeaconsArr, beacon);
            if (relevantBeacon !== null) {
                if (relevantBeacon.avgArray.length >= avgArrayCount) {
                    relevantBeacon.avgArray.shift();
                }
            } else {
                relevantBeacon = {uuid: beacon.uuid, major: beacon.major, minor: beacon.minor,
                    rssi: beacon.rssi, accuracy: 0, avgArray: []};

            }
            relevantBeacon.avgArray.push(beacon.accuracy);
            relevantBeacon.accuracy = avgFromArray(relevantBeacon.avgArray);

            tempScannedBeakons.push(relevantBeacon);
        }

        scannedBeaconsArr = tempScannedBeakons;


        max = maxRSSI;
        updateIndoorMap(scannedBeaconsArr);
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

    var rM = -100;//min value of rssi
//    var majorMax=0;//
//    var minorMax=0;
    var uuid = 0;//uuid start =0
    // Update beacon list.
    $.each(beacons, function (key, beacon)
    {
        //The cycle find max value of rssi and get this uuid.
        if (beacon.rssi > rM)
        {
            rM = beacon.rssi;
//            majorMax=beacon.major;
//            minorMax=beacon.minor;
            uuid = beacon.uuid;
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
                    + 'Major: ' + beacon.major + ' &nbsp; &nbsp; '
                    + 'Minor: ' + beacon.minor + '<br />'
                    + 'Proximity: ' + beacon.proximity + '<br />'
                    + 'RSSI: ' + beacon.rssi + ' &nbsp; &nbsp; '
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

    var beaconsWithRadiuses = buildBeaconsWithRadiusesArray(scannedBeaconsArr, existedBeaconsArr);
    var realPosition = corelateResult(beaconsWithRadiuses);

    $('#cordinate').html(realPosition.lat + " " + realPosition.lng);
}



var indoorMap = null;
var museumPosLatLng = {latitude: 49.586050, longitude: 34.546947}; // todo change to real

function initIndoorMap() {
    var position = null;

    getCurrentPosition(afterGettingPosition);

    function afterGettingPosition(result) {
        if (result.status === 'success') {

            position = result.position;
            console.log(' position.latitude : ' + position.latitude + ';   position.longitude : ' + position.longitude);

            drawMap(museumPosLatLng);

        } else {
            showErrorMessage(eMsg.cannotGetPosition);
        }
    }
    ;


    function drawMap(position) {
        var posLatlng = new google.maps.LatLng(position.latitude, position.longitude);
        var mapOptions = {
            zoom: 512,
            center: posLatlng
        };
        var _indoorMap = new google.maps.Map(document.getElementById('indoor-map'), mapOptions);
        indoorMap = _indoorMap;
    }


}

var beaconsOnMap = [];
var userPosOnMap = null;

function updateIndoorMap(scannedBeaconsArr, userPosition) {
    if (indoorMap != null) {
        // add beakons with radiuses
        for (var i in scannedBeaconsArr) {
            var currBeacon = scannedBeaconsArr[i];

            var existedBeacon = findBeaconInMap(beaconsOnMap, currBeacon);
            if (existedBeacon != null) {
                existedBeacon.radius = currBeacon.radius;
                existedBeacon.circle.setRadius(existedBeacon.radius);
            } else {
                var beaconPos = new google.maps.LatLng(currBeacon.lat, currBeacon.lng);
                var marker = new google.maps.Marker({
                    position: beaconPos,
                    map: indoorMap,
                    title: currBeacon.name
                });
                var circleOpts = {
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                    map: indoorMap,
                    center: beaconPos,
                    radius: currBeacon.radius
                };
                var circle = new google.maps.Circle(circleOpts);
                currBeacon.marker = marker;
                currBeacon.circle = circle;
                
                beaconsOnMap.push(currBeacon);
            }
            
            if(userPosOnMap !== null){
                userPosOnMap.avgRadius = userPosition.avgRadius;
                userPosOnMap.circle.setRadius(userPosition.avgRadius);
            }else{
                var userPosLatLng = new google.maps.LatLng(userPosition.lat, userPosition.lng);
                var marker = new google.maps.Marker({
                    position: userPosLatLng,
                    map: indoorMap,
                    title: "My"
                });
                var circleOpts = {
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#0000FF',
                    fillOpacity: 0.35,
                    map: indoorMap,
                    center: userPosLatLng,
                    radius: userPosition.avgRadius
                };
                var circle = new google.maps.Circle(circleOpts);
                var up = userPosition;
                up.marker = marker;
                up.circle = circle;
                userPosOnMap = up;
            }


        }


    }
}



function findBeaconInMap(beaconsOnMap, beacon) {

    for (var i = 0; i < beaconsOnMap.length; i++) {
        var currScannedBeacon = beaconsOnMap[i];
        if ((beacon.lat == currScannedBeacon.lat) && (beacon.lng == currScannedBeacon.lng) )
        {
            return beaconsOnMap[i];
        }
    }
    return null;
}

