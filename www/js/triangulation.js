var existedBeaconsArr = [
    // {name, lat, lng, uid, major, minor}
    {name: 'mTDB', lat: 0, lng: 0, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '14575', minor: '21386'},
    {name: 'A4xg', lat: 7, lng: 0, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46650', minor: '37051'},
    {name: 'c5nr', lat: 0, lng: 4.2, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46609', minor: '33951'},
];


var scannedBeaconsArr = [
//    //  uuid, major, minor, rssi
    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '14575', minor: '21386', rssi: -82, accuracy: 2.2 / 2},
    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46650', minor: '37051', rssi: -76, accuracy: 1 / 2},
    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46609', minor: '33951', rssi: -62, accuracy: 0.44 / 2}
];


function buildBeaconsWithRadiusesArray(scannedBeaconsArr, existedBeaconsArr) {
    var beaconsWithRadiuses = [];
    for (var i in scannedBeaconsArr) {
        var currScannedBeacon = scannedBeaconsArr[i];
        for (var j in existedBeaconsArr) {
            var currExistedBeacon = existedBeaconsArr[j];
            if ((currScannedBeacon.uuid.toLowerCase() == currExistedBeacon.uuid.toLowerCase())
                && (currScannedBeacon.major == currExistedBeacon.major)
                && (currScannedBeacon.minor == currExistedBeacon.minor)
            ) {
                beaconsWithRadiuses.push({
                    lng: currExistedBeacon.lng,
                    lat: currExistedBeacon.lat,
                    radius: currScannedBeacon.accuracy
                });
            }
        }
    }
    return beaconsWithRadiuses;
}


function calculateDistanceBetweenTwoDots(P1, P2) {
    var k1 = Math.abs(P2.lat - P1.lat);
    var k2 = Math.abs(P2.lng - P1.lng);
    var dist = Math.sqrt(k1 * k1 + k2 * k2);
    return dist;
}


function findIntersectDotsByTwoCircles(P1, P2) {  //Px{ lat, lng, radius }
    var l = calculateDistanceBetweenTwoDots(P1, P2);
    var R1 = P1.radius;
    var R2 = P2.radius;

    var b = (R2 * R2 - R1 * R1 + l * l) / (2 * l);
    var a = l - b;
    var h = Math.sqrt(R2 * R2 - b * b);

    var P0lng = P1.lng + (a / l) * (P2.lng - P1.lng);
    var P0lat = P1.lat + (a / l) * (P2.lat - P1.lat);

    var D1lng = P0lng + ( P2.lat - P1.lat ) / l * h;
    var D1lat = P0lat - ( P2.lng - P1.lng ) / l * h;

    var D2lng = P0lng - ( P2.lat - P1.lat ) / l * h;
    var D2lat = P0lat + ( P2.lng - P1.lng ) / l * h;

    return {D1: {lng: D1lng, lat: D1lat}, D2: {lng: D2lng, lat: D2lat}};
}


//var beaconsWithRadiuses = [
//    {lng: -2, lat: 3, radius: 4.1},
//    {lng: 4, lat: 2, radius: 5.8},
//    //{lng: 4, lat: 2, radius: 7.8},
//    {lng: 1, lat: 5, radius: 6.32}
//];

function detectRealPosition(beaconsWithRadiuses) {
    var dots = [];
    for (var i = 0; i < beaconsWithRadiuses.length; i++) {
        for (var j = i; j < beaconsWithRadiuses.length; j++) {
            if (i != j) {
                var dotsPair = findIntersectDotsByTwoCircles(beaconsWithRadiuses[i], beaconsWithRadiuses[j]);
                if (!isNaN(dotsPair.D1.lat) && !isNaN(dotsPair.D1.lng) && !isNaN(dotsPair.D2.lat) && !isNaN(dotsPair.D2.lng)) {
                    dots.push(dotsPair.D1);
                    dots.push(dotsPair.D2);
                }

            }
        }
    }

    for (var i = 0; i < dots.length; i++) {
        for (var j = 0; j < dots.length; j++) {
            if (i != j) {
                var currDot = dots[i];
                if (!currDot.probability) {
                    currDot.probability = 0;
                }
                var distBetweenDots = calculateDistanceBetweenTwoDots(currDot, dots[j]);
                if (!isNaN(distBetweenDots)) {
                    currDot.probability += 1 / distBetweenDots;
                }
            }
        }
    }

    dots.sort(function (a, b) {
        return b.probability - a.probability;
    });

    var count = 0;
    if (dots.length <= 2) {
        count = dots.length;
    } else {
        count = dots.length / 2;
    }

    var avgLng = 0;
    var avgLat = 0;
    var probability = -1;
    //for(var i=0; i<count; i++){
    //    var currDot = dots[i];
    //    avgLng+=currDot.lng;
    //    avgLat+=currDot.lat;
    //}
    //avgLng = //avgLng/count;
    //avgLat = //avgLat/count;
    var s = {lng_num: 0, lng_den: 0, lat_num: 0, lat_den: 0};
    for (var i = 0; i < count; i++) {
        var currDot = dots[i];
        s.lat_num += currDot.lat * currDot.probability;
        s.lat_den += currDot.probability;
        s.lng_num += currDot.lng * currDot.probability;
        s.lng_den += currDot.probability;
    }

    avgLat = s.lat_num / s.lat_den;
    avgLng = s.lng_num / s.lng_den;
    if(dots[0]){
        probability = dots[0].probability;
    }

    return {lng: avgLng, lat: avgLat, probability: probability};
}


function corelateResult(beaconsWithRadiuses) {
    var count = 60,
        min = 0.3,
        max = 2.8,
        resultArr = [];


    var step = (min + max) / count;

    for (var i = 0; i < count; i++) {
        var clonedBeaconsWithRadiuses = beaconsWithRadiuses.slice(0);

        // change radiuses
        var currRadiusKoeficient = (i + 1) * step;
        for (var j = 0; j < clonedBeaconsWithRadiuses.length; j++) {
            clonedBeaconsWithRadiuses[j].radius = clonedBeaconsWithRadiuses[j].radius * currRadiusKoeficient;
        }
        var realPosition = detectRealPosition(clonedBeaconsWithRadiuses);
        realPosition.radiusKoeficient = currRadiusKoeficient;
        resultArr.push(realPosition);

        resultArr.sort(function (a, b) {
            return b.probability - a.probability;
        });
    }

    return resultArr[0];
}

var beaconsWithRadiuses = buildBeaconsWithRadiusesArray(scannedBeaconsArr, existedBeaconsArr);
var realPosition = corelateResult(beaconsWithRadiuses);
realPosition;