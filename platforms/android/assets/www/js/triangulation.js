var existedBeaconsArr = [
    // {name, lat, lng, uid, major, minor}
    {name: 'mTDB', lat: 0, lng: 0, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '14575', minor: '21386'},
    {name: 'A4xg', lat: 7, lng: 0, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46650', minor: '37051'},
    {name: 'c5nr', lat: 0, lng: 4.2, uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46609', minor: '33951'},
];

//
//var scannedBeaconsArr = [
////    //  uuid, major, minor, rssi
//    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '14575', minor: '21386', rssi: -82, accuracy: /*8.2*/ 10},
//    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46650', minor: '37051', rssi: -76, accuracy: 4.2},
//    {uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E', major: '46609', minor: '33951', rssi: -62, accuracy: 7}
//];


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
    var interDots = [];
    var lines = [];
    for (var i = 0; i < beaconsWithRadiuses.length; i++) {
        for (var j = i; j < beaconsWithRadiuses.length; j++) {
            if (i != j) {
                var dotsPair = findIntersectDotsByTwoCircles(beaconsWithRadiuses[i], beaconsWithRadiuses[j]);
                if (!isNaN(dotsPair.D1.lat) && !isNaN(dotsPair.D1.lng) && !isNaN(dotsPair.D2.lat) && !isNaN(dotsPair.D2.lng)) {
                    //interDots.push(dotsPair.D1);
                    //interDots.push(dotsPair.D2);
                    dotsPair.R1 = beaconsWithRadiuses[i].radius;
                    dotsPair.R2 = beaconsWithRadiuses[j].radius;
                    lines.push(dotsPair);  // its line

                }else{
                    // not intersects
                    console.log('not intersects: '+beaconsWithRadiuses[i]+ ' with '+beaconsWithRadiuses[j]);
                }
            }
        }
    }


    for(var i=0; i<lines.length; i++){
        for(var j=i; j<lines.length; j++){
            if(i!=j){
                var interDot = getIntersectDot(lines[i], lines[j]);
                if(interDot){
                    interDots.push(interDot);
                }

            }
        }
    }


    var intersectDot = {};
    var id = {lng_sum: 0, lat_sum: 0, count:0};
    for (var i = 0; i < interDots.length; i++) {
        for (var j = i; j < interDots.length; j++) {
            if (i != j) {
                id.count++;
                id.lat_sum += interDots[i].lat;
                id.lng_sum += interDots[j].lng;
            }
        }
    }
    intersectDot.lat = id.lat_sum/id.count;
    intersectDot.lng = id.lng_sum/id.count;


    // get minimal length;
    var nearDots = [];
    for(var i=0; i<lines.length; i++) {
        var dot1len = calculateDistanceBetweenTwoDots(intersectDot, lines[i].D1);
        var dot2len = calculateDistanceBetweenTwoDots(intersectDot, lines[i].D2);
        var min = Math.min(dot1len, dot2len);
        var nearDot = dot2len-dot1len >=0 ? lines[i].D1 :  lines[i].D2;
        nearDot.probability = 1/min;
        nearDots.push(nearDot);
    }





    //for (var i = 0; i < interDots.length; i++) {
    //    for (var j = i; j < interDots.length; j++) {
    //        if (i != j) {
    //            var currDot = interDots[i];
    //            if (!currDot.probability) {
    //                currDot.probability = 0;
    //            }
    //            var distBetweenDots = calculateDistanceBetweenTwoDots(currDot, interDots[j]);
    //            if (!isNaN(distBetweenDots)) {
    //                currDot.probability += 1 / distBetweenDots;
    //            }
    //        }
    //    }
    //}

    nearDots.sort(function (a, b) {
        return b.probability - a.probability;
    });
    //
    //var count = 0;
    //if (interDots.length <= 2) {
    //    count = interDots.length;
    //} else {
    //    count = interDots.length / 2;
    //}



    var avgLng = 0;
    var avgLat = 0;
    var probability = -1;
    //for(var i=0; i<count; i++){
    //    var currDot = interDots[i];
    //    avgLng+=currDot.lng;
    //    avgLat+=currDot.lat;
    //}
    //avgLng = //avgLng/count;
    //avgLat = //avgLat/count;
    var s = {lng_num: 0, lng_den: 0, lat_num: 0, lat_den: 0, sum_prob:0};
    for (var i = 0; i <nearDots.length; i++) {
        var currDot = nearDots[i];
        //currDot.probability =1;
        s.lat_num += currDot.lat * currDot.probability;
        s.lat_den += currDot.probability;
        s.lng_num += currDot.lng * currDot.probability;
        s.lng_den += currDot.probability;
        s.sum_prob+= currDot.probability;
    }

    avgLat = s.lat_num / s.lat_den;
    avgLng = s.lng_num / s.lng_den;
    probability = s.sum_prob/nearDots.length;

    return {lng: avgLng, lat: avgLat, probability: probability};
}


function corelateResult(beaconsWithRadiuses) {
    var count = 50,
        min = 0.3,
        max = 2.8,
        resultArr = [];


    var step = (min + max) / count;

    for (var i = 0; i < count; i++) {
        //var clonedBeaconsWithRadiuses = beaconsWithRadiuses.slice();
        var clonedBeaconsWithRadiuses = JSON.parse(JSON.stringify(beaconsWithRadiuses));

        // change radiuses
        var currRadiusKoeficient = (i + 1) * step;
        for (var j = 0; j < clonedBeaconsWithRadiuses.length; j++) {
            var currRadius = beaconsWithRadiuses[j].radius+1-1;
            clonedBeaconsWithRadiuses[j].radius = currRadius * currRadiusKoeficient;
        }
        var realPosition = detectRealPosition(clonedBeaconsWithRadiuses);
        realPosition.radiusKoeficient = currRadiusKoeficient;
        if(!isNaN(realPosition.probability)){
            resultArr.push(realPosition);
        }



    }
    resultArr.sort(function (a, b) {
        return b.probability - a.probability;
    });

    return resultArr[0];
}



function getIntersectDot(line1, line2)
{

    // возвращаем true если b находится между a и c,
    // исключаем случай, если a==b или b==c
    function isInBetween(a, b, c) {
        // возвращаем false, если b почти равна a или c.
        // для этого применяем значение с плавающей точкой 0.00000...0001
        if (Math.abs(a-b) < 0.000001 || Math.abs(b-c) < 0.000001) {
            return false;
        }

        // true, если b между a и c
        return (a < b && b < c) || (c < b && b < a);
    }



    // преобразуем линию line1 в общую форму уравнения прямой: Ax+By = C

    // startPoint = D1
    // endPoint = D2
    // x = lng
    // y = lat

    line1.startPoint = line1.D1;
    line1.startPoint.x = line1.D1.lng;
    line1.startPoint.y = line1.D1.lat;

    line1.endPoint = line1.D2;
    line1.endPoint.x = line1.D2.lng;
    line1.endPoint.y = line1.D2.lat;

    line2.startPoint = line2.D1;
    line2.startPoint.x = line2.D1.lng;
    line2.startPoint.y = line2.D1.lat;

    line2.endPoint = line2.D2;
    line2.endPoint.x = line2.D2.lng;
    line2.endPoint.y = line2.D2.lat;



    var a1 = line1.endPoint.y - line1.startPoint.y;
    var b1 = line1.startPoint.x - line1.endPoint.x;
    var c1 = a1 * line1.startPoint.x + b1 * line1.startPoint.y;

    // преобразуем линию line2 в общую форму уравнения прямой: Ax+By = C
    var a2 = line2.endPoint.y - line2.startPoint.y;
    var b2 = line2.startPoint.x - line2.endPoint.x;
    var c2 = a2 * line2.startPoint.x + b2 * line2.startPoint.y;

    // вычисляем точку пересечения
    var d = a1*b2 - a2*b1;

    // линии параллельны, если d = 0
    if (d == 0) {
        return false;
    }
    else {
        var x = (b2*c1 - b1*c2) / d;
        var y = (a1*c2 - a2*c1) / d;



        // проверяем, находится ли точка пересечения на обоих линиях
        if ((isInBetween(line1.startPoint.x, x, line1.endPoint.x) ||
            isInBetween(line1.startPoint.y, y, line1.endPoint.y)) &&
            (isInBetween(line2.startPoint.x, x, line2.endPoint.x) ||
            isInBetween(line2.startPoint.y, y, line2.endPoint.y)))
        {
            //return true;
            return {lat: y, lng: x};
        }

        return {lat: y, lng: x};

    }

    return false;
}




function arrayClone( arr ) {

    var i, copy;

    if( Array.isArray( arr ) ) {
        copy = arr.slice( 0 );
        for( i = 0; i < copy.length; i++ ) {
            copy[ i ] = Utils.arrayClone( copy[ i ] );
        }
        return copy;
    } else if( typeof arr === 'object' ) {
        throw 'Cannot clone array containing an object!';
    } else {
        return arr;
    }

}





//var beaconsWithRadiuses = buildBeaconsWithRadiusesArray(scannedBeaconsArr, existedBeaconsArr);
//var realPosition = corelateResult(beaconsWithRadiuses);
//var realPosition = detectRealPosition(beaconsWithRadiuses);
//realPosition;