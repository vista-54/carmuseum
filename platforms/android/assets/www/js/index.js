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
    titles:["ferrari","nissan","lamborgini","audi","dodge"]
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
                for (var i in result.data)
        {
            var obj = result.data[i];
//ReadMore(" + i + ")
            var text = "<img src=" + obj.image + ">";
//            cvnt.readTitle.unshift(text);
//            var optiizeText = "<h1>" + obj.title + "</h1>";
//            cvnt.title.unshift(optiizeText);
//            var body =   obj.body_value ;
//            cvnt.readMore.unshift(body);
//            cvnt.version = result.data[lastnum].nid;

        }
//        $("#image").html(text);
        
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
function ChangeImage($majorMax, $minorMax, $uuid) {

    if ((app.Mjm !== $majorMax) || (app.Mnm !== $minorMax))
    {
        app.Mjm = $majorMax;
        app.Mnm = $minorMax;
        app.uuid=$uuid;
        var u = getRandomInt(0, 4);
        var data={};
        data.indicate='GetData';
        data.title=im.titles[u];
//        data.uuid=$uuid;
        
        getData(data,response);
        function response(result)
        {
            console.log(result);
          if (result.status.error) {
//            showErrorMessage(result.error);
            $.unblockUI();
            return;
        }
            var obj = result.data[0];
           var title=obj.title_lot;
            var body=obj.desc_lot;
            var img=obj.image;
            $("#list").html("<img src="+img+"><br><h1>"+title+"</h1><br><p>"+body+"</p>");
        }
//        {

            
//            for (var i in result.data)
//        {
//            var obj = result.data[0];
//            title=obj.title_lot;
//            body=obj.desc_lot;
//            img=obj.image;
//
//            
//        }
//        $("#list").html("<img src="+img+"<br><h1>"+title+"</h1><br><p>"+body+"</p>");
//            alert(result)
//        }
//        change();
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