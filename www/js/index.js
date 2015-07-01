

var directionsService, map;
im = {
//    uuid: null,
    readyCounter: 0,
    p: null,
    uuid: null,
    power: 0,
    scannedBeakonsArr:[]
};

var id = {
    originalHost: null,
    host: null,
    iBeaconId: []
};
//var bodyHeight = null;
//var bodyWidth = null;
var isMobile = false;
if (document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
    isMobile = true;
}
var store = window.localStorage;

//function addDataToStore() {
//    store.setItem('UUID', JSON.stringify(id.iBeaconId));
//}
document.addEventListener("deviceready", checkFullReady, false);

$(document).ready(function () {
    console.log('document ready');

    checkFullReady();

});

function checkFullReady() {
    im.readyCounter++;
    if (!isMobile) {
        im.readyCounter++;
    }
    if (im.readyCounter === 2) {
        console.log('full ready');
        fullReady();
    }

}


function fullReady(){
    readHost();
    
    googleMapLoadScript();
    
}


function readHost() {
    var storedHost = store.getItem('host');
    if (storedHost) {
        id.host = storedHost;
    } else {
        id.host = id.originalHost;
    }
}

function loadContent(page) {
    if (page === 'location') {
        $('#content').load('1.html #location', function () {
            
//                setTimeout(function () {

//        createMap();
//    }, 500);

        });

    }
    if (page === 'exhibits') {
        $('#content').load('1.html #exhibits', function () {
            //calculateAccuracy();//
            im.uuid = 0;
//            im.p='ex';
//            testAPIController();
            initIndoorLocation();

        });

    }
    if (page === 'menu') {
        $('#content').load('index.html #menu', function () {
//            im.p='menu';

//            app.initialize();
//            testAPIController();

        });

    }
    if (page === 'navi') {
        $('#content').load('index.html #menu', function () {
//            im.p='menu';

//            app.initialize();
//            testAPIController();

        });

    }

}
//function calculateAccuracy() {
//    alert("1m");
//    add();
//}
//function  testAPIController(){
//    var data={};
//   data.id="test";
//           getData(data, response);
//        function response(result)
//        {
//            console.log(result);
//  
//        }
//
//}

function FindBeaconInDataBase($uuid) {

    if (im.uuid != $uuid)
    {
//        app.Mjm = $majorMax;
//        app.Mnm = $minorMax;
        im.uuid = $uuid;
//        var u = getRandomInt(0, 4);
        var data = {};
//        data.indicate = 'GetData';
//        data.title = im.titles[u];
        data.uuid = im.uuid;
//bodyHeight = document.body.offsetHeight;
//    bodyWidth = document.body.offsetWidth;
        getData(data, response);
        function response(result)
        {
            console.log(result);
            var frameHtml = '<iframe id="main-frame" src="' + result.data + '" ' +
                    'height="' + 450 + '" ' +
                    'name="main-frame" class="main-frame " ' +
                    'scrolling="yes" ' +
                    'wmode="Opaque" ' +
                    'noresize="noresize" ' +
                    '  </iframe>';
//            if (result.status.error) {
////            showErrorMessage(result.error);
//                $.unblockUI();
//                return;
//            }
//            var obj = result.data[0];
//            var title = obj.title_lot;
//            var body = obj.desc_lot;
//            var img = obj.image;
            $("#list").html(frameHtml);
        }

    }
}
//function change() {
//    if (im.v === 1) {
//        var img = document.getElementById("ch");
//        var att = document.createAttribute("src");
//        att.value = im.i1;
//        img.setAttributeNode(att);
//    }
//    if (im.v === 2) {
//        var img = document.getElementById("ch");
//        var att = document.createAttribute("src");
//        att.value = im.i2;
//        img.setAttributeNode(att);
//    }
//    if (im.v === 3) {
//        var img = document.getElementById("ch");
//        var att = document.createAttribute("src");
//        att.value = im.i3;
//        img.setAttributeNode(att);
//    }
//    if (im.v === 4) {
//        var img = document.getElementById("ch");
//        var att = document.createAttribute("src");
//        att.value = im.i4;
//        img.setAttributeNode(att);
//    }
//    if (im.v === 5) {
//        var img = document.getElementById("ch");
//        var att = document.createAttribute("src");
//        att.value = im.i5;
//        img.setAttributeNode(att);
//    }
//}
//function getRandomInt(min, max)
//{
//    return Math.floor(Math.random() * (max - min + 1)) + min;
//}




//==================Location==========================
function initializeGoogleMap() {
    console.log('google maps initialized success');
    createMap();
}
function googleMapLoadScript() {
    setTimeout(function () {
        $.getScript('http://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&' +
                'callback=initializeGoogleMap');
    }, 500);
}

function getCurrentPosition(callback) {
    if(getCurrentPosition.lastCallMillis){
        var currMillis = new Date().getMilliseconds();
        if(currMillis-getCurrentPosition.lastCallMillis < 100){  // 100 milliseconds default timeout
            getCurrentPosition.lastCallMillis = currMillis;
            if(getCurrentPosition.lastSavedCoords) {
                console.log("returned last saved coords");
                callback({status: 'success', position: getCurrentPosition.lastSavedCoords});
                return;
            }
        }
    }
    //if(! isDeviceReady() ){ return false;}
    navigator.geolocation.getCurrentPosition(
            function (position) {
                getCurrentPosition.lastSavedCoords = position.coords;
                callback({status: 'success', position: position.coords});
                console.log("return geo coords Success");
            },
            function (error) {
                callback({status: 'error', error: error});
                console.log("Fail getting coords");
            }
    );
}

function createMap() {
    console.log("mapcreate");
    var position = null;

    var afterGettingPosition = function (result) {
        if (result.status === 'success') {

            position = result.position;
            console.log(' position.latitude : ' + position.latitude + ';   position.longitude : ' + position.longitude);

            drawMap(position, {latitude: 50, longitude: 35});

        } else {
            showErrorMessage(eMsg.cannotGetPosition);
        }
    };

    getCurrentPosition(afterGettingPosition);
}


function drawMap(fromPosition, toPosition) {
    var mapContainer = $('#museum-map').get(0);
    var trackCoords = [];
    var fromPos = new google.maps.LatLng(fromPosition.latitude, fromPosition.longitude);
    var toPos = new google.maps.LatLng(toPosition.latitude, toPosition.longitude);
    trackCoords.push(fromPos);
    trackCoords.push(toPos);

    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(toPosition.latitude, toPosition.longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };


    map = new google.maps.Map(mapContainer, mapOptions);
    directionsService = new google.maps.DirectionsService();
    var markerCurrPos = new google.maps.Marker({
        position: fromPos,
        map: map,
        title: 'My pos'
    });

    var markerMuseumPos = new google.maps.Marker({
        position: toPos,
        map: map,
        title: 'Museum pos'
    });



    $('.map').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = e.target;
        if (target.tagName === 'IMG') {
            return false;
        }
    });
    requestDirections(fromPos, toPos, {strokeColor: "#ff0000"});
//    map.setCenter(trackCoords[0]);
//var trackPath = new google.maps.Polyline({
//        path: trackCoords ,
//        strokeColor: "#FF0000",
//        strokeOpacity: 1.0,
//        strokeWeight: 4
//    });
//
//trackPath.setMap(map);
//    addMarker(trackCoords[0],"Start");
//    addMarker(trackCoords[trackCoords.length-1],"finish");
}
function requestDirections(start, end, polylineOpts) {
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }, function (result) {
        renderDirections(result, polylineOpts);
    });
}
function renderDirections(result, polylineOpts) {
    var directionsRenderer;
    var rendererOptions = {
        map: map,
        suppressMarkers: true //disable default markers
    };
    directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions);

    directionsRenderer.setMap(map);

    if (polylineOpts) {
        directionsRenderer.setOptions({
            polylineOptions: polylineOpts
        });
    }

    directionsRenderer.setDirections(result);
}
//========================Location END==========================================


//=============================Indoor init======================================
//
//
//IndoorNav = {
//    init: function (apikey, building) {
//        IndoorNav.indoors = new indoors(apikey, building);
//        IndoorNav.indoors.onmessage = function (e) {
//            console.log('MESSAGE: ' + e.data.indoorsEvent + ' | DATA: ' + e.data.indoorsData); //TODO
//        };
//        IndoorNav.indoors.onsuccess = function (e) {
//            console.log('SUCCESS: ' + e.data.indoorsEvent + ' | DATA: ' + e.data.indoorsData); //TODO
//        };
//        IndoorNav.indoors.onerror = function (e) {
//            console.log('ERROR: ' + e.data.indoorsEvent + ' | DATA: ' + e.data.indoorsData); //TODO
//        };
//    },
//    destruct: function () {
//        if (typeof IndoorNav.indoors != 'undefined') {
//            IndoorNav.indoors.destruct();
//        }
//    }
//};
//
//
//function indoorInit() {
//    //IndoorNav.init('APIKEY', 'BUILDINGID');
//    IndoorNav.init('APIKEY', '123456');
//
//}
//
////IndoorNav.init('APIKEY', 'BUILDINGID');
//$(window).unload(function () {
//    IndoorNav.destruct();
//});

//==========================================Init END============================