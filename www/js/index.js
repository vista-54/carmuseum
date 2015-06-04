/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
im = {
    i1: 'images/1.jpg',
    i2: 'images/2.jpg',
    i3: 'images/3.jpg',
    i4: 'images/4.jpg',
    i5: 'images/5.jpg',
    uuid: null,
    titles: ["ferrari", "nissan", "lamborgini", "audi", "dodge"]
};

var id = {
    originalHost: null,
    host: null,
    iBeaconId: []
};
var store = window.localStorage;

function addDataToStore() {
    store.setItem('UUID', JSON.stringify(id.iBeaconId));
}
$(document).ready(function () {

    console.log('document ready');
    readHost();
   

});
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
            app.initialize();
            readHost();
        });

    }
}

function ChangeImage($majorMax, $minorMax, $uuid) {

    if ((app.Mjm !== $majorMax) || (app.Mnm !== $minorMax))
    {
        app.Mjm = $majorMax;
        app.Mnm = $minorMax;
        app.uuid = $uuid;
        var u = getRandomInt(0, 4);
        var data = {};
//        data.indicate = 'GetData';
//        data.title = im.titles[u];
        data.uuid=app.uuid;

        getData(data, response);
        function response(result)
        {
            console.log(result);
            if (result.status.error) {
//            showErrorMessage(result.error);
                $.unblockUI();
                return;
            }
            var obj = result.data[0];
            var title = obj.title_lot;
            var body = obj.desc_lot;
            var img = obj.image;
            $("#list").html("<img src=" + img + "><br><h1>" + title + "</h1><br><p>" + body + "</p>");
        }

    }
}
function change() {
    if (im.v === 1) {
        var img = document.getElementById("ch");
        var att = document.createAttribute("src");
        att.value = im.i1;
        img.setAttributeNode(att);
    }
    if (im.v === 2) {
        var img = document.getElementById("ch");
        var att = document.createAttribute("src");
        att.value = im.i2;
        img.setAttributeNode(att);
    }
    if (im.v === 3) {
        var img = document.getElementById("ch");
        var att = document.createAttribute("src");
        att.value = im.i3;
        img.setAttributeNode(att);
    }
    if (im.v === 4) {
        var img = document.getElementById("ch");
        var att = document.createAttribute("src");
        att.value = im.i4;
        img.setAttributeNode(att);
    }
    if (im.v === 5) {
        var img = document.getElementById("ch");
        var att = document.createAttribute("src");
        att.value = im.i5;
        img.setAttributeNode(att);
    }
}
function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function initializeGoogleMap(){
    console.log('google maps initialized success');
}
function googleMapLoadScript() {
    setTimeout(function(){
        $.getScript('http://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&'+
            'callback=initializeGoogleMap');
    }, 500);  
}

function getCurrentPosition(callback){
    //if(! isDeviceReady() ){ return false;}
    //alert('buildJobsNearbyTabshowJobsNearbyTab() called  \n'+ isDeviceReady() );
    navigator.geolocation.getCurrentPosition(
        function(position){
            callback({status: 'success', position: position.coords});
        }, 
        function(error){
            callback({status: 'error', error: error});
        }
    );
}

function createMap() {

    var position = null;
   
    var afterGettingPosition = function(result) {
        if (result.status === 'success') {
            
            position = result.position;
            console.log(' position.latitude : '+ position.latitude +';   position.longitude : '+position.longitude);
            
                drawMap( position, {latitude:50, longitude: 35});
            
        } else {
            showErrorMessage(eMsg.cannotGetPosition);
        }
    };

    getCurrentPosition(afterGettingPosition);
}


function drawMap(fromPosition, toPosition ){
    var mapContainer = $('#museum-map').get(0);
    
   var fromPos = new google.maps.LatLng(fromPosition.latitude, fromPosition.longitude);
   var toPos = new google.maps.LatLng(toPosition.latitude, toPosition.longitude);
   

    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(toPosition.latitude, toPosition.longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };


    var map = new google.maps.Map(mapContainer, mapOptions);

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

    
    
    $('.map').click(function(e){
        e.preventDefault();
        e.stopPropagation();
        var target = e.target;
        if(target.tagName === 'IMG'){
            return false;
        }
    });
    
//    google.maps.event.addListenerOnce(map, 'idle', function(){
//        log('map loaded');
//        $('.map img').click(function(e){
//            e.preventDefault();
//            e.stopPropagation();
//            var a_href = $(e.target).parents('a').attr('href');
//            openSiteInDefaultBrowser(a_href);
//            return false;
//        });
//    });
    
}