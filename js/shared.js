/* =======================================================================================================================
   js/shared.js - functions shared with all the games on the site
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax, jax games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   shared.js contains objects that are shared between all of the games. in particular `shared`, an object containing core
   functions to power the games and make the shared ui function (e.g. chat box)
*/

//create an instance of `Jax`, direct it to the php page to receive the ajax calls.
//jax allows us to setup a ‘browser-to-browser’ connection via ajax. one player starts a new connection, and the other joins.
//the server is polled every few seconds for new messages from each other. jax is therefore not realtime; there is absolutely
//no gaurantee that a message will arrive at the other player at a given time. jax games are therefore turn-based
var jax = new Jax ("../../"+config.jax.path, config.jax.interval);


/* > EVENT onload - when everything is loaded and we are ready to go…
   ======================================================================================================================= */
Event.observe (window, 'load', function(){
        //this is essentially the starting point for jax games. after all the scripts have been loaded, this function will
        //put everything into motion. read further down this page for the definition of the `shared` object and functions
        
        //put the version info in the log
        console.info ("Welcome to Jax Games | "+game.name+": "+game.version+" ["+Date()+"]\n"+
                      "jax: "+jax.version+" - Script.aculo.us: "+Scriptaculous.Version+" - Prototype: "+Prototype.Version+"\n"
        );
        
        //Firefox remembers the values in fields, even after refreshing, clear the chat box
        $("shared-chat-input").value = "";
        
        //the buttons on the title screen
        $("title-start-game").onclick = shared.events.titleButtonClick.bindAsEventListener (this, true);
        $("title-join-game").onclick  = shared.events.titleButtonClick.bindAsEventListener (this, false);
        
        //when the user clicks the Start/Join Game button (on the user page)
        $("user-submit").onclick = shared.events.userSubmitClick;
        
        //change the window title (`game.name` is automatically appended by this function)
        shared.setTitle ("Welcome to ");
        //hide the loading message covering the screen
        shared.setSystemStatus ();
        
        //run the `load` function defined in game.js for the game to handle some onload procedures of its own
        game.load ();
        //show the title screen (see `game.pages`, if there’s a `show` function for the title screen, it will be executed)
        shared.showPage ("title");
});


/* =======================================================================================================================
   CLASS Player - a base class, your game can extend this to add more player properties
   ======================================================================================================================= */
var Player = Class.create ();
Player.prototype = {
        //override this in your game to add a constructor function to your player’s classes
        initialize : Prototype.emptyFunction,
        
        name : "",  //display name
        icon : "",  //the little avatar of the person
        wins : 0    //number of games won by the player
};

/* =======================================================================================================================
   OBJECT shared - functions/properties shared by different games on the site
   ======================================================================================================================= */
//`shared` relies on a game being loaded and the presence of an object `game`. see ‘games/???/game.js’ for specs
var shared = {
        host   : false,  //true = you are the host, false = you are the opponent
        played : 0,      //number of matches played
        
        icons  : {
                host     : "../-/icons/user.png",
                opponent : "../-/icons/user_red.png"
        },
        
        //reusable templates for pieces of html used in shared
        templates : {
                //template when a new game is started and you are provided with the join key
                join_key : new Template (
                        '<p>Copy the key code below and give it<br />to your friend so that they can join the game</p><p>'+
                        '<input id="shared-key" type="text" readonly="readonly" value="#{conn_id}" /></p><p><br />Waiting '+
                        'for the other player to join&hellip;</p><p><img src="../-/waiting.gif" width="16" height="16" alt="Wai'+
                        'ting..." /></p>'
                ),
                //template for chat messages
                chat_msg : new Template (
                        '<div id="chat-#{time_id}" class="chat-#{html_class}" style="display: none;"><p><em>#{time_stamp}'+
                        '</em> <img src="#{icon}" width="16" height="16" alt="User icon" /> <strong>#{name}</strong></p>'+
                        '<blockquote><p>#{text}</p></blockquote></div>'
                ),
                //template for emoticons
                chat_emote : new Template (
                        '<img src="../-/emotes/#{file}.png" width="16" height="16" alt="#{symbol}" title="#{symbol}" />'
                )
        },
        
        /* > showPage : display a particular page in a game (like the title screen, join page etc)
           ===============================================================================================================
           params * s_page : page name to show (as from `game.pages` array, see `game.js` for relevant game for details)
           =============================================================================================================== */
        showPage : function (s_page) {
                //a ‘page’ is a screen in the game that the player sees. most games will have a title screen, the main
                //gameplay screen, and maybe rules / about screens. each of these is an html div with the id “page-????”
                //(where ???? is the page’s name). in addition to this, the game.js for the game, has an array `game.pages`
                //with the names of each page, along with functions to run when the page is shown / hidden
                
                //loop over each page and hide/show as appropriate
                game.pages.each (function(o_item) {
                        //reference the html element
                        var e = $("page-"+o_item.name);
                        //if this is the page to be shown…
                        if (o_item.name == s_page) {
                                //if it’s not visible (don’t run the show functions for pages already visible)
                                if (!e.visible ()) {
                                        //if there is a show function present for this page, run it
                                        if (typeof o_item.show == "function") {o_item.show ();}
                                        e.show ();
                                }
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
        
        /* > connect : start/join a game
           ===============================================================================================================
           params * (b_host) : if you are the host (start game) or opponent (join game)
           =============================================================================================================== */
        connect : function (b_host) {
                if (typeof b_host == "undefined") {b_host = shared.host;}  //default: as specified in `shared.host`
                
                //display the game screen
                this.showPage ("game");
                
                //disable the “Start Game” button
                enableNicknameBox (false);
                
                playerMe.name   = $F("user-nickname");
                playerMe.icon   = b_host ? this.icons.host : this.icons.opponent;
                playerThem.icon = b_host ? this.icons.opponent : this.icons.host;
                
                //if you are the host, or opponent:
                if (b_host) {  //--------------------------------------------------------------------------------------------
                        //create the game on the server
                        jax.open (
                                {name : playerMe.name},  //your chosen name
                                function(o_response){    //when the game starts, but the other player has not yet joined
                                        //if the server okay’d the new slot
                                        if (o_response.result) {
                                                //display the code for the other player to use to join with
                                                this.setSystemStatus (this.templates.join_key.evaluate(jax));
                                                //set the chrome title
                                                this.setTitle (jax.conn_id+" - ");
                                        
                                        } else {
                                                //TODO: start game or nickname failed
                                                enableNicknameBox (true);
                                        }
                                }.bind(this),
                                preStart.bind(this)  //second function: when the other player joins the game
                        );
                        
                } else {  //-------------------------------------------------------------------------------------------------
                        this.setTitle ("Joining Game... - ");
                        this.setSystemStatus ("<p>Joining Game</p><p>Please Wait&hellip;</p>");
                        
                        //connect to the other player
                        jax.connect ($F("join-key"),        //the connection key the user pasted into the text box
                                    {name: playerMe.name},  //your nickname to send to the other player
                                    preStart.bind(this)     //function to call once you’ve joined the game (see below)
                        );
                }
                
                /* PRIVATE > preStart : a hidden function available only to `shared.connect`
                   ======================================================================================================= */
                function preStart (o_response) {
                        //the other player has joined the game.
                        playerThem.name = o_response.data.name;
                        
                        //display player 1’s name / icon
                        $("jax-game-p1name").innerHTML = playerMe.name;
                        $("jax-game-p1icon").src = playerMe.icon;
                        $("player-status-me").style.display = "block";
                        this.setPlayerStatus ();
                        
                        //display player 2’s name / icon
                        $("jax-game-p2name").innerHTML = playerThem.name;
                        $("jax-game-p2icon").src = playerThem.icon;
                        $("player-status-them").style.display = "block";
                        
                        //set the chrome title
                        this.setTitle (playerMe.name+" v. "+playerThem.name+" - ");
                        //start the game
                        game.start ();
                }
        },
        
        /* > setPlayerStatus : set a message under the player’s info
           ===============================================================================================================
           params * (s_html) : html to display, send nothing to hide the display
           =============================================================================================================== */
        setPlayerStatus : function (s_html) {
                var scale = 2,                          //size to expand the player section to (in 100s %)
                    e     = $("player-status-me-msg"),  //reference to the element containing the message
                    v     = e.visible ()                //if that element is visible or not
                ;
                if (s_html && v) {
                        //if the message is already visible, just update the text without animating
                        e.update (s_html);
                        
                } else if ((s_html && !v) || (!s_html && v)) {
                        //otherwise, if there’s a message to show, and it’s not visible, or if the message is being cleared
                        //and it is currently visible, then animate sliding open/closed
                        /*!/new Effect.Scale($("player-status-me"), (s_html?scale*100:100), {  //scale to %
                                scaleFrom    : (s_html?100:scale*100),                   //scale from %
                                scaleX       : false,                                    //do not scale width
                                scaleContent : false,                                    //do not scale insides
                                scaleMode    : {originalHeight: 21}                      //base reference for %
                        }),*/
                        //also move the bar at the same time (so that it effectively slides upwards)
                        new Effect.Move ($("player-status-me"), {
                                x           : 0,
                                y           : (s_html?-(21*(scale)):21*(scale)),
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
                        
                        //if the status message is hidden, fade it in
                        if (!this.visible) {
                                //hide the message, and the wrapper; the animation will unhide automatically. these two lines
                                //prevent additional flicker in this instance
                                e2.hide ();
                                //animate the heads-up displaying
                                new Effect.Parallel ([
                                        new Effect.BlindDown (e2, {sync:true, scaleFromCenter:true}),
                                        new Effect.Appear (e1, {sync:true})
                                ], {
                                        duration    : 0.3,
                                        queue       : {position:'end', scope:'headsup', limit:2},
                                        afterFinish : function(){
                                                this.visible = true;
                                        }.bind(this)
                                });
                        }
                        //cancel any existing timeout
                        var queue = Effect.Queues.get ('headsup');
                        queue.each (function(o_item){
                                if (o_item.options.fps == 1) {o_item.cancel ();}
                        });
                        //auto-hide?
                        if (n_timeout) {
                                //wait for the specified timeout and hide, mark this wait with a low fps so that it can be
                                //identified later on (see above)
                                new Effect.Event ({duration:n_timeout, fps:1, afterFinish:function(){
                                        this.hide (f_timeout);
                                }.bind(this), queue:{position: 'end', scope: 'headsup', limit:2}});
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
                                        new Effect.Fade (e1, {sync:true})
                                ], {
                                        duration    : 0.3,
                                        transition  : Effect.Transitions.linear,
                                        queue       : {position:'end', scope:'headsup', limit:2},
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
        
        /* > setSystemStatus : the status message that covers the screen, e.g. “loading”, “disconnected”
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


/* ========================================================================================================================
   OBJECT shared.chat - manage the chatbox aside the game
   ======================================================================================================================= */
shared.chat = {
        //list of emotes. the file name matches the image file name (sans extension) in ‘games/-/emotes/’
        //refer to: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Guide:Regular_Expressions for regex rules
        emotes : [
                //note: add a “hide: true” pair to an emote object to hide the emote from the pull up list
                //TODO: can't work out the regex to distinguish “:)” from “>:)”
                {file: "58", symbol: ">:[", regex: /&gt;:[\[\(]/g},  // miffed   >:[ or >:(
                {file: "60", symbol: ">:]", regex: /&gt;:[\]\)]/g},  // evilgrin >:] or >:)
                {file: "01", symbol: ":)",  regex: /:\)/g},          // happy    :)
                {file: "05", symbol: ";)",  regex: /;\)/g},          // wink     ;)
                {file: "08", symbol: ":(",  regex: /:\(/g},          // sad      :(
                {file: "12", symbol: "XD",  regex: /XD/g},           // XD (no lowercase)
                {file: "15", symbol: ":P",  regex: /:p/gi},          // tongue   :P
                {file: "19", symbol: ":s",  regex: /:s/gi},          // worried  :s
                {file: "19", symbol: ":/",  regex: /:[\\\/]/g},      // sigh     :/ or :\
                {file: "25", symbol: ":X",  regex: /:x|x_x/gi},      // dead     :X or X_x
                {file: "28", symbol: "o.o", regex: /o[\._]+o/gi},    // amazed   o.o, O_o
                {file: "29", symbol: ":D",  regex: /:D/g},           // grin     :D (no lowercase)
                {file: "30", symbol: ":?",  regex: /:\?/g},          // confused :?
                {file: "38", symbol: "B)",  regex: /B\)/g},          // cool     B)
                {file: "45", symbol: ":$",  regex: /:\$/g},          // kiss     :$
                {file: "55", symbol: "D:",  regex: /D:/g},           // oh noes  D: (no lowercase)
                {file: "62", symbol: ":o",  regex: /:o/gi},          // shocked  :O
                {file: "63", symbol: ";P",  regex: /;p/gi}           // sarcasm  ;P
        ],
        
        /* > show : make the chat section visible
           =============================================================================================================== */
        show : function () {
                var e_chat_input  = $("shared-chat-input"),   //the textarea you type your message in
                    e_chat_label  = $("shared-chat-label"),   //the "<chat here>" message
                    e_chat_emotes = $("shared-chat-emotes"),  //the emote list holder
                    html          = ""                        //used to put together the emote list
                ;
                
                //make the chat section visible
                $("shared-chat").style.display = "block";
                //clear the chatbox textarea as Firefox will remember the field value on refresh
                if (!e_chat_input.value) {
                        e_chat_input.value = "";
                        e_chat_label.style.display = "block";
                }
                
                //create the emote list
                this.emotes.each (function(o_emote){
                        //emotes can be hidden so that they do not show in the panel, but still function when typed
                        if (!o_emote.hide) {
                                //add the emoticon image to the collection
                                html += shared.templates.chat_emote.evaluate (o_emote);
                        }
                });
                //put the images into the panel
                e_chat_emotes.update (html);
                
                //add an onclick event to each of the emotes in the panel
                $A(e_chat_emotes.getElementsByTagName("img")).each (function(o_element){
                        o_element.onclick = shared.events.chatEmoteClick;
                });
                
                //function the emote button to open the emote panel
                $("shared-chat-emote").onclick = shared.events.chatEmotesShow;
                
                //respond to chat messages
                jax.listenFor ("game_chat_message", function(o_response){
                        //display the chat message received
                        this.addMessage (playerThem.name, playerThem.icon, o_response.data.msg);
                }.bind(this));
                
                //when the user clicks on the textbox, hide the label
                Event.observe (e_chat_input, "focus", function(e_event){
                        e_chat_label.style.display = "none";
                });
                //when focus on the textbox is lost, put the label back if the textbox is empty
                Event.observe (e_chat_input, "blur", function(e_event){
                        if (!e_chat_input.value.replace(/^\s*|\s*$/g,"")) {
                                e_chat_label.style.display = "block";
                        }
                });
                //if the user clicks on the label itself, pass focus to the textbox
                Event.observe (e_chat_input, "click", function(e_event){
                        e_chat_input.focus ();
                });
                
                //trap keypresses to the input field
                Event.observe (e_chat_input, "keypress", function(e_event){
                        //if they press Return
                        if(e_event.keyCode == 13) {
                                //disable the chat textbox and send the message…
                                var msg = e_chat_input.value.replace (/^\s*|\s*$/g,"");
                                e_chat_input.value = "";
                                if (msg.length) {
                                        e_chat_input.readOnly = true;
                                        this.sendMessage (msg);
                                }
                        }
                }.bind(this));
        },
        
        /* > hide : make the chat section invisible
           =============================================================================================================== */
        hide : function () {
                //hide the container
                $("shared-chat").style.display = "none";
                
                //stop listening for keypresses
                Event.stopObserving ("shared-chat-input", "keypress");
        },
        
        /* > sendMessage : send a chat message to the server for the other player
           ================================================================================================================
           params * s_msg : text to send to the other player's chatbox
           =============================================================================================================== */
        sendMessage : function (s_msg) {
                //echo locally
                this.addMessage (playerMe.name, playerMe.icon, s_msg);
                
                //send the message to the server
                jax.sendToQueue ("game_chat_message", {msg:s_msg}, function(o_response){
                        var e = $("shared-chat-input");
                        e.readOnly = false;
                        e.focus ();
                });
        },
        
        /* > addMessage : display a chat message on screen
           ===============================================================================================================
           params * s_name : name of person to display
                    s_icon : icon to display, sans extension
                    s_msg  : text to display, will be parsed for emotes automatically
           =============================================================================================================== */
        addMessage : function (s_name, s_icon, s_msg) {
                //get the timestamp
                var now      = new Date (),
                    hours    = now.getHours (),
                    minutes  = now.getMinutes (),
                    chat_msg = {
                            time_stamp : (hours > 12 ? hours - 12 : hours) + ":" + (minutes < 10 ? "0" : "") + minutes,
                            time_id    : now.getTime (),
                            html_class : (s_name == playerMe.name ? "me" : "them"),
                            icon       : s_icon,
                            name       : s_name,
                            text       : s_msg.escapeHTML ()
                    }
                ;
                //insert emoticon images in the message
                this.emotes.each (function(o_emote, n_index){
                        //replace the emote with the image
                        chat_msg.text = chat_msg.text.replace (o_emote.regex, shared.templates.chat_emote.evaluate(o_emote));
                }.bind(this));
                
                //add the message to the chat history. `Insertion.Bottom` is used (instead of `.innerHTML+=`) so that 
                //multiple messages coming in at the same time don’t overwrite each other
                var e = $("shared-chat-history");
                new Insertion.Bottom (e, shared.templates.chat_msg.evaluate(chat_msg));
                //animate the message appearing (and scroll down to meet it)
                new Effect.SlideDown ("chat-"+chat_msg.time_id, {duration: 0.3, afterUpdate: function(){
                        //scroll to the bottom of the chat history
                        e.scrollTop = e.scrollHeight;
                }, afterFinish: function(){
                        //and again on the last frame
                        e.scrollTop = e.scrollHeight;
                }});
        }
};

/* =======================================================================================================================
   OBJECT shared.events - storage for element events (so that one function pointer can be used for multiple element events)
   ======================================================================================================================= */
shared.events = {
        /* > chatEmotesShow : slide open/closed the emoticon panel
           =============================================================================================================== */
        chatEmotesShow : function () {
                //slide up the panel (by shrinking the chatlog)
                var height = $("shared-chat-emotes").getDimensions ().height,
                    perc   = ((320 - height) / 320) * 100
                ;
                new Effect.Scale ($("shared-chat-history"), (this.alt=="open"?perc:100), {
                        scaleFrom    : (this.alt == "open" ? 100 : perc),
                        duration     : 0.3,
                        scaleX       : false,                  //do not scale width
                        scaleContent : false,                  //do not scale insides
                        scaleMode    : {originalHeight: 320},  //base reference for %
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
        
        /* > titleButtonClick : to deal with the Start or Join Game button on the title screen
           =============================================================================================================== */
        titleButtonClick : function (e_event, b_host) {
                //enable the nickname textbox as Gecko will keep it disabled if you refesh the page
                enableNicknameBox (true);
                $("join-game").style.display = b_host ? "none" : "block";
                
                shared.host = b_host;
                shared.showPage ("user");
        },
        
        /* > userSubmitClick : when you click the Start/Join Game button
           =============================================================================================================== */
        userSubmitClick : function () {
                shared.connect (shared.host);
        }
};

/* jax_disconnect < listen out for the disconnect message when the other player leaves the game
   ======================================================================================================================= */
jax.listenFor ("jax_disconnect", function(o_response) {
        //if the player closed the window…
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
        $("user-nickname").disabled = (b_enabled ? "" : "disabled");
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
//‘js/boot.js’ « previous                                                                          next » ‘games/*/index.php’