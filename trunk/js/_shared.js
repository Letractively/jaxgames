/* =======================================================================================================================
   js/_shared.js - functions shared with all the games on the site
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   '_shared.js' contains functions shared between all of the games; in particular `shared`: an object containing core
   functions to power the games and make the shared UI function (e.g. chat box, which is in '_chat.js')
*/

//create an instance of `Jax`, direct it to the PHP page to receive the AJAX calls
//Jax allows us to setup a 'browser-to-browser' connection via AJAX. one player starts a new connection, and the other joins.
//the server is polled every few seconds for new messages from each other. Jax is therefore not realtime; there is absolutely
//no gaurantee that a message will arrive at the other player at a given time. Jax games are therefore turn-based
var jax = new Jax ("../../"+config.jax.path, config.jax.interval);


/* EVENT > onload - when everything is loaded and we are ready to go...
   ======================================================================================================================= */
Event.observe (window, 'load', function(){
        //this is essentially the starting point for Jax Games. after all the scripts have been loaded, this function will
        //put everything into motion. read further down this page for the definition of the `shared` object and functions
        
        //put the version info in the log
        console.info ("Welcome to Jax Games | "+game.name+": "+game.version+" ["+Date()+"]\n"+
                      "jax: "+jax.version+" - Scriptaculous: "+Scriptaculous.Version+" - Prototype: "+Prototype.Version+"\n"
        );
        
        //Firefox remembers the values in fields, even after refreshing- clear the chat box
        $("shared-chat-input").value = "";
        
        //hook up the buttons on the title screen
        $("title-start-game").onclick = shared.events.titleStartGameClick;
        $("title-join-game").onclick  = shared.events.titleJoinGameClick;
        
        shared.setTitle ("Welcome to ");  //change the window title (`game.name` is automatically appended by this function)
        shared.setSystemStatus ();        //hide the loading message covering the screen
        
        //run the `load` function defined in the game for the game to handle some onload procedures of its own
        game.load ();
        //show the title screen (see `game.pages`. if there's a `show` function for the title screen, it will be executed)
        shared.showPage ("title");
});


/* =======================================================================================================================
   CLASS Player - a base class, your game can extend this to add more player properties
   ======================================================================================================================= */
var Player = Class.create ();
Player.prototype = {
        //override this in your game to add a constructor to the class. see 'games/blacjax/_classes.js' for an example
        initialize : Prototype.emptyFunction,
        
        name : "",  //display name
        icon : "",  //the little avatar of the person
        wins : 0    //number of games won by the player
};

/* =======================================================================================================================
   OBJECT shared - functions/properties shared by different games on the site
   ======================================================================================================================= */
var shared = {
        host   : false,  //later set to: true = you are the host, false = you are the opponent
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
                )
        },
        
        /* ===============================================================================================================
           OBJECT queue - a basic queueing system, used to hold actions from the other player until later
           =============================================================================================================== */
        queue  : {
                /* this queue object works as a very basic system for storing functions and arguments to call in order, on
                   command. one example where this is used, is to keep hold of moves the other player has chosen, and waiting
                   for the animation for each move to complete, before starting the next one
                */
                tasks : [],  //queued actions yet to be processed
                
                /* > addTask : add a function and some arguments to the queue for later
                   =======================================================================================================
                   params * f_function  : a function to call when the queue task is started with `startNextTask` below
                            a_arguments : argument, or arguments (as array) to pass when calling
                   ======================================================================================================= */
                addTask : function (f_function, a_arguments) {
                        this.tasks.push ({
                                call : f_function,
                                args : a_arguments
                        });
                },
                
                /* > startNextTask : process the next task on the queue
                   ======================================================================================================= */
                startNextTask : function () {
                        //if there's 1 or more tasks queued, process the first one
                        if (this.tasks.length) {
                                //call the function in the task, with the arguments provided
                                this.tasks.first ().call (this.tasks.first().args);
                        }
                },
                
                /* > declareTaskFinished : declare a task done, and proceed to the next
                   ======================================================================================================= */
                declareTaskFinished : function () {
                        //the reason you must declare the tasks complete manually is because though the queued function may
                        //complete straight away, it may start animations which will continue on their own, and you do not
                        //want to process the next queued task until the game is ready
                        this.tasks.shift ();    //remove the task from the queue
                        this.startNextTask ();  //and action the next
                }
        }, //end shared.queue <
        
        /* > showPage : display a particular page in a game (like the title screen, gameplay screen &c)
           ===============================================================================================================
           params * s_page : page name to show (as from `game.pages` array, see js files for relevant game for details)
           =============================================================================================================== */
        showPage : function (s_page) {
                //a 'page' is a screen in the game that the player sees. most games will have a title screen, the main
                //gameplay screen, and maybe rules / about screens. each of these is an HTML <div> with the id "page-????"
                //(where ???? is the page's name). in addition to this, the JS for the game, has an array `game.pages`
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
                        function(o_response){  //when the game starts, but the other player has not yet joined
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
                                }
                        }.bind(this),
                        this.events.gameBegins  //function to call when the other player joins the game
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
           params * (s_html) : HTML to display, send nothing to hide the display
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
           OBJECT headsup - the heads-up status display in the centre of the game
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
                        /*!/var queue = Effect.Queues.get ('headsup');
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
                                //wait for the specified timeout and hide, mark this wait with a low FPS so that it can be
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
           params * (s_html) : some HTML to display in the system overlay, leave out to hide the system status box
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
                                        //before starting the animation, change the HTML
                                        if (s_html) {$("system-status-text").update (s_html); e.show ();}
                                },
                                afterFinish : function(){
                                        //hide and blank
                                        if (!s_html) {e.hide (); $("system-status-text").update ();}
                                }
                        });
                }
        },
        
        /* > setTitle : change the window title
           ===============================================================================================================
           params * s_title : the text to display in the title. the game's name is automatically appended
           =============================================================================================================== */
        setTitle : function (s_title) {
                document.title = (game.name) ? s_title + game.name : game.name;
        },
        
        /* > end : game over - you can use this function, or roll your own game over screen
           ===============================================================================================================
           params * b_winner : if you are the winner or not
           =============================================================================================================== */
        end : function (b_winner) {
                //TODO: this should be templated and presented better
                var html   = '<a href="javascript:game.playAgain('+b_winner+');">Play Again?</a> ' +
                             '<a href="javascript:game.resign();">Resign</a>',
                    winner = b_winner ? playerMe : playerThem,
                    loser  = b_winner ? playerThem : playerMe
                ;
                
                //increase the number of games played
                shared.played ++;
                shared.setTitle ((b_winner?"YOU WIN":"YOU LOSE ")+" - ");
                shared.headsup.show ((b_winner?"YOU WIN":"YOU LOSE")+"<br />"+html);
                
                //update the player info display
                winner.wins ++;
                $("player-status-me-wins").update (playerMe.wins);
                $("player-status-them-wins").update (playerThem.wins);
                
                //listen out for the "play again" signal from the other person
                jax.listenFor ("game_again", function(o_response){
                        game.start (!b_winner);
                });
        }
};


/* =======================================================================================================================
   OBJECT shared.events - storage for element events (so that one function pointer can be used for multiple element events)
   ======================================================================================================================= */
shared.events = {
        /* > gameBegins : the moment when actual gameplay begins (this is an AJAX event)
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
                        //TODO: move this to Effect.Morph?
                        new Effect.Parallel ([
                                new Effect.SlideDown ("player-status-them", {sync: true}),
                                new Effect.Move      ("player-status-me",   {
                                        x           : 0,
                                        y           : -21,
                                        mode        : 'relative',
                                        sync        : true,
                                        beforeStart : function(o_effect){
                                                o_effect.element.style.top = "384px";
                                                o_effect.element.show ();
                                        }
                                })
                        ], {
                                duration    : 0.5,
                                afterFinish : function () {
                                        //start the game
                                        game.start ();
                                }
                        });
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

//=== end of line ===========================================================================================================
//'js/boot.js' « previous                                                                                next » 'js/_chat.js'