/* =======================================================================================================================
   js/shared.js - functions shared with all the games on the site
   ======================================================================================================================= */

//create an instance of Jax, direct it to the PHP page to receive the AJAX calls
var jax = new Jax ("../../"+config.jax_path);

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
        host  : false,                      //true = you are the host, false = you are the opponent
        pages : ["title", "user", "game"],  //the screens in the game, override this in game.js to add more
        icons : {
                host     : "../-/icons/user.png",
                opponent : "../-/icons/user_red.png"
        },
        
        //number of matches played
        played : 0,
        
        /* > showPage : display a particular page in a game (like the titlescreen, join page etc)
           ===============================================================================================================
           params * s_page : page name to show (as from game.pages array)
           =============================================================================================================== */
        showPage : function (s_page) {
                this.pages.each (function(s_item){
                        $("page-" + s_item).style.display = (s_item == s_page ? "block" : "none");
                });
        },
        
        /* > connect : start/join a game
           ===============================================================================================================
           params * b_host : if you are the host (start game) or opponent (join game)
           =============================================================================================================== */
        connect : function (b_host) {
                //display the game board
                this.showPage ("game");
                
                //disable the 'Start Game' button
                enableNicknameBox (false);
                
                playerMe.name   = $F("user-nickname");
                playerMe.icon   = b_host ? this.icons.host : this.icons.opponent;
                playerThem.icon = b_host ? this.icons.opponent : this.icons.host;
                
                //if you are the host, or opponent:
                if (b_host) {    //------------------------------------------------------------------------------------------
                        //create the game on the server
                        jax.open(
                                {name : playerMe.name},  //your chosen name
                                function(o_response){    //when the game starts, but the other player has not yet joined
                                        //if the server okay'd the new slot
                                        if (o_response.result) {
                                                //display the code for the other player to use to join with
                                                this.setSystemStatus (
                                                        '<p>Copy the key code below and give it<br />to your friend so that'+
                                                        ' they can join the game</p><p><input type="text" readonly="readonl'+
                                                        'y" size="6" value="' + jax.conn_id + '" /></p><p><br />Waiting for'+
                                                        ' the other player to join...</p><p><img src="../-/waiting.gif" wid'+
                                                        'th="16" height="16" alt="Waiting..." /></p>'
                                                );
                                                //set the chrome title
                                                this.setTitle (jax.conn_id + " - ");
                                        
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
                        jax.connect ($F("join-key"),         //the connection key the user pasted into the text box
                                    {name : playerMe.name},  //your nickname to send to the other player
                                    preStart.bind(this)      //function to call once you've joined the game (see below)
                        );
                }
                
                /* PRIVATE > preStart : a hidden function available only to shared.connect
                   ======================================================================================================= */
                function preStart (o_response) {
                        //the other player has joined the game.
                        playerThem.name = o_response.data.name;
                        
                        //display player 1's name / icon
                        $("jax-game-p1name").innerHTML = playerMe.name;
                        $("jax-game-p1icon").src = playerMe.icon;
                        $("player-status-me").style.display = "block";
                        this.setPlayerStatus ();

                        //display player 2's name / icon
                        $("jax-game-p2name").innerHTML = playerThem.name;
                        $("jax-game-p2icon").src = playerThem.icon;
                        $("player-status-them").style.display = "block";
                        
                        //set the chrome title
                        this.setTitle (playerMe.name + " v. " + playerThem.name + " - ");
                        //start the game
                        game.start ();
                }
        },
        
        /* > setPlayerStatus : set a message under the player's info
           ===============================================================================================================
           params * s_html : html to display, send nothing to hide the display
           =============================================================================================================== */
        setPlayerStatus : function (s_html) {
                var scale = 2,                          //size to expand the player section to (in 100's %)
                    e     = $("player-status-me-msg"),  //reference to the element containing the message
                    v     = e.visible ()                //if that element is visible or not
                ;
                if (s_html && v) {
                        //if the message is already visible, just update the text without animating
                        e.innerHTML = s_html;
                        
                } else if ((s_html && !v) || (!s_html && v)) {
                        //otherwise, if there's a message to show, and it's not visible, or if the message is being cleared
                        //and it is currently visible, then animate sliding open/closed
                        new Effect.Parallel ([
                                /*!/new Effect.Scale($("player-status-me"), (s_html?scale*100:100), {  //scale to %
                                        scaleFrom    : (s_html?100:scale*100),                   //scale from %
                                        scaleX       : false,                                    //do not scale width
                                        scaleContent : false,                                    //do not scale insides
                                        scaleMode    : {originalHeight: 21}                      //base reference for %
                                }),*/
                                //also move the bar at the same time (so that it effectively slides upwards)
                                new Effect.MoveBy($("player-status-me"), (s_html?-(21*(scale)):21*(scale)), 0)
                        ], {
                                duration    : 0.5,
                                beforeStart : function(){
                                        //before starting the animation, change the html
                                        if (s_html) {e.innerHTML = s_html; e.show ();}
                                },
                                afterFinish : function(){
                                        //after the animation hide and blank
                                        if (!s_html) {e.hide (); e.innerHTML = "";}
                                }
                        });
                }
        },
        
        /* > setSystemStatus : the status message that covers the screen, e.g. 'loading', 'disconnected'
           ===============================================================================================================
           params * s_html : some html to display in the system overlay, leave out to hide the system status box
           =============================================================================================================== */
        setSystemStatus : function(s_html) {
                var e = $("system-status"),  //reference to the element containing the message
                    v = e.visible ()         //if that element is visible or not
                ;
                if (s_html && v) {
                        //if the message is already visible, just update the text without animating
                        $("system-status-text").innerHTML = s_html;
                        
                } else if ((s_html && !v) || (!s_html && v)) {
                        new Effect.Opacity (e, {
                                duration    : 0.3,
                                from        : (s_html?0:1),
                                to          : (s_html?1:0),
                                queue       : 'end',
                                beforeStart : function(){
                                        //before starting the animation, change the html
                                        if (s_html) {$("system-status-text").innerHTML = s_html; e.show ();}
                                },
                                afterFinish : function(){
                                        //hide and blank
                                        if (!s_html) {e.hide (); $("system-status-text").innerHTML = "";}
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
        /* list of emotes. the file name matches the image file name (sans extension) in /games/-/emotes/
           refer to: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Guide:Regular_Expressions for regex rules
        */
        emotes : [
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
        show : function(){
                var e_shared_chat_input  = $("shared-chat-input"),   //the textarea you type your message in
                    e_shared_chat_label  = $("shared-chat-label"),   //the "<chat here>" message
                    e_shared_chat_emotes = $("shared-chat-emotes"),  //the emote list holder
                    html                 = ""                        //used to put together the emote list
                ;
                
                //make the chat section visible
                $("shared-chat").style.display = "block";
                //clear the chatbox textarea as Firefox will remember the field value on refresh
                if (!e_shared_chat_input.value) {
                        e_shared_chat_input.value = "";
                        e_shared_chat_label.style.display = "block";
                }
                
                //create the emote list
                this.emotes.each (function(o_emote){
                        //emotes can be hidden so that they do not show in the panel, but still function when typed
                        if (!o_emote.hide) {
                                //add the emoticon image to the collection
                                html += '<img src="../-/emotes/'+o_emote.file+'.png" width="16" height="16" '+
                                        'alt="'+o_emote.symbol+'" title="'+o_emote.symbol+'" />'
                                ;
                        }
                });
                //put the images into the panel
                e_shared_chat_emotes.innerHTML = html;
                
                //add an onclick event to each of the emotes in the panel
                $A(e_shared_chat_emotes.getElementsByTagName("img")).each (function(o_element){
                        o_element.onclick = shared.events.chatEmoteClick;
                });
                
                //function the emote button to open the emote panel
                $("shared-chat-emote").onclick = shared.events.chatEmotesShow;
                
                //respond to chat messages
                jax.listenFor ("game_chat_message", function(o_response){
                        //display the chat message received...
                        this.addMessage (playerThem.name, playerThem.icon, o_response.data.msg);
                }.bind(this));

                //when the user clicks on the textbox, hide the label
                Event.observe (e_shared_chat_input, "focus", function(e_event){
                        e_shared_chat_label.style.display = "none";
                });
                //when focus on the textbox is lost, put the label back if the textbox is empty
                Event.observe (e_shared_chat_input, "blur", function(e_event){
                        if (!e_shared_chat_input.value.replace(/^\s*|\s*$/g,"")) {
                                e_shared_chat_label.style.display = "block";
                        }
                });
                //if the user clicks on the label itself, pass focus to the textbox
                Event.observe (e_shared_chat_input, "click", function(e_event){
                        e_shared_chat_input.focus ();
                });

                //trap keypresses to the input field
                Event.observe (e_shared_chat_input, "keypress", function(e_event){
                        //if they press Return
                        if(e_event.keyCode == 13) {
                                //disable the chat textbox and send the message...
                                var msg = e_shared_chat_input.value.replace (/^\s*|\s*$/g,"");
                                e_shared_chat_input.value = "";
                                if (msg.length) {
                                        e_shared_chat_input.readOnly = true;
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
                var now       = new Date (),
                    hours     = now.getHours (),
                    minutes   = now.getMinutes (),
                    timestamp = (hours > 12 ? hours - 12 : hours) + ":" + (minutes < 10 ? "0" : "") + minutes,
                    timeid    = now.getTime ()
                ;
                //insert emoticon images in the message
                s_msg = s_msg.escapeHTML ();
                this.emotes.each (function(o_emote, n_index){
                        //replace the emote with the image
                        s_msg = s_msg.replace (o_emote.regex, '<img src="../-/emotes/'+o_emote.file+'.png" width="16" '+
                                               'height="16" alt="'+o_emote.symbol+'" title="'+o_emote.symbol+'" />'
                        );
                }.bind(this));
                
                //add the message to the chat history. 'Insertion.Bottom' is used (instead of '.innerHTML+=') so that 
                //multiple messages coming in at the same time don't overwrite each other
                var e = $("shared-chat-history");
                new Insertion.Bottom (e, '<div id="chat-'+timeid+'" class="chat-'+(s_name==playerMe.name?"me":"them")+'" '+
                                         'style="display: none;"><p><em>'+timestamp+'</em> <img src="'+s_icon+'" '+
                                         'width="16" height="16" alt="User icon" /> <strong>'+s_name+'</strong></p>'+
                                         '<blockquote><p>'+s_msg+'</p></blockquote></div>'
                );
                //animate the message appearing (and scroll down to meet it)
                new Effect.SlideDown ("chat-"+timeid, {duration: 0.3, afterUpdate: function(){
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

/* =======================================================================================================================
   > when the page finishes loading all code...
   ======================================================================================================================= */
Event.observe (window, 'load', function(){
        //put the version info in the log
        console.info ("Welcome to Jax Games | "+game.name+": "+game.version+" ["+Date()+"]\n"+
                      "jax: "+jax.version+" - Script.aculo.us: "+Scriptaculous.Version+" - Prototype: "+Prototype.Version+"\n"
        );
        //change the chrome title (game.name is automatically appended)
        shared.setTitle ("Welcome to ");
        //hide the loading page and display the game's title screen
        shared.setSystemStatus ();
        //Firefox remembers the values in fields, even after refreshing, clear the chat box
        $("shared-chat-input").value = "";
        
        //the buttons on the title screen
        $("title-start-game").onclick = shared.events.titleButtonClick.bindAsEventListener (this, true);
        $("title-join-game").onclick  = shared.events.titleButtonClick.bindAsEventListener (this, false);
        
        //when the user clicks the Start/Join Game button (on the user page)
        $("user-submit").onclick = shared.events.userSubmitClick;
        
        //run the load function defined in game.js for the game to handle some on load procedures of it's own
        game.load ();
});

/* =======================================================================================================================
   jax_disconnect < listen out for the disconnect message when the other player leaves the game
   ======================================================================================================================= */
jax.listenFor ("jax_disconnect", function(o_response) {
        //if the player closed the window...
        if (o_response.data.reason == "unload") {
                shared.setTitle (playerThem.name + " left the game - ");
                shared.setSystemStatus (playerThem.name+" left the game");
        }
});

function enableNicknameBox (b_enabled) {
        var e;
        if (b_enabled) {
                //enable the nickname text box
                $("user-nickname").disabled = "";
                e = $("user-submit");
                e.disabled = "";
                e.value = "Start Game";
        } else {
                //change the submit button to say "checking...", and disable it
                e = $("user-submit");
                e.disabled = "disabled";
                e.value = "checking...";
                //disable the nickname text box
                $("user-nickname").disabled = "";
        }
}

function bsod (message, url, line) {
        document.getElementById ("jax-bsod").style.display = "block";
        console.warning (line + ": " + message);
        return true;
}
//!/window.onerror = bsod;

//=== end of line ===========================================================================================================
//licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
//jax, jax games (c) copyright Kroc Camen 2005-2007