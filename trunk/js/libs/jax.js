/* =======================================================================================================================
   jax.js - (c) copyright Kroc Camen 2005-2007
   ======================================================================================================================= */
// licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
// REQUIRES: prototype 1.5.0, Prototype-compatible json.js

/* TODO:
   + if the server responds with a 403, 404, 500 etc, display an error message
   + if the server times out, give a warning message and try again
*/

/* =======================================================================================================================
   CLASS Jax - user to user AJAX communication (via PHP)
   ======================================================================================================================= */
var Jax = new Class.create ();
Jax.prototype = {
        //--- public variables ----------------------------------------------------------------------------------------------
        version : "0.4.0.0000.alpha",  //version number of jax in 'major.minor.revision.build.tag' format
        conn_id : null,                //once you've opened/connected, this is the connection id for this instance
        
        //--- private variables ---------------------------------------------------------------------------------------------
        _ : {
                request_file : "",  //url of the jax server page
                local_id     : "",  //your id, needed to collect your messages from the server
                remote_id    : "",  //id of the other person, needed to send messages to them
                callbax      : [],  //a 'bat-belt' (array of functions) for the server queue callbacks
                timer_handle : 0    //for remembering the timer handle to be able to stop it later on
        },
        
        /* initialize
           =============================================================================================================== */
        initialize : function (s_server) {
                //set the server location for AJAX calls
                if (!s_server) {s_server = "jax_php/response.php";}  //default: same folder (assumedly webroot)
                this._.request_file = s_server;
                
                //when the user closes the window or navigates away from the website
                Event.observe (window, 'beforeunload', function(){
                        //'onbeforeunload' must be used because popup windows do not have an onunload event
                        this.disconnect ({reason: "unload"});
                }.bind(this));
        },
        
        /* > open : open a new connection on the server
           ===============================================================================================================
           params * o_data   : data (as object literal) to give to the other player as soon as they join
                    f_onOpen : function called once the server accepts the game and begins waiting for the opponent 
                               params * o_response : {
                                                result : (bool) if the server opened the slot okay
                                                error  : (string) error message if there was one (if result = false)
                                                connid : (string) connection id assigned - this.conn_id receives this
                                        }
                    f_onJoin : function called once the opponent has joined the game
                               return * object : contains data the other player has sent to you upon joining
           =============================================================================================================== */
        open : function (o_data, f_onOpen, f_onJoin) {
                //send the request to the server to open a new game
                this.sendRequest ("jax_open", {data:json.stringify(o_data)}, function(o_response){
                        //if the server created the game without error...
                        if (o_response.result) {
                                //set the id
                                this.conn_id    = o_response.connid;
                                this._.local_id = o_response.userid;
                                //what to do when the other player joins
                                this.listenFor ("jax_join", function(o_response){
                                        //do not respond again to a user joining
                                        this.listenFor ("jax_join");
                                        //get the other person's id, needed to send messages to them
                                        this._.remote_id = o_response.data.userid;
                                        //call the passed function from the game when the game starts
                                        f_onJoin (o_response);
                                }.bind(this));
                                //start the timer to check for new messages
                                this.timerStart ();
                        }
                        //call the passed function from the game for when the game is initialized
                        f_onOpen (o_response);
                }.bind(this));
        },
        
        /* > joinGame : join a game and wait for the other player to acknowledge
           ===============================================================================================================
           params * f_onGameStart : function called once you've joined the game
           =============================================================================================================== */
        connect : function (s_connid, o_data, f_onGameStart) {
                //attempt to join the game with your nickname and key
                this.sendRequest("jax_connect", {
                        connid : s_connid,
                        data   : json.stringify(o_data)
                }, function(o_response){
                        //did the server have any problems with your key/name?
                        if (o_response.result) {
                                //get yours and their id
                                this.conn_id     = s_connid;
                                this._.local_id  = o_response.userid;
                                this._.remote_id = o_response.hostid;
                                //start the automatic check for new messages
                                this.timerStart ();
                                //call the passed function from the game.js for when you join the game
                                f_onGameStart (o_response);
                        } else {
                                //!/server side register nickname / join game failed
                                alert ("Did not join the game");
                        }
                }.bind(this));
        },
        
        /* > timerStart : begin the recurring timer
           ===============================================================================================================
           params * n_interval : number of milleseconds between AJAX calls
           =============================================================================================================== */
        timerStart : function (n_interval) {
                if (!n_interval) {n_interval = 3000;}  //default: 3 seconds
                
                //if the event timer is in motion, stop it first
                if (this._.timer_handle) {this.timerStop ();}
                
                //set the interval
                this._.timer_handle = setInterval(function(){
                        this.sendRequest ("jax_check_queue", {
                                connid : this.conn_id,    //which connection applies
                                userid : this._.local_id  //and your user id to get your messages
                        });
                }.bind(this), n_interval);
        },
        
        /* > timerStop
           =============================================================================================================== */
        timerStop : function () {
                clearInterval (this._.timer_handle);
        },
        
        /* > listenFor : set a function to execute when a certain type of message comes from the other player
           ==============================================================================================================
           params * s_datatype : the identifying keyword to look for
                    f_callbax  : the function to call
           =============================================================================================================== */
        listenFor : function (s_datatype, f_callback) {
                /* the timer object checks the server for new messages sent to you from the other player automatically.
                   when a message comes in, your game must use this function to register your own function to handle that
                   message. each message is tagged with a "type" to identify it
                   
                   callbax is a 'bat-belt', an array of functions, with the key as the name of the 'datatype' retrieved from
                   the other player (via the server). For example "chat_message". The server's response will be passed to
                   the function, you should use the listenFor function like this:

                       jax.listenFor("game_chat_message", function(o_response) {
                           //code to run when you receive a "game_chat_message" from the server/other player,
                           //'o_response' is an object containing the server's response
                       });

                   To unregister a callback and unlisten from the queue, send null as the second parameter.
                */
                if (!f_callback) {f_callback = null;}  //deault: no callback, unregister
                
                //set the callback function
                this._.callbax[s_datatype] = f_callback;
        },

        /* > sendRequest : send a direct request to the server (to setup and join games, etc.)
           ==============================================================================================================
           params * s_type       : a string labelling the data being sent. e.g. jax_chat_message
                    o_request    : an object literal containing key:value pairs to send to the server 
                    f_onResponse : function to call once the server got the data. the server's response is the param
                                   params * o_response : object literal of the server's response to the request
           =============================================================================================================== */
        sendRequest : function (s_type, o_request, f_onResponse) {
                if (!f_onResponse) {f_onResponse = Prototype.emptyFunction;}  //default: no callback
                
                o_request.requesttype = s_type;
                pars = $H(o_request).toQueryString ();
                
                var self = this,
                    ajax = new Ajax.Request (
                        this._.request_file,
                        {
                                method     : 'post',
                                parameters : pars,
                                onComplete : function(o_ajax){  //-----------------------------------------------------------
                                        //take the querystring returned by the server and turn into an object literal
                                        var str      = o_ajax.responseText.replace (/\+/g, " "),
                                            response = str.toQueryParams ()
                                        ;
                                        if (response.data) {response.data = json.parse (response.data);}
                                        
                                        //if this is something from the queue, there may be more than one message there
                                        if (response.requesttype == "jax_check_queue") {
                                                var count = parseInt (response.count);
                                                for (var i=1; i<=count; i++) {
                                                        //build a response object for this data
                                                        var r = {
                                                                result : response.result,
                                                                type   : response["type"+i],
                                                                data   : json.parse (response["data"+i])
                                                        };
                                                        //call the user-added function to deal with this data
                                                        if (typeof self._.callbax[r.type] == "function") {
                                                                self._.callbax[r.type](r);
                                                        }
                                                }
                                        }
                                        if (response.error) {
                                                //fatal server error!
                                                console.error (response.error);
                                                alert (response.error);
                                        } else {
                                                f_onResponse (response);
                                                f_onResponse = null;
                                        }
                                }
                        }
                );
        },
        
        /* > sendToQueue : send some data to the other person (via the server's pickup queue)
           ==============================================================================================================
           params * s_type   : the label to identify the data, e.g. chat_message
                    o_data   : object literal containing key:value pairs to send to the other player
                    f_onSent : function to call once the server accepts the data
           =============================================================================================================== */
        sendToQueue : function(s_type, o_data, f_onSent) {
                if (!f_onSent) {f_onSent = Prototype.emptyFunction;}  //default: no callback
                
                var self = this;
                this.sendRequest ("jax_queue", {
                        connid : self.conn_id,            //connection id for the you-them bridge
                        sendto : self._.remote_id,        //the opponent's id you're sending to
                        type   : s_type,                  //the tag name of the data being sent e.g. "chat_message"
                        data   : json.stringify (o_data)  //the custom data being sent
                }, f_onSent);
        },
        
        /* disconnect : tell the other person you've left, and stop the AJAX
           ===============================================================================================================
           params * o_data : data (as object literal) to send the other person
           =============================================================================================================== */
        disconnect : function(o_data) {
                //ignore if the user hasn't actually connected yet (e.g. closing a window before connecting)
                if (!this._.local_id) {return false;}
                //stop the local timer
                this.timerStop ();
                //send the death knell to the other player
                var self = this;
                this.sendRequest ("jax_disconnect", {
                        connid : self.conn_id,            //the connection you're on
                        userid : self._.local_id,         //your user id
                        data   : json.stringify (o_data)  //something to send to the other player, like reason for disconnect  
                });
        }
};

//=== end of line ===========================================================================================================