/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


id.originalHost = 'http://159.224.220.250/carmuseumAPI/backend/';

var url = {
    GetData: 'web/index.php?r=api%2Fget-by-url-exhibits'
};

function getData(formData, callback){
    var urlToUpload = id.host + url.GetData;
    var params = {
        url: urlToUpload,
        type: 'POST',
        formData: formData,
        needBlock: false
    };
    ajaxRequest(params, callback);
}

function ajaxRequest(params, callback) {
  
    var isConnected = checkConnection();
    if (!isConnected) {
        callback({status: {error: true}, error: aMsg.notConnectedToNet});
        return false;
    }

    var needBlock = true;
    if (params.needBlock !== 'undefined' && params.needBlock === false) {
        needBlock = false;
    }

    if (needBlock) {
        $.blockUI(blockParams);
    }
    var type = 'GET';
    var formData = [];
    if (typeof (params.type) !== 'undefined') {
        type = params.type;
    }
    if (typeof (params.formData) !== 'undefined') {
        formData = params.formData;
    }
    if (typeof (params.url) === 'undefined') {
        log('params.url not setted');
        return;
    }
    if (typeof (callback) === 'undefined') {
        log('callback not setted');
        return;
    }

    console.log('ajax: ' + params.url);

    $.ajax({
        type: type,
        url: params.url,
        crossDomain: true,
        dataType: 'json',
        data: formData,
        cache: false,
        timeout: 15000,
        success: function (response) {
            if (!response) {
                callback({status: {error: true}, error: eMsg.parserError});
            }
            if (response.status === 'success') {
                if (needBlock) {
                    $.unblockUI();
                }
//                callback({status: 'success', data: response.data});
                callback({status: {success: true}, data: response.data});
            } else {
                if (needBlock) {
                    $.unblockUI();
                }
//                callback({status: 'error', error: response.error});
                callback({status: {error: true}, error: response.error});
            }
            return;
        },
        error: function (jqXHR, textStatus, errorMessage) {
            $.unblockUI();
            var msg;
            if (textStatus === 'parsererror') {
                msg = eMsg.parserError;
            } else if (textStatus === 'timeout') {
                msg = eMsg.timeoutReached;
            } else if (textStatus === 'abort') {
                msg = eMsg.ajaxAborted;
            } else if (jqXHR.status === 0) {
                msg = eMsg.connectionError;
                
            } else if (jqXHR.status === 404) {
                msg = eMsg.urlNotFound;
            } else if (jqXHR.status === 500) {
                msg = eMsg.serverError;
            } else {
                msg = jqXHR.responseText;
                alert(eMsg.uncaughtError + '\n' + jqXHR.responseText);
            }

            var logMsg = 'Request error:' + params.url + ';  jqXHR.status: ' + jqXHR.status + ';  textStatus:' + textStatus + ';  errorMessage:' + errorMessage;
            console.log(logMsg);
            callback( {status:'connectionError', error: msg } );
            showErrorMessage(msg);

            return;
        }
    });
}

//function getAvailableJobs(callback){
//    var params = {
//        url: url.availableJobs
//    };
//    ajaxRequest(params, callback);
//}
