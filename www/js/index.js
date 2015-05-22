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
    i5: 'images/5.jpg'

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
    var data = {};
    data.indicate = 'GetData';
    getData(data, afterGetData);
    function afterGetData(result) {
        console.log(result);
    }
});
function readHost() {
    var storedHost = store.getItem('host');
    if (storedHost) {
        id.host = storedHost;
    } else {
        id.host = id.originalHost;
    }
}
function ChangeImage($majorMax,$minorMax) {
var $var=0;
if(app.Mjm!=$majorMax||app.Mnm!=$minorMax)
{
    app.Mjm=$majorMax;
    app.Mnm=$minorMax;
    if($var<=5){
    $var++;
    }
    else
    {
        $var--;
    }

 if($var=1){
    var img = document.getElementById("ch");
    var att = document.createAttribute("src");
    att.value = im.i1;
    img.setAttributeNode(att);
} 
 if($var=2){
    var img = document.getElementById("ch");
    var att = document.createAttribute("src");
    att.value = im.i2;
    img.setAttributeNode(att);
} 
 if($var=3){
    var img = document.getElementById("ch");
    var att = document.createAttribute("src");
    att.value = im.i3;
    img.setAttributeNode(att);
} 
 if($var=4){
    var img = document.getElementById("ch");
    var att = document.createAttribute("src");
    att.value = im.i4;
    img.setAttributeNode(att);
} 
 if($var=5){
    var img = document.getElementById("ch");
    var att = document.createAttribute("src");
    att.value = im.i5;
    img.setAttributeNode(att);
} 
}
}