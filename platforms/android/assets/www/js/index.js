var directionsService, map;
im = {
//    uuid: null,
    p: null,
    uuid: null,
    power: 0,
    scannedBeakonsArr: []
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
    var its = checkFullReady;
    if (!its.readyCounter) {
        its.readyCounter = 0;
    }
    its.readyCounter++;
    if (!isMobile) {
        its.readyCounter++;
    }
    if (its.readyCounter === 2) {
        console.log('full ready');
        fullReady();
    }
}


function fullReady() {
    readHost();
    googleMapLoadScript();
    getExistedBeaconsArr();
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
            googleMapLoadScript();
        });

    }
    if (page === 'exhibits') {
        $('#content').load('1.html #exhibits', function () {
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
    if (page === 'navigation') {
        $('#content').load('1.html #navigation', function () {
//            im.p='menu';
            //calculateAccuracy();//
            im.uuid = 0;
//            im.p='ex';
//            testAPIController();
            initIndoorLocation();
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
function ExhibitsLoadInfo(uuid, minor, major)
{
    var data = {};
    data.uuid = uuid;
    data.minor = minor;
    data.major = major;
    //alert(uuid+''+minor+''+major);
    getData(data, callback);
    function callback(result) {
        
        console.log(result);
          $('#exhibits').load('1.html #Exinfo', function () {
                      var frameHtml = '<iframe id="main-frame" src="' + result.data + '" ' +
                    'height="' + 450 + '" ' +
                    'name="main-frame" class="main-frame " ' +
                    'scrolling="yes" ' +
                    'wmode="Opaque" ' +
                    'noresize="noresize" ' +
                    '  </iframe>';
            $("#exinformation").html(frameHtml);
        });
    }
}
function FindBeaconInDataBase($uuid) {

    if (im.uuid != $uuid) {
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
        function response(result) {
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
    waitForLoadingMapsApi.apiIsLoaded = true;
    waitForLoadingMapsApi(null, true);
    console.log('google maps initialized success');


    var markerSize = {x: 22, y: 40};


    google.maps.Marker.prototype.setLabel = function (label) {
        this.label = new MarkerLabel({
            map: this.map,
            marker: this,
            text: label
        });
        this.label.bindTo('position', this, 'position');
    };

    var MarkerLabel = function (options) {
        this.setValues(options);
        this.span = document.createElement('span');
        this.span.className = 'map-marker-label';
    };

    MarkerLabel.prototype = $.extend(new google.maps.OverlayView(), {
        onAdd: function () {
            this.getPanes().overlayImage.appendChild(this.span);
            var self = this;
            this.listeners = [
                google.maps.event.addListener(this, 'position_changed', function () {
                    self.draw();
                })];
        },
        draw: function () {
            var text = String(this.get('text'));
            var position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
            this.span.innerHTML = text;
            this.span.style.left = (position.x - (markerSize.x / 2)) - (text.length * 3) + 10 + 'px';
            this.span.style.top = (position.y - markerSize.y + 40) + 'px';
        }
    });


    // Animated Marker Movement. Robert Gerlach 2012-2013 https://github.com/combatwombat/marker-animate
// MIT license
//
// params:
// newPosition        - the new Position as google.maps.LatLng()
// options            - optional options object (optional)
// options.duration   - animation duration in ms (default 1000)
// options.easing     - easing function from jQuery and/or the jQuery easing plugin (default 'linear')
// options.complete   - callback function. Gets called, after the animation has finished
    google.maps.Marker.prototype.animateTo = function (newPosition, options) {
        defaultOptions = {
            duration: 1000,
            easing: 'linear',
            complete: null
        }
        options = options || {};

        // complete missing options
        for (key in defaultOptions) {
            options[key] = options[key] || defaultOptions[key];
        }

        // throw exception if easing function doesn't exist
        if (options.easing != 'linear') {
            if (typeof jQuery == 'undefined' || !jQuery.easing[options.easing]) {
                throw '"' + options.easing + '" easing function doesn\'t exist. Include jQuery and/or the jQuery easing plugin and use the right function name.';
                return;
            }
        }

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

        // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
        this.AT_startPosition_lat = this.getPosition().lat();
        this.AT_startPosition_lng = this.getPosition().lng();
        var newPosition_lat = newPosition.lat();
        var newPosition_lng = newPosition.lng();

        // crossing the 180� meridian and going the long way around the earth?
        if (Math.abs(newPosition_lng - this.AT_startPosition_lng) > 180) {
            if (newPosition_lng > this.AT_startPosition_lng) {
                newPosition_lng -= 360;
            } else {
                newPosition_lng += 360;
            }
        }

        var animateStep = function (marker, startTime) {
            var ellapsedTime = (new Date()).getTime() - startTime;
            var durationRatio = ellapsedTime / options.duration; // 0 - 1
            var easingDurationRatio = durationRatio;

            // use jQuery easing if it's not linear
            if (options.easing !== 'linear') {
                easingDurationRatio = jQuery.easing[options.easing](durationRatio, ellapsedTime, 0, 1, options.duration);
            }

            if (durationRatio < 1) {
                var deltaPosition = new google.maps.LatLng(marker.AT_startPosition_lat + (newPosition_lat - marker.AT_startPosition_lat) * easingDurationRatio,
                        marker.AT_startPosition_lng + (newPosition_lng - marker.AT_startPosition_lng) * easingDurationRatio);
                marker.setPosition(deltaPosition);

                // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
                if (window.requestAnimationFrame) {
                    marker.AT_animationHandler = window.requestAnimationFrame(function () {
                        animateStep(marker, startTime)
                    });
                } else {
                    marker.AT_animationHandler = setTimeout(function () {
                        animateStep(marker, startTime)
                    }, 17);
                }

            } else {

                marker.setPosition(newPosition);

                if (typeof options.complete === 'function') {
                    options.complete();
                }

            }
        }

        // stop possibly running animation
        if (window.cancelAnimationFrame) {
            window.cancelAnimationFrame(this.AT_animationHandler);
        } else {
            clearTimeout(this.AT_animationHandler);
        }

        animateStep(this, (new Date()).getTime());
    }





    //=============  Map  =========================

    google.maps.Map.prototype.animateTo = function (newPosition, options) {
        defaultOptions = {
            duration: 1000,
            easing: 'linear',
            complete: null
        }
        options = options || {};

        // complete missing options
        for (key in defaultOptions) {
            options[key] = options[key] || defaultOptions[key];
        }

        // throw exception if easing function doesn't exist
        if (options.easing != 'linear') {
            if (typeof jQuery == 'undefined' || !jQuery.easing[options.easing]) {
                throw '"' + options.easing + '" easing function doesn\'t exist. Include jQuery and/or the jQuery easing plugin and use the right function name.';
                return;
            }
        }

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

        // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
        this.AT_startPosition_lat = this.getCenter().lat();
        this.AT_startPosition_lng = this.getCenter().lng();
        var newPosition_lat = newPosition.lat();
        var newPosition_lng = newPosition.lng();

        // crossing the 180� meridian and going the long way around the earth?
        if (Math.abs(newPosition_lng - this.AT_startPosition_lng) > 180) {
            if (newPosition_lng > this.AT_startPosition_lng) {
                newPosition_lng -= 360;
            } else {
                newPosition_lng += 360;
            }
        }

        var animateStep = function (map, startTime) {
            var ellapsedTime = (new Date()).getTime() - startTime;
            var durationRatio = ellapsedTime / options.duration; // 0 - 1
            var easingDurationRatio = durationRatio;

            // use jQuery easing if it's not linear
            if (options.easing !== 'linear') {
                easingDurationRatio = jQuery.easing[options.easing](durationRatio, ellapsedTime, 0, 1, options.duration);
            }

            if (durationRatio < 1) {
                var deltaPosition = new google.maps.LatLng(map.AT_startPosition_lat + (newPosition_lat - map.AT_startPosition_lat) * easingDurationRatio,
                        map.AT_startPosition_lng + (newPosition_lng - map.AT_startPosition_lng) * easingDurationRatio);
                map.setCenter(deltaPosition);

                // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
                if (window.requestAnimationFrame) {
                    map.AT_animationHandler = window.requestAnimationFrame(function () {
                        animateStep(map, startTime)
                    });
                } else {
                    map.AT_animationHandler = setTimeout(function () {
                        animateStep(map, startTime)
                    }, 17);
                }

            } else {

                map.setCenter(newPosition);

                if (typeof options.complete === 'function') {
                    options.complete();
                }

            }
        }

        // stop possibly running animation
        if (window.cancelAnimationFrame) {
            window.cancelAnimationFrame(this.AT_animationHandler);
        } else {
            clearTimeout(this.AT_animationHandler);
        }

        animateStep(this, (new Date()).getTime());
    }


    ///===========================================


    createMap();
}

function waitForLoadingMapsApi(callback, inited) {
    var its = waitForLoadingMapsApi;
    if (!its.callbacks) {
        its.callbacks = [];
    }
    if (!its.apiIsLoaded) {
        its.apiIsLoaded = false;
    }

    if (inited) {
        its.apiIsLoaded = true;
    }

    if (its.apiIsLoaded) {
        if (callback) {
            callback.call(null);
        }
    } else {
        if (callback) {
            its.callbacks.push(callback);
        }
    }

    if (its.apiIsLoaded) {
        while (its.callbacks.length > 0) {
            var currCallback = its.callbacks.shift();
            currCallback.call(null);
        }
    }
}

function googleMapLoadScript() {
    setTimeout(function () {
        $.getScript('http://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&' +
                'callback=initializeGoogleMap');
    }, 500);
}


function getCurrentPosition(callback) {
    var its = getCurrentPosition;
    if (!its.previousCallTime) {
        its.previousCallTime = 0;
    }
    if (!its.callbacks) {
        its.callbacks = [];
    }

    var previousCallTime = its.previousCallTime;
    var currTime = new Date().getTime();
    var addToCallbacks = false;
    if (currTime - previousCallTime < 100) {  // 100 milliseconds default timeout
        addToCallbacks = true;

    }
    its.previousCallTime = currTime;

    if (addToCallbacks) {
        its.callbacks.push(callback);
        return;
    }
    its.callbacks.push(callback);


    //if(! isDeviceReady() ){ return false;}
    navigator.geolocation.getCurrentPosition(
            function (position) {
                its.lastSavedCoords = position.coords;
                var retObj = {status: {success: true}, position: position.coords};
                while (its.callbacks.length > 0) {
                    var currCallback = its.callbacks.shift();
                    currCallback.call(null, retObj);
                }
                its.callbacks = [];
                console.log("return geo coords Success");
            },
            function (error) {
                var retObj = {status: {error: true}, error: error.message};
                while (its.callbacks.length > 0) {
                    var currCallback = its.callbacks.shift();
                    currCallback.call(null, retObj);
                }
                console.log("Fail getting coords");
            },
            {
                //enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 30000
            }
    );
}

function createMap() {
    console.log("mapcreate");
    var position = null;

    getCurrentPosition(afterGettingPosition);

    function afterGettingPosition(result) {
        if (result.error) {
            showErrorMessage(eMsg.cannotGetPosition + ' : ' + result.error);
            return;
        }

        position = result.position;
        console.log(' position.latitude : ' + position.latitude + ';   position.longitude : ' + position.longitude);

        waitForLoadingMapsApi(function () {
            drawMap(position, {latitude: 50, longitude: 35});
        });


    }
    ;


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


function getExistedBeaconsArr() {
    var data = {};

    getExistedBeacons(data, after);
    function after(result) {
        if (result.success) {
            for (var i in result.data) {
                var obj = result.data[i];
                var lat = parseFloat(obj.lat);
                var lng = parseFloat(obj.lng);
                obj.lat = lat;
                obj.lng = lng;
                existedBeaconsArr.push(obj);
            }
            //$("#list").html(frameHtml);

            regions = buildRegionsFromExistedBeacons(existedBeaconsArr);
        } else {
            showErrorMessage(result.error);
        }
    }
}