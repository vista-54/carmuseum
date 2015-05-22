/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var id={
    iBeaconId:null
};
var store = window.localStorage;

function addDataToStore() {
    store.setItem('UUID', JSON.stringify(id.iBeaconId));

}