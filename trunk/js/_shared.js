/* =======================================================================================================================
   js/_shared.js - functions shared with all the games on the site
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax, jax games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   shared.js contains objects that are shared between all of the games. in particular `shared`: an object containing core
   functions to power the games and make the shared ui function (e.g. chat box)
*/

//create an instance of `Jax`, direct it to the php page to receive the ajax calls
//jax allows us to setup a 'browser-to-browser' connection via ajax. one player starts a new connection, and the other joins.
//the server is polled every few seconds for new messages from each other. jax is therefore not realtime; there is absolutely
//no gaurantee that a message will arrive at the other player at a given time. jax games are therefore turn-based
var jax = new Jax ("../../"+config.jax.path, config.jax.interval);


/* EVENT > onload - when everything is loaded and we are ready to go...
   ======================================================================================================================= */
Event.observe (window, 'load', function(){
        //this is essentially the starting point for jax games. after all the scripts have been loaded, this function will
        //put everything into motion. read further down this page for the definition of the `shared` object and functions
        
        //put the version info in the log
        console.info ("Welcome to Jax Games | "+game.name+": "+game.version+" ["+Date()+"]\n"+
                      "jax: "+jax.version+" - Scriptaculous: "+Scriptaculous.Version+" - Prototype: "+Prototype.Version+"\n"
        );
        
        //Firefox remembers the values in fields, even after refreshing, clear the chat box
        $("shared-chat-input").value = "";
        
        //hook up the buttons on the title screen
        $("title-start-game").onclick = shared.events.titleStartGameClick;
        $("title-join-game").onclick  = shared.events.titleJoinGameClick;
        
        //change the window title (`game.name` is automatically appended by this function)
        shared.setTitle ("Welcome to ");
        //hide the loading message covering the screen
        shared.setSystemStatus ();
        
        //run the `load` function defined in game.js for the game to handle some onload procedures of its own
        game.load ();
        //show the title screen (see `game.pages`. if there's a `show` function for the title screen, it will be executed)
        shared.showPage ("title");
});


/* =======================================================================================================================
   CLASS Player - a base class, your game can extend this to add more player properties
   ======================================================================================================================= */
var Player = Class.create ();
Player.prototype = {
        //override this in your game to add a constructor function to your player's classes
        initialize : Prototype.emptyFunction,
        
        name : "",  //display name
        icon : "",  //the little avatar of the person
        wins : 0    //number of games won by the player
};

/* =======================================================================================================================
   OBJECT shared - functions/properties shared by different games on the site
   ======================================================================================================================= */
var shared = {
        //`shared` relies on a game being loaded and the presence of an object `game`. see 'games/???/game.js' for specs
        host   : false,  //true = you are the host, false = you are the opponent
        played : 0,      //number of matches played
        
        /* ===============================================================================================================
           OBJECT icons - the 16x16 icons to use next to each player's name
           =============================================================================================================== */
        icons  : {
                //override these values in your `game.load` function if you want something custom
                host     : "../-/img/icons/user.png",     //default: player 1 is blue
                opponent : "../-/img/icons/user_red.png"  //default: player 2 is red
        },
        
        /* ===============================================================================================================
           OBJECT templates - reusable templates for pieces of html used in shared
           =============================================================================================================== */
        templates : {
                //template when the player clicks "Start Game" on title screen and must enter their name
                start_game : '<p><label for="user-name">Name: </label><input type="text" name="user-name" id="user-name" '+
                             'maxlength="20" onkeypress="javascript:if(event.keyCode==13){shared.events.startGame();}" />'+
                             '</p><p><a href="#" onclick="javascript:shared.events.titleCancelClick();">Cancel</a> '+
                             '<a href="#" onclick="javascript:shared.events.startGame();">Start Game</a></p><br />'
                ,
                //template when the player clicks "Join Game" on title screen and must enter their name and join key
                join_game : '<p><label for="user-name">Name: </label>'+
                            '<input type="text" name="user-name" id="user-name" maxlength="20" /><label for="join-key">'+
                            'Join Key: </label><input type="text" name="join-key" id="join-key" size="6" maxlength="6" '+
                            'onkeypress="javascript:if(event.keyCode==13){shared.events.joinGame();}" /></p>'+
                            '<p><a href="#" onclick="javascript:shared.events.titleCancelClick();">Cancel</a> '+
                            '<a href="#" onclick="javascript:shared.events.joinGame();">Join Game</a></p>'
                ,
                //template when a new game is started and you are provided with the join key
                join_key : new Template (
                        '<p>Copy the key code below and give it<br />to your friend so that they can join the game</p><p>'+
                        '<input id="shared-key" type="text" readonly="readonly" value="#{conn_id}" /></p><p><br />Waiting '+
                        'for the other player to join&hellip;</p><p><img src="../-/img/waiting.gif" width="16" height="16" '+
                        'alt="Waiting..." /></p>'
                ),
                //template for chat messages
                chat_msg : new Template (
                        '<div id="chat-#{time_id}" class="chat-#{html_class}" style="display:none;"><p><span class="timesta'+
                        'mp">#{time_stamp}</span> <img src="#{icon}" width="16" height="16" alt="User icon" /> '+
                        '<strong>#{name}</strong></p><blockquote><p>#{text}</p></blockquote></div>'
                ),
                //template for emoticons
                chat_emote : new Template (
                        '<img src="../-/img/emotes/#{file}.png" width="16" height="16" alt="#{symbol}" title="#{symbol}" />'
                )
        },
        
        /* > showPage : display a particular page in a game (like the title screen, join page &c)
           ===============================================================================================================
           params * s_page : page name to show (as from `game.pages` array, see `game.js` for relevant game for details)
           =============================================================================================================== */
        showPage : function (s_page) {
                //a 'page' is a screen in the game that the player sees. most games will have a title screen, the main
                //gameplay screen, and maybe rules / about screens. each of these is an html div with the id "page-????"
                //(where ???? is the page's name). in addition to this, the game.js for the game, has an array `game.pages`
                //with the names of each page, along with functions to run when the page is shown / hidden (optional)
                
                //loop over each page and hide/show as appropriate
                game.pages.each (function(o_item) {
                        //reference the html element
                        var e = $("page-"+o_item.name);
                        //if this is the page to be shown...
                        if (o_item.name == s_page) {
                                //if there is a show function present for this page, run it
                                if (typeof o_item.show == "function") {o_item.show ();}
                                e.show ();
                        } else {
                                //if the page is visible (thus needs to be hidden)
                                if (e.visible ()) {
                                        //if there is a hide function present for this page, run it
                                        if (typeof o_item.hide == "function") {o_item.hide ();}
                                        e.hide ();
                                }
                        }
                });
        },
        
        /* > startConnection : connect to the server and start a game, wait for the opponent to join
           ===============================================================================================================
           params * s_playername : the name you've chosen (will be sent to the opponent, so that they know it)
           =============================================================================================================== */
        startConnection : function (s_playername) {
                playerMe.name = s_playername;
                
                //create the game on the server
                jax.open (
                        {name:playerMe.name},  //your chosen name
                        function(o_response){  //:when the game starts, but the other player has not yet joined
                                //if the server okay'd the new slot
                                if (o_response.result) {
                                        //set the window title
                                        this.setTitle (jax.conn_id+" - ");
                                        //close the heads-up display and wait for it to close before continuing...
                                        this.headsup.hide (function(){
                                                //display the join key for the other player to use to join the game
                                                this.headsup.show (this.templates.join_key.evaluate(jax));
                                        }.bind(this));
                                
                                } else {
                                        //TODO: start game or nickname failed
                                        //?/enableNicknameBox (true);
                                }
                        }.bind(this),
                        this.events.gameBegins  //:function to call when the other player joins the game
                );
        },
        
        /* > joinConnection : connect to the server and join a game
           ===============================================================================================================
           params * s_playername : the name you've chosen (will be sent to the opponent, so that they know it)
                    s_joinkey    : the unique key of the game to join
           =============================================================================================================== */
        joinConnection : function (s_playername, s_joinkey) {
                playerMe.name = s_playername;
                
                this.setTitle ("Joining Game... - ");
                this.headsup.show ("<p>Joining Game</p><p>Please Wait&hellip;</p>");
                
                //connect to the other player
                jax.connect (s_joinkey,             //the connection key the user pasted into the text box
                            {name: playerMe.name},  //your nickname to send to the other player
                            this.events.gameBegins  //function to call once you've joined the game (see below)
                );
        },
        
        /* > setPlayerStatus : set a message under the player's info
           ===============================================================================================================
           params * (s_html) : html to display, send nothing to hide the display
           =============================================================================================================== */
        setPlayerStatus : function (s_html) {
                var e = $("player-status-me-msg"),  //reference to the element containing the message
                    v = e.visible ()                //if that element is visible or not
                ;
                if (s_html && v) {
                        //if the message is already visible, just update the text without animating
                        e.update (s_html);
                        
                } else if ((s_html && !v) || (!s_html && v)) {
                        //otherwise, if there's a message to show, and it's not visible, or if the message is being cleared
                        //and it is currently visible, then animate sliding open/closed. "morph" from current position to
                        //a different top/height according to if a message is being shown or hidden 
                        $("player-status-me").morph ("top: "+(s_html?321:363)+"px; height: "+(s_html?63:21)+"px;", {
                                duration    : 0.5,
                                beforeStart : function(){
                                        //before starting the animation, change the html
                                        if (s_html) {e.update (s_html).show ();}
                                },
                                afterFinish : function(){
                                        //after the animation hide and blank
                                        if (!s_html) {e.hide ().update ();}
                                }
                        });
                }
        },
        
        /* ===============================================================================================================
           OBJECT headsup : the heads-up status display in the centre of the game
           =============================================================================================================== */
        headsup : {
                //current visibility status of the heads-up. used to queue animation
                visible : false,
                
                /* > show : make the heads-up visible and display a message
                   =======================================================================================================
                   params * (s_html)    : message to display. if omitted the heads-up will hide
                            (n_timeout) : number of seconds to wait before auto hiding. omit for never
                            (f_timeout) : function to run once the timeout occurs
                   ======================================================================================================= */
                show : function (s_html, n_timeout, f_timeout) {
                        /* warning: your timeout function may be cancelled!
                           ------------------------------------------------
                           to avoid the heads-up message from opening and closing rapidly from multiple calls, previous
                           timeouts will be cancelled in lieu of this function being called again.
                           
                           example:
                              shared.headsup.show ("my timeout will never be run", 5, function(){alert("test");});
                              shared.headsup.show ("because this text will override it", 1)
                           
                           To avoid this, either use a function by-reference for side-by-side calls to `.show`, or use the
                           timeout function of one call to start the next, for example:
                           
                              shared.headsup.show ("this will show first", 5, function(){
                                      shared.headsup.show ("and then this afterwards", 1);
                              });
                        */
                        if (!f_timeout) {f_timeout = Prototype.emptyFunction;}  //default: no callback
                        if (!s_html)    {this.hide ();}  //if no text is provided, hide the heads-up message
                        
                        var e1 = $("shared-headsup"),      //the outside wrapper (that vertically centres the heads-up bar)
                            e2 = $("shared-headsup-text")  //the heads-up bar itself
                        ;
                        //update the message
                        e2.update ("<p>"+s_html+"</p>");
                        
                        //cancel any existing timeout
                        /*var queue = Effect.Queues.get ('headsup');
                        queue.each (function(o_item){
                                o_item.cancel ();
                        });*/
                        //if the status message is hidden, fade it in
                        if (!this.visible) {
                                //hide the message, and the wrapper; the animation will unhide automatically. these two lines
                                //prevent additional flicker in this instance
                                e2.hide ();
                                //animate the heads-up displaying
                                new Effect.Parallel ([
                                        new Effect.BlindDown (e2, {sync:true, scaleFromCenter:true}),
                                        new Effect.Appear    (e1, {sync:true})
                                ], {
                                        duration    : 0.3,
                                        queue       : {position:'end', scope:'headsup', limit:3},
                                        afterFinish : function(){
                                                this.visible = true;
                                        }.bind(this)
                                });
                        }
                        //auto-hide?
                        if (n_timeout) {
                                //wait for the specified timeout and hide, mark this wait with a low fps so that it can be
                                //identified later on (see above)
                                new Effect.Event ({duration:n_timeout, fps:1, afterFinish:function(){
                                        this.hide (f_timeout);
                                }.bind(this), queue:{position: 'end', scope: 'headsup', limit:3}});
                        }
                }, 
                
                /* > hide : hide the heads-up message
                   =======================================================================================================
                   params * (f_callback) : optional function to call after hide is complete, used by `.show` above
                   ======================================================================================================= */
                hide : function (f_callback) {
                        if (this.visible) {
                                this.visible = false;
                                var e1 = $("shared-headsup"),
                                    e2 = $("shared-headsup-text")
                                ;
                                new Effect.Parallel ([
                                        new Effect.BlindUp (e2, {sync:true, scaleFromCenter:true}),
                                        new Effect.Fade    (e1, {sync:true})
                                ], {
                                        duration    : 0.3,
                                        transition  : Effect.Transitions.linear,
                                        queue       : {position:'end', scope:'headsup', limit:3},
                                        afterFinish : function(){
                                                //hide and blank
                                                e1.hide ();
                                                e2.update ("<p></p>");
                                                //if a callback was provided, call it now
                                                if (f_callback) {f_callback ();}
                                        }.bind(this)
                                });
                        }
                }
        }, //end shared.headsup <
        
        /* > setSystemStatus : the status message that covers the screen, e.g. "loading", "disconnected"
           ===============================================================================================================
           params * (s_html) : some html to display in the system overlay, leave out to hide the system status box
           =============================================================================================================== */
        setSystemStatus : function(s_html) {
                var e = $("system-status"),  //reference to the element containing the message
                    v = e.visible ()         //if that element is visible or not
                ;
                if (s_html && v) {
                        //if the message is already visible, just update the text without animating
                        $("system-status-text").update (s_html);
                        
                } else if ((s_html && !v) || (!s_html && v)) {
                        new Effect.toggle (e, 'appear', {
                                duration    : 0.3,
                                queue       : 'end',
                                beforeStart : function(){
                                        //before starting the animation, change the html
                                        if (s_html) {$("system-status-text").update (s_html); e.show ();}
                                },
                                afterFinish : function(){
                                        //hide and blank
                                        if (!s_html) {e.hide (); $("system-status-text").update ();}
                                }
                        });
                }
        },
        
        /* > setTitle : change the document title
           ===============================================================================================================
           params * s_title : the text to display in the title. the game's name is automatically appended
           =============================================================================================================== */
        setTitle : function (s_title) {
                document.title = (game.name) ? s_title + game.name : game.name;
        }
};


/* =======================================================================================================================
   OBJECT shared.events - storage for element events (so that one function pointer can be used for multiple element events)
   ======================================================================================================================= */
shared.events = {
        /* > gameBegins : the moment when actual gameplay begins (this is an ajax event)
           =============================================================================================================== */
        gameBegins : function (o_response) {
                //this function is called from `shared.startConnection` or `shared.joinConnection`. here the server has
                //either started or joined the game, both player's details are known, a connection is fully established.
                //display the game screen, put the player's names to screen
                
                //the other player has joined the game
                playerThem.name = o_response.data.name;
                //set the chrome title
                shared.setTitle (playerMe.name+" v. "+playerThem.name+" - ");
                
                //set the icons to use
                playerMe.icon   = shared.host ? shared.icons.host : shared.icons.opponent;
                playerThem.icon = shared.host ? shared.icons.opponent : shared.icons.host;
                
                //display player 1's name / icon
                $("player-me-name").innerHTML = playerMe.name;
                $("player-me-icon").src = playerMe.icon;
                shared.setPlayerStatus ();
                
                //display player 2's name / icon
                $("player-them-name").innerHTML = playerThem.name;
                $("player-them-icon").src = playerThem.icon;
                
                //display the game screen
                shared.showPage ("game");
                
                //hide the headsup display, wait until it has finished animating before...
                shared.headsup.hide (function(){
                        //slide in the player information bars at the top and bottom
                        new Effect.Parallel ([
                                new Effect.SlideDown ("player-status-them", {sync: true}),
                                new Effect.Move ("player-status-me", {x: 0, y: -21, mode: 'relative', sync: true, beforeStart: function(o_effect){
                                        o_effect.element.style.top = "384px";
                                        o_effect.element.show ();
                                }})
                        ], {
                                duration    : 0.5,
                                afterFinish : function () {
                                        //start the game
                                        game.start ();
                                }
                        });
                });
        },
        
        /* > chatEmotesShow : slide open/closed the emoticon panel
           =============================================================================================================== */
        chatEmotesShow : function () {
                //slide up the panel (by shrinking the chatlog)
                var height = $("shared-chat-emotes").getDimensions ().height,
                    perc   = ((321 - height) / 321) * 100
                ;
                new Effect.Scale ($("shared-chat-history"), (this.alt=="open"?perc:100), {
                        scaleFrom    : (this.alt == "open" ? 100 : perc),
                        duration     : 0.3,
                        scaleX       : false,                  //do not scale width
                        scaleContent : false,                  //do not scale insides
                        scaleMode    : {originalHeight: 321},  //base reference for %
                        afterFinish  : function(){
                                var e = $("shared-chat-emote");
                                e.title = (e.alt == "open") ? "Click to hide emotes" : "Click to show emotes";
                                e.alt   = (e.alt == "open") ? "close" : "open";
                        }
                });
        },
        
        /* > chatEmoteClick : when you click on an emote in the emoticon panel
           =============================================================================================================== */
        chatEmoteClick : function () {
                var alt = this.alt;
                shared.chat.emotes.each (function(o_emote){
                        if (o_emote.symbol == alt) {
                                $("shared-chat-input").value += " " + o_emote.symbol + " ";
                                $("shared-chat-input").focus ();
                                shared.events.chatEmotesShow ($("shared-chat-emote"));
                        }
                }); 
        },
        
        /* > titleStartGameClick : when you click on "Start Game" on the title screen
           =============================================================================================================== */
        titleStartGameClick : function () {
                shared.host = true;
                shared.headsup.show (shared.templates.start_game);
        },
        
        /* > titleJoinGameClick : when you click on "Join Game" on the title screen
           =============================================================================================================== */
        titleJoinGameClick : function () {
                shared.host = false;
                shared.headsup.show (shared.templates.join_game);
        },
        
        /* > titleCancelClick : when you click the "Cancel" button after clicking "Start Game" or "Join Game"
           =============================================================================================================== */
        titleCancelClick : function () {
                shared.headsup.hide ();
        },
        
        /* > startGame : after you've entered your name and clicked to start the game
           =============================================================================================================== */
        startGame : function () {
                //TODO: validate name
                shared.startConnection ($F("user-name"));
        },
        
        /* > joinGame : after you've entered your name and join key, and clicked to start the game
           =============================================================================================================== */
        joinGame : function () {
                //TODO: validate name / join key
                shared.joinConnection ($F("user-name"), $F("join-key"));
        }
};

/* jax_disconnect < listen out for the disconnect message when the other player leaves the game
   ======================================================================================================================= */
jax.listenFor ("jax_disconnect", function(o_response) {
        //if the player closed the window...
        if (o_response.data.reason == "unload") {
                shared.headsup.hide ();
                shared.setTitle (playerThem.name+" left the game - ");
                shared.setSystemStatus (
                        playerThem.name+' left the game.<br /><a href="javascript:location.reload ();">Play Again</a>'
                );
        }
});

function enableNicknameBox (b_enabled) {
        var e = $("user-submit");
        e.disabled = (b_enabled ? "" : "disabled");
        e.value    = (b_enabled ? "Start Game" : "Checking...");
        $("user-name").disabled = (b_enabled ? "" : "disabled");
}

/* > create2DArray : javascript has no built in method for creating 2D arrays
   ======================================================================================================================= 
   params * n_width       : 1-based width of the 2D array. e.g. 8 will create elements 0-7
            n_height      : 1-based height of the 2D array
            (x_initvalue) : an initial value to assign to each element in the array. any type supported (default null)
   return * array         : the 2D array
   ======================================================================================================================= */
function create2DArray (n_width, n_height, x_initvalue) {
        var arr = new Array (n_width-1);
        for (var x=0; x<n_width; x++) {
                arr[x] = new Array (n_height-1);
                for (var y=0; y<n_height; y++) {arr[x][y] = x_initvalue;}
        }
        return arr;
}

/* > bsod : the fatal error screen, no one hears your screams
   ======================================================================================================================= 
   params * (s_message) : error message to display on the bsod and console. use null to clear the bsod
            (s_url)     : url of file that caused the error (provided by native js error throwing)
            (n_line)    : line number of the error (provided by native js error throwing)
   return * true        : so that the javascript error is not ignored by the browser (when error is thrown)
   ======================================================================================================================= */
function bsod (s_message, s_url, n_line) {
        //if an error message is provided, show the bsod:
        if (s_message) {
                //construct the message, include line number and filename if provided
                s_message = (s_url?(s_url.split("/").last())+" ":"") + (n_line?"["+n_line+"]: ":"") + s_message;
                //put the message on the bsod
                document.getElementById ("bsod-msg").innerHTML = s_message ? s_message : "Check the Javascript Console for details";
                //show it (Prototype is not used here incase Prototype is the thing causing the error)
                document.getElementById ("bsod").style.display = "block";
                //show the error on the Firebug console (if present)
                console.error (s_message);
        } else {
                //otherwise hide it
                document.getElementById ("bsod").style.display = "none";
        }
        //accept the error and stop the browser (when error was thrown by the browser)
        return true;
}
//try to catch thrown errors (url and line number are provided by the browser)
if (config.use_bsod) {window.onerror = bsod;}

//=== end of line ===========================================================================================================
//'js/boot.js' « previous                                                                                next » 'js/_chat.js'