function checkConnection() {
    try {
        if(typeof(navigator.connection) === 'undefined'){
            return true;  // is browser
        }
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        if (networkState === Connection.NONE) {
            return false;
        }
        return true;

    } catch (error) {
        console.log(error.message);
    }
}



function showErrorMessage(msg) {
    
    var returnedMsg = '';
    if (isArray(msg)) {
        for (var i in msg) {
            returnedMsg += msg[i] + '\n';
        }
        showMessage(returnedMsg, 'error');
        return;
    } else {
        if (typeof msg === 'object') {
            for (var i in msg) {
                returnedMsg += msg[i] + '\n';
            }
            showMessage(returnedMsg, 'error');
            return;
        } else {
            showMessage(msg, 'error');
        }
    }
}

function isTouchDevice() {
  return 'ontouchstart' in window // works on most browsers 
      || 'onmsgesturechange' in window; // works on ie10
};


function showMessage(msg, type) {
    //type: 'alert', 'warning', 'success', 'information', 'error'
//    if (!type) {
//        type = 'alert';
//    }
//    var n = noty({
//        text: msg,
//        timeout: 5000,
//        type: type,
//        layout: 'topCenter',
//        killer: true,
//        maxVisible: 3,
//        force: true,
//        dismissQueue: false,
//        template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>'
//    });

    alert(msg);
}






function isArray(object) {
    return (Object.prototype.toString.call(object) === '[object Array]');
}


function dump(arr, level) {
    var dumped_text = "";
    if (!level)
        level = 2;

    var level_padding = "";
    for (var j = 0; j < level + 1; j++)
        level_padding += "   ";

    if (typeof (arr) === 'object') {
        for (var item in arr) {
            var value = arr[item];

            if (typeof (value) === 'object') {
                dumped_text += level_padding + "'" + item + "' : {\n";
                dumped_text += dump(value, level + 1);
                dumped_text += level_padding + "'}\n";
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + ((typeof (value) === 'function') ? ' function' : value) + "\"\n";
            }
        }
    } else {
        dumped_text = "" + arr + ":" + typeof (arr) + "\n";
    }
    return dumped_text;
}


function log(msg) {
    console.log('::SWW:: ' + msg);
}


//==========================  block ui  ========================================

var blockParams = {
    message: '<img style="height: 1em; width:11em" src="images/ajax-loader.gif" /> \n <br/> \n '+
        '<span id="block-text" class="block-text"></span>',
    css: {
        top: ($(window).height() - 19) / 2 + 'px',
        left: '50%',
        marginLeft: '-5.5em',
        width: '11em',
        height: '1em',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'wait',
        opacity: 1
    },
    overlayCSS: {
        backgroundColor: 'rgba(50, 50, 50, 0.85)',
        opacity: '1',
        cursor: 'wait'
    }
};



function correctiveScale(){
    var width = $(window).width();
    var height = $(window).height();
    
    log('Width: '+width+'  Height: '+height);
    
    var min = Math.min(width, height);
    var scale = min/275;
    if(height <= 480){ scale = 1.04; }
    if(scale > 2.2){scale = 2.2;}
    $('body').css('font-size', scale+"em");
    var htmlDom = $('html');
    htmlDom.css({ height: htmlDom.height()+'px'});
}


function hideKeyboard() {
    document.activeElement.blur();
    $('input, textarea').blur();
}



var scrollParams = {
    autoHideScrollbar: false,
    autoDraggerLength: true,
    scrollInertia: 100,
    contentTouchScroll: true,
    advanced:{
       updateOnContentResize: true,
       updateOnBrowserResize: true,
       autoScrollOnFocus: false
   }
};

function addScrolls(){
    $(".scroller").mCustomScrollbar(scrollParams);
}





//===========================   render    ============================

function getPattern(jqEl) {
    var cloned = jqEl.clone();
    cloned.removeAttr('id');
    cloned.removeClass('invisible');
    cloned.find('[id$="pattern"]').remove();
    //cloned.template = cloned.prop('outerHTML');
    return cloned;
}



String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
};

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

String.prototype.formatObj = function(params) {
    var formatted = this;

    for (var i in params) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, params[i]);
    }
    return formatted;
};


String.prototype.render = function(params, deepObjectRender) {
    var formatted = this;

    var removeIdOfPatternRegexp = new RegExp('id?=\"*Pattern\"', 'gi');
    formatted = formatted.replace(removeIdOfPatternRegexp, '');

    if (deepObjectRender && deepObjectRender === true) {
        var regexpAll = new RegExp('\\{\\{' + '.+?' + '\\}\\}', 'gi');
        var arrOfMustaches = formatted.match(regexpAll);
        if(arrOfMustaches === null){ arrOfMustaches=[]; }
        for (var i = 0; i < arrOfMustaches.length; i++) {  // foreach work with bug in ie7,8
            var oneVal = arrOfMustaches[i];
            var valWithoutMustaches = oneVal.slice(2, -2);
            var neededVal = eval('params.' + valWithoutMustaches);
            formatted = formatted.replace(oneVal, neededVal);
        }
    } else {
        for (var i in params) {
            var regexp = new RegExp('\\{\\{' + i + '\\}\\}', 'gi');
            formatted = formatted.replace(regexp, params[i]);
        }
    }

    return formatted;
};



function validateNumber(evt){
	var theEvent = evt || window.event;
	var keyCode = theEvent.keyCode || theEvent.which;
	var target = evt.target;
	var curValStr = target.value;
	if( keyCode === 13 ){
		evt.target.blur();
	}
	if( keyCode===13         // enter
//		|| keyCode === 8     // backspace
//		|| keyCode === 37    // arrow left
//		|| keyCode === 39    // arrow right
//		|| keyCode === 38    // arrow up
//		|| keyCode === 40    // arrow down
	){
		return;
	}
	var key = String.fromCharCode( keyCode );
        var admissibleSymbols = '0123456789_';
        var enteredWrongKey = (admissibleSymbols.indexOf(key)===-1 ) ? true : false;
        var newStr = ''+curValStr+key;
	if( enteredWrongKey /*|| isNaN(newStr) || parseFloat(newStr)>24*/ ) {
		theEvent.returnValue = false;
		if(theEvent.preventDefault) theEvent.preventDefault();
		return false;
	}
}



//==========  plugin for work with android 2.x 
window.canvaspluginTEMP = function(canvasEl, offset, type, callback) {
    var mineType = (type ? type : "image/png");
	if(mineType !== "image/png" || mineType !== "image/jpeg"){
		mineType = "image/png";
	}
    var xpos = canvasEl.offsetLeft;
    var ypos = canvasEl.offsetTop;
    var width = canvasEl.width;
    var height = canvasEl.height;
    var screenWidth = window.innerWidth; // no WebView.getContentWidth(), use this instead

    if (typeof (offset) !== 'undefined' && offset) {
        xpos = offset.left;
        ypos = offset.top;
        width = offset.width;
        height = offset.height;
        screenWidth = offset.screenWidth ? offset.screenWidth : screenWidth;
    }
    ;
    var canvasProps = {
        mimeType: mineType,
        xpos: xpos,
        ypos: ypos,
        width: width,
        height: height,
        screenWidth: screenWidth
    };

    //call the Plugin execute method()
    cordova.exec(callback, function(err) {
        callback('Error: ' + err);
    }, "CanvasToDataURL", "toDataURL", [canvasProps.mimeType,
        canvasProps.xpos,
        canvasProps.ypos,
        canvasProps.width,
        canvasProps.height,
        canvasProps.screenWidth]);
};
