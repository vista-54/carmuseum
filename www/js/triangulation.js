var existedBeaconsArr = [
    // {name, lat, lng, uid, major, minor}
//    {name: 'mTDB', lat: 0, lng: 0, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '14575', minor: '21386'},
//    {name: 'A4xg', lat: 7, lng: 0, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46650', minor: '37051'},
//    {name: 'c5nr', lat: 0, lng: 4.2, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46609', minor: '33951'},

//    {name: 'mTDB', lat: 49.585966493118995,  lng: 34.546907767653465,  uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '14575', minor: '21386', height: 1 , level:1 },
//    {name: 'A4xg', lat: 49.58594519167159,   lng: 34.54695001244545,   uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46650', minor: '37051', height: 1 , level:1 },
//    {name: 'c5nr', lat: 49.585991272342035,  lng: 34.54693593084812,   uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46609', minor: '33951', height: 1 , level:1 },
];


//var scannedBeaconsArr = [
////    //  uuid, major, minor, rssi
//    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '14575', minor: '21386', rssi: -82, accuracy: 8.2 /*10*/},
//    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46650', minor: '37051', rssi: -76, accuracy: 4.2},
//    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46609', minor: '33951', rssi: -62, accuracy: 7}
//];


function buildRegionsFromExistedBeacons(existedBeacons){
    var regionsArr = [];
    for(var i in existedBeacons){
        var currExtBcn = existedBeacons[i];
        var exists = false;
        for(var j in regionsArr){
            var currReg = regionsArr[j];
            if(currReg.uuid.toLowerCase() === currExtBcn.uuid.toLowerCase()){
                exists = true;
                continue;
            }
        }
        if(!exists){
            regionsArr.push({uuid: currExtBcn.uuid});
        }
        
    }
    return regionsArr;
}



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


function calculateDistanceBetweenTwoDots(P1, P2, measure ) {
    
    if(measure == 'deg'){
        var R = 6378.137; // Radius of earth in KM
        var dLat = (P2.lat - P1.lat) * Math.PI / 180;
        var dLng = (P2.lng - P1.lng) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(P1.lat * Math.PI / 180) * Math.cos(P2.lat * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters
    }
    if(measure == 'met'){
        var k1 = Math.abs(P2.lat - P1.lat);
        var k2 = Math.abs(P2.lng - P1.lng);
        var dist = Math.sqrt(k1 * k1 + k2 * k2);
        return dist;
    }
    return null;
}


function findIntersectDotsByTwoCircles(P1, P2 , measure) {  //Px{ lat, lng, radius }
    var l = calculateDistanceBetweenTwoDots(P1, P2, measure);
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


function detectRealPosition(beaconsWithRadiuses, measure) {
    var interDots = [];
    var lines = [];

    if(beaconsWithRadiuses.length==0){
        return null;
    }

    //only one beacon
    if (beaconsWithRadiuses.length == 0) {
        var beacon = beaconsWithRadiuses[0];
        var dot = {
            lng: beacon.lat,
            lat: beacon.lng,
            probability: 0.1,
            avgRadius: beacon.radius,
            maxDistance: beacon.radius,
            minDistance: 0
        };
        return dot;
    }


    for (var i = 0; i < beaconsWithRadiuses.length; i++) {
        for (var j = i; j < beaconsWithRadiuses.length; j++) {
            if (i != j) {
                var dotsPair = findIntersectDotsByTwoCircles(beaconsWithRadiuses[i], beaconsWithRadiuses[j] , measure);
                if (!isNaN(dotsPair.D1.lat) && !isNaN(dotsPair.D1.lng) && !isNaN(dotsPair.D2.lat) && !isNaN(dotsPair.D2.lng)) {
                    //interDots.push(dotsPair.D1);
                    //interDots.push(dotsPair.D2);
                    dotsPair.R1 = beaconsWithRadiuses[i].radius;
                    dotsPair.R2 = beaconsWithRadiuses[j].radius;
                    lines.push(dotsPair);  // its line

                } else {
                    // not intersects
                    //console.log('not intersects: '+beaconsWithRadiuses[i]+ ' with '+beaconsWithRadiuses[j]);
                    return null;
                }
            }
        }
    }


    for (var i = 0; i < lines.length; i++) {
        for (var j = i; j < lines.length; j++) {
            if (i != j) {
                var interDot = getIntersectDot(lines[i], lines[j]);
                if (interDot) {
                    interDots.push(interDot);
                }

            }
        }
    }


    // one line , no intersect dots
    if (lines.length == 1) {
        //one line is two centers of circles
        var lineCirclesCenters = {D1: beaconsWithRadiuses[0], D2: beaconsWithRadiuses[1]};
        lines.push(lineCirclesCenters);
        var interDot = getIntersectDot(lines[0], lineCirclesCenters);
        interDots.push(interDot);
        interDots.push(interDot); // need for working algorithm

    }


    var intersectDot = {};
    var id = {lng_sum: 0, lat_sum: 0, count: 0};
    for (var i = 0; i < interDots.length; i++) {
        for (var j = i; j < interDots.length; j++) {
            if (i != j) {
                id.count++;
                id.lat_sum += interDots[i].lat;
                id.lng_sum += interDots[j].lng;
            }
        }
    }
    intersectDot.lat = id.lat_sum / id.count;
    intersectDot.lng = id.lng_sum / id.count;


    // get minimal length;
    var nearDots = [];
    for (var i = 0; i < lines.length; i++) {
        var dot1len = calculateDistanceBetweenTwoDots(intersectDot, lines[i].D1, measure);
        var dot2len = calculateDistanceBetweenTwoDots(intersectDot, lines[i].D2, measure);
        var min = Math.min(dot1len, dot2len);
        var nearDot = dot2len - dot1len >= 0 ? lines[i].D1 : lines[i].D2;
        nearDot.probability = 1 / min;
        nearDot.distance = min;
        nearDots.push(nearDot);
    }


    var s = {
        lng_num: 0,
        lng_den: 0,
        lat_num: 0,
        lat_den: 0,
        sum_prob: 0,
        sum_distance: 0,
        maxDistance: 0,
        minDistance: 1000
    };
    for (var i = 0; i < nearDots.length; i++) {
        var currDot = nearDots[i];
        s.lat_num += currDot.lat * currDot.probability;
        s.lat_den += currDot.probability;
        s.lng_num += currDot.lng * currDot.probability;
        s.lng_den += currDot.probability;
        s.sum_prob += currDot.probability;
        s.sum_distance += currDot.distance;
        if (currDot.distance > s.maxDistance) {
            s.maxDistance = currDot.distance;
        }
        if (currDot.distance < s.minDistance) {
            s.minDistance = currDot.distance;
        }
    }

    var avgLat = s.lat_num / s.lat_den;
    var avgLng = s.lng_num / s.lng_den;
    var probability = s.sum_prob / nearDots.length;
    var avgRadius = s.sum_distance / nearDots.length;

    return {
        lng: avgLng,
        lat: avgLat,
        probability: probability,
        avgRadius: avgRadius,
        maxDistance: s.maxDistance,
        minDistance: s.minDistance
    };
}


function corelateResult(beaconsWithRadiuses) {
    var count = 20,
        min = 0.5,
        max = 2.5,
        resultArr = [];


    var step = (min + max) / count;

    for (var i = 0; i < count; i++) {
        //var clonedBeaconsWithRadiuses = beaconsWithRadiuses.slice();
        var clonedBeaconsWithRadiuses = JSON.parse(JSON.stringify(beaconsWithRadiuses));

        // change radiuses
        var currRadiusKoeficient = (i + 1) * step;
        for (var j = 0; j < clonedBeaconsWithRadiuses.length; j++) {
            var currRadius = beaconsWithRadiuses[j].radius;
            clonedBeaconsWithRadiuses[j].radius = currRadius * currRadiusKoeficient;
        }
        var realPosition = detectRealPosition(clonedBeaconsWithRadiuses, 'deg');
        if (realPosition != null && !isNaN(realPosition.probability)) {
            realPosition.radiusKoeficient = currRadiusKoeficient;
            resultArr.push(realPosition);
        }


    }
    resultArr.sort(function (a, b) {
        return b.probability - a.probability;
    });

    return resultArr[0];
}


function getIntersectDot(line1, line2) {

    // возвращаем true если b находится между a и c,
    // исключаем случай, если a==b или b==c
    function isInBetween(a, b, c) {
        // возвращаем false, если b почти равна a или c.
        // для этого применяем значение с плавающей точкой 0.00000...0001
        if (Math.abs(a - b) < 0.000001 || Math.abs(b - c) < 0.000001) {
            return false;
        }

        // true, если b между a и c
        return (a < b && b < c) || (c < b && b < a);
    }


    var a1 = line1.D2.lat - line1.D1.lat;
    var b1 = line1.D1.lng - line1.D2.lng;
    var c1 = a1 * line1.D1.lng + b1 * line1.D1.lat;

    // преобразуем линию line2 в общую форму уравнения прямой: Ax+By = C
    var a2 = line2.D2.lat - line2.D1.lat;
    var b2 = line2.D1.lng - line2.D2.lng;
    var c2 = a2 * line2.D1.lng + b2 * line2.D1.lat;

    // вычисляем точку пересечения
    var d = a1 * b2 - a2 * b1;

    // линии параллельны, если d = 0
    if (d == 0) {
        return false;
    }
    else {
        var x = (b2 * c1 - b1 * c2) / d;
        var y = (a1 * c2 - a2 * c1) / d;


        // проверяем, находится ли точка пересечения на обоих линиях
        //if ((isInBetween(line1.D1.lng, x, line1.D2.lng) ||
        //    isInBetween(line1.D1.lat, y, line1.D2.lat)) &&
        //    (isInBetween(line2.D1.lng, x, line2.D2.lng) ||
        //    isInBetween(line2.D1.lat, y, line2.D2.lat)))
        //{
        //    //return true;
        //    return {lat: y, lng: x};
        //}

        return {lat: y, lng: x};

    }

    return false;
}
//
//
//var beaconsWithRadiuses = buildBeaconsWithRadiusesArray(scannedBeaconsArr, existedBeaconsArr);
//var realPosition = corelateResult(beaconsWithRadiuses, 'deg');
//var realPosition = detectRealPosition(beaconsWithRadiuses, 'deg');
//realPosition;



