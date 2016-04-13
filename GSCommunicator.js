/**
 * This file holds the service configuration and a backend communicator. 
 * It is shared with both frontends: Workbench and user profile.
 */
(function(root) {
    'use strict';

    /**
     * Gamification Service Config
     *
     * @throws Error - if was initialized with 'new' key word.
     */
    var GSConfig = function() {
        throw new Error('GSConfig is a static class. Use it accordingly.');
    };

    // default endpoint, used by any human user
    GSConfig.USER_API_URL = '/gamification/api/user/JsonRPC';

    // sometimes appropriate for API terminal 
    GSConfig.TECH_API_URL = '/gamification/api/tech/JsonRPC';
    
    // session data is loaded from user data url (see SessionManager)
    GSConfig.USER_DATA_URL = '/gamification/api/user/UserData';

    // name of the default app, usually used as fallback, e.g. when loading workbench 
    // data and list of apps has not yet been loaded
    GSConfig.DEFAULT_APP_NAME = '2045Future';


    // TODO Axel refactor image related config below
    // pictures are stored in the database and retrieved by this URL + picture ID
    // used in player inspector and userprofile
    GSConfig.PICTURE_URL = '/gamification/api/picture/GetPicture?id=';
    // used for player inspector in workbench and avatar pane in userprofile
    GSConfig.DEFAULT_AVATAR_IMG = 'DefaultAvatar';
    // used in activities view/controller in userprofile
    // e.g.PICTURE_URL + DEFAULT_NOTIFICATION_IMG + 'MISSION' will return the mission icon, 
    // used in notifications
    GSConfig.DEFAULT_NOTIFICATION_IMG = 'Notification';
    // primary demo app
    GSConfig.DEMO_APP = '2045Future';

    /**
     * Gamification Service Communicator
     * Allows sending requests to the gamification backend. Takes over CSRF token handling
     *
     * @throws Error - if was initialized with 'new' key word.
     */
    var GSCommunicator = function() {
        throw new Error('GSCommunicator is a static class. Use it accordingly.');
    };

    // Stored in local scope only
    var CSRF_TOKEN = '';
    var CURRENT_APP = GSConfig.DEFAULT_APP_NAME;
    var CURRENT_PLAYER_ID;

   /**
     * Sends an ajax POST request to the gamification service endpoints
     * 
     * @param method 
     *      name of the jsonRPC method or object, holding a method property and a file property
     * @param parameters 
     *      parameters used together with the jsonRPC method
     * @param callbackFn 
     *      (optional) callback function, used whenever the request succeeded 
     * @param scope
     *      (optional) when set, the callbackFn is called within this scope (ususally ui5 controllers scope)
     * @param ajaxConfig 
     *      (optional) object holding $.ajax properties, to overwrite defaults 
     */
    GSCommunicator.send = function( method, parameters, callbackFn, scope, ajaxConfig ) {
        // defaults
        var bAsync = true;
        //var sUrl = GSConfig.USER_API_URL;
        var sUrl = '';
         if(method == 'handleEvent'){
            sUrl = GSConfig.TECH_API_URL;
        }else{
            sUrl = GSConfig.USER_API_URL;
        }
        var appName = CURRENT_APP;
        var timeout = 60000;
        var processData = true;
        var contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        var dataType = null; 
        var xhrFields = {};
        var complexRequestData = (method && method.method) ? true : false;
        var httpMethod = 'POST';
        var validHttpMethods = ['POST', 'GET', 'HEAD', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'PATCH'];

        // ajax config is optional and can be used to overwrite $.ajax defaults
        if (ajaxConfig) {
            if ( typeof ajaxConfig.async === 'boolean' ) {
                bAsync = ajaxConfig.async;
            }

            // check url
            if ( typeof ajaxConfig.url === 'string' && ajaxConfig.url !== '' ) {
                sUrl = ajaxConfig.url;
            }

            // check method type
            if ( typeof ajaxConfig.httpMethod === 'string' && validHttpMethods.indexOf(ajaxConfig.httpMethod) !== -1) {
                httpMethod = ajaxConfig.httpMethod;
            }

            // check for provided app name
            if ( typeof ajaxConfig.appName === 'string' && ajaxConfig.appName !== '' ) {
                appName = ajaxConfig.appName;
            }

            // check timeout
            if ( (ajaxConfig.timeout % 1 === 0) && ajaxConfig.timeout > 0 ) {
                timeout = ajaxConfig.timeout;
            }

            // check processData
            if ( typeof ajaxConfig.processData === 'boolean' ) {
                processData = ajaxConfig.processData;
            }

            // check content type
            if ( (typeof ajaxConfig.contentType === 'boolean') || (typeof ajaxConfig.contentType === 'string') ) {
                contentType = ajaxConfig.contentType;
            }
            // check data type
            if (typeof ajaxConfig.dataType === 'string') {
                dataType = ajaxConfig.dataType;
            }
            // check xhrFields
            if (typeof ajaxConfig.xhrFields === 'object') {
                xhrFields = ajaxConfig.xhrFields;
            }
        }

        var ajaxData = null;        
        // prepare request context when available
        if (method && parameters) {
            var json = JSON.stringify({
                method: complexRequestData ? method.method : method,   // json RPC methodname
                params: parameters                 // paramteres for the assigned method
            });
            if (! complexRequestData) {             // regular request
            	ajaxData = {
	    			json : json,
	    			app : appName
            	};
            } else {                                // special case: request requires sending data via formdata (e.g. to allow adding files to the body)
                ajaxData = new FormData();          // prepare FormData object, to send data and file in pairs
                ajaxData.append('json', json);
                ajaxData.append('app', appName);
                // check for file
                if (method.file) {
                    ajaxData.append('file', method.file);
                }
            }            
        }

        var headers = {};
        if (httpMethod === 'POST') {
            headers['X-CSRF-Token'] = CSRF_TOKEN;
        }
		headers['X-CSRF-Token'] = CSRF_TOKEN;
        return $.ajax( {
            url: sUrl,
            data: (ajaxData) ? ajaxData : undefined,
            headers: headers,
            type: httpMethod,
            cache: false,
            contentType: contentType,
            processData: processData,
            dataType: dataType, // used for native xhr / arraybuffer downloads
            xhrFields: xhrFields, // used for native xhr / arraybuffer downloads
            async: bAsync, // avoid using false
            timeout: timeout, // default is 60000, can be greater for file uploads
            success: function( _data, _textStatus, _jqXHR ) {
                if (callbackFn) {
                    callbackFn.call( scope ? scope : this, _data, _jqXHR );
                }
            },
            error: function( jqXHR, textStatus, errorThrown ) {
                // when the token is invalid or already expired, then skip the successFn
                // and call sendAPIRequest again to get a new token
                if ( jqXHR.status === 403 && jqXHR.getResponseHeader( 'X-CSRF-Token' ) ) {
                    return GSCommunicator.fetchToken( method, parameters, callbackFn, scope, ajaxConfig, sUrl );
                }
                console.error('error during backend request' );
                $("#error").html("<strong>Error</strong> error during backend request");
                	$(".alert").show()
            }
        } );
    };

    /**
     * Requests information about the current user from the gamification service (name, roles,..)
     */
    GSCommunicator.getUserInformation = function (callbackFn, scope) {
    	// slightly reconfigure the default ajax request
    	GSCommunicator.send(null, null, callbackFn, scope, { httpMethod: 'GET', url: GSConfig.USER_DATA_URL} );	
    };
    
    /**
     * Fetches a new csrf token from the backend.
     * This method is called, when the original request failed due to the missing xsrf token. 
     * Parameters from the original request are provided. Once the token has been fetched, it is updated 
     * and the original request is invoked egain. This call is always executed synchronously, as we expect it to 
     * be run only once and other requests should wait until the token is availbale.
     */
    GSCommunicator.fetchToken = function( method, parameters, callbackFn, scope, ajaxConfig, JSONUrl ) {
        return $.ajax( {
            url: JSONUrl,
            headers: {
                'X-CSRF-Token': 'Fetch'
            },
            type: 'GET',
            async: false,
            success: function (data, textStatus, jqXHR) {
                var headerToken = jqXHR.getResponseHeader( 'X-CSRF-Token' );
                if ( headerToken !== null ) {
                    CSRF_TOKEN = headerToken;
                    theToken = CSRF_TOKEN;
                    // if there was a request running and interrupted due to missing token, repeat it
                    if (method) {
                        return GSCommunicator.send( method, parameters, callbackFn, scope, ajaxConfig );    
                    }
                } else {
                    console.error("Could not fetch CSRF token.");
                }
            },
            error: function ( jqXHR, textStatus, errorThrown) {
            	var headerToken = jqXHR.getResponseHeader( 'X-CSRF-Token' );
                if ( headerToken !== null ) {
                    CSRF_TOKEN = headerToken;
                    // if there was a request running and interrupted due to missing token, repeat it
                    if (method) {
                        return GSCommunicator.send( method, parameters, callbackFn, scope, ajaxConfig );    
                    }
                } else {
                    console.error('Could not fetch CSRF token.');
                }
            }
        } );
    };

    /**
     * Setter method for the name of the current gamification app.
     * if a request is sent, without mentioning any app name, the request is sent to the currently set app. 
     * Current App = active app.
     * Current App != default app.
     */
    GSCommunicator.setAppName = function (appName) {
        if (appName && typeof appName === 'string') {
            CURRENT_APP = appName;
        } else {
            console.error('App name not set. Expected string, but received: ' + appName);
        }
    };

    /**
     * Returns the name of the currently active app.
     */
    GSCommunicator.getAppName = function () {
        return CURRENT_APP;
    };

    /**
     * Setter method for the player id of the current player. This setting is not considered in requests 
     * automatically but serves as a convenience storage for a player id. Note: user and player can be 
     * the same but do not have to be the same, e.g. when a player views a profile of another player.
     */
    GSCommunicator.setPlayerId = function (playerId) {
        if (playerId && typeof playerId === 'string') {
            CURRENT_PLAYER_ID = playerId;
        } else {
            console.error('Player id not set. Expected string, but received: ' + playerId);
        }
    };

    /**
     * Returns the id of the currently used player.
     */
    GSCommunicator.getPlayerId = function () {
        return CURRENT_PLAYER_ID;
    };

    root.GSConfig = GSConfig;
    root.GSCommunicator = GSCommunicator;

})(this);