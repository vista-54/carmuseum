/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
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
    var data={};
    data.indicate='GetData';
    getData(data,afterGetData);
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
function ChangeImage(){
    
}