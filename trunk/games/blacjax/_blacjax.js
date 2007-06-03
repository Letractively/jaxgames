/* =======================================================================================================================
   games/blacjax/_blacjax.js - the logic for this game
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax, jax games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   name   : blacjax
   author : Kroc Camen | kroccamen@gmail.com | kroc.deviantart.com
   type   : card game
   desc   : an implementation of BlackJack, popular in Europe & the UK, known as 'Crazy 8's' in America
            this version uses a ruleset common in the UK, with slight moderations to best suit online play

rules of play:
--------------
 + each player starts with 7 cards, and wins by discarding all their cards
 + there is a deck that cards are drawn from, and discard pile that is face up.
 + players take turns to discard a card of theirs, by matching suit or rank with the last card put down face up
 + if you have no cards that can be discarded, you must pickup a card from the deck, and give up your turn
 + certain cards have special powers
   - an Ace allows you to place another card, as long as it is of the same suit/rank as the Ace
   - an 8 allows you to 'change suit', you can place an 8 on to any card, then place another card that matches the new suit
   - you can put down a Joker without having to match the face up card, and then you can put anything on top of it
   - a 2 sets up a penalty of 2 cards. a Black Jack is a penalty of 5 cards
     > your opponent can respond by placing down another 2/Black Jack, which adds to the penalty and turns it against you
       (players can continue to reply with 2s and Black Jacks as long as they have them in their hands)
     > a Red Jack can be used to cancel out the penalty against you
     > if you cannot put down a 2, Black Jack, or Red Jack then you must take the number of penalty cards from the deck
     > after a penalty is taken, that player may then place cards
-------------------------------------------------------------------------------------------------------------------------- */

//create the players (see classes.js)
var playerMe   = new Player ("game-nearhand", true),  //the player on this computer
    playerThem = new Player ("game-farhand", false)   //the opponent is always the opposite player from either end
;

/* =======================================================================================================================
   OBJECT game : this game's core routines
   ======================================================================================================================= */
var game = {
        name    : "Blacjax",
        version : "0.5.0", 
        
        pack    : new Pack (true),  //the pack of cards that decks are made from (include Jokers)
        deck    : new Deck (),      //create a deck of cards
        
        /* ===============================================================================================================
           OBJECT pages - show/hide actions for the screens in the game (title screen, game screen, rules screen &c)
           =============================================================================================================== */
        pages : [
             {name : "title"},
             {name : "game"}
        ],
        
        /* > load : called for you on page load (see shared.js)
           =============================================================================================================== */
        load : function () {
        },
        
        /* ===============================================================================================================
           OBJECT queue - when you receive ajax calls for cards the opponent clicked on, queue them for processing
           =============================================================================================================== */
        queue  : {
                cards : [],  //cards yet to be processed
                
                /* > doNext : process the next card (on the queue) that the opponent clicked
                   ======================================================================================================= */
                doNext : function () {
                        //if there's 1 or more cards queued, process the first one
                        if (this.cards.length) {
                                this.opponentCardClick (this.cards.first());
                        }
                },
                
                /* > opponentCardClick : move the card onto the run
                   =======================================================================================================
                   params * s_card : name of the card to remove from the opponents hand and place on the run
                   ======================================================================================================= */
                opponentCardClick : function (s_card) {
                        //get the card currently on the run that you're about to place a card over. this is needed to
                        //compare the suit of the new card with the previous, in the case that an Eight is placed on a card
                        //that is already the same suit, and thus, no heads-up message needs to be displayed
                        var face      = game.run.getFaceCard(),
                            _continue = function () {
                                    //preempt the next move
                                    game.preempt (true);
                            }
                        ;
                        
                        //pluck the card from their hand, and move it onto the run
                        playerThem.hand.useCard (s_card, function(s_card){
                                //decide course of action:
                                //if the card played was a Two or Black Jack...
                                if (game.pack.isArmed(s_card)) {
                                        //Two is pickup two, Black Jack is pickup five
                                        var penalty = (game.pack.value(s_card) == 2 ? 2 : 5);
                                        //add the penalty to the penalty total
                                        game.run.updatePenalty (game.run.penalty+penalty);
                                        //display the heads-up
                                        shared.headsup.show ("Pickup "+game.run.penalty+"!", 0.5, _continue);
                                        
                                } else if (game.pack.isCombo (s_card)) {
                                        //the player put down an Ace (another go), Eight (change suit) or Joker (any card)
                                        var msg = "";
                                        switch (game.pack.value (s_card)) {
                                                case 0: msg = "Any Card&hellip;";   break;  //Joker (any card)
                                                case 1: msg = "Another Go&hellip;"; break;  //Ace (another go)
                                                case 8:
                                                        //Eight. don't announce "change suit" if suit didn't change
                                                        msg = (game.pack.suit (face) != game.pack.suit (s_card))
                                                            ? "Change Suit&hellip;" : "Another Go"
                                                        ; 
                                                        break;
                                        }
                                        //display the message
                                        shared.headsup.show (msg, 0.5, function(){
                                                //take no action, the player gets to choose another card (if they have any)
                                                game.preempt (false);
                                        });
                                        
                                } else {
                                        //if the player put down a Red Jack, check if it is cancelling a penalty...
                                        if (game.run.penalty && game.pack.value(s_card) == 11 &&
                                            game.pack.colour(s_card) == "red"
                                        ) {
                                                //...cancel the penalty
                                                game.run.updatePenalty (0);
                                                //display the heads up!
                                                //FIXME: there is a bug that starts here; if you finish a game by cancelling
                                                //       a penalty, then this heads up will conflict with the "WIN/LOSE"
                                                //       message. fix seems to lie with accurately managing headsup
                                                shared.headsup.show ("Penalty Cancelled!", 0.5, _continue);
                                        }
                                        //file the cards onto the discard pile
                                        game.run.fileCards (_continue);
                                }
                        });
                }
        }, //end game.queue <
        
        /* > start : begin playing
           ===============================================================================================================
           params * (b_mefirst) : who begins play (yourself, or the opponent)
                    (n_cards)   : number of cards to draw for each player (default 7)
           =============================================================================================================== */
        start : function (b_mefirst, n_cards) {
                //please note: this function is called for you. when the user clicks the Start Game or Join Game button after
                //entering their name / join key, `shared.(start/join)Connection` is called. when a connection is established
                //between the two players, `game.start` is called for you
                if (typeof b_mefirst == "undefined") {b_mefirst = shared.host;}  //default: host goes first
                if (!n_cards)                        {n_cards   = 7;}            //default: 7 cards each
                
                shared.setTitle (playerMe.name+" v. "+playerThem.name+" - ");
                shared.setPlayerStatus ();
                shared.headsup.hide ();
                
                //clear any cards on the table
                [this.run, playerMe.hand, playerThem.hand].invoke ("clear");
                
                //if you're going first..
                if (b_mefirst) {
                        //prepare a new deck. the person who is going first, shuffles a deck of cards and sends the order to
                        //the other player so that both players are playing off of the same order of cards
                        this.deck.cards.clear ();
                        //note: if you want to setup a fake deck of cards for forcing order of play, do it here
                        //      the order is: face, them:1-7, you: 1-7, rest of deck - reversed
                        //?/n_cards = 1;
                        //?/this.deck.cards = ["AC", "JH", "JC", "3S", "4S", "3D", "4D", "8H", "5H", "6H", "5S", "6S", "5D", "6D", "8C"].reverse ();
                        this.deck.addPack (
                                this.pack,  //which pack to use in the deck
                                1,          //add one pack to the deck
                                true        //shuffle the deck each time a pack is added
                        );
                        //send the deck to the other player...
                        jax.sendToQueue ("game_start", {deck: game.deck.cards, cards: n_cards}, startComplete);
                } else {
                        //wait to receive the deck to play with...
                        jax.listenFor ("game_start", startComplete);
                }
                
                /* PRIVATE > startComplete : called when the deck is synced between the two players and gameplay can begin
                   ======================================================================================================= */
                function startComplete (o_response) {
                        //receieve the deck, and use it (if the other person is going first and picked the deck for you)
                        if (!b_mefirst) {game.deck.cards = o_response.data.deck;}
                        //number of cards each player starts with
                        var cards = (!b_mefirst) ? o_response.data.cards : n_cards;
                        
                        shared.setSystemStatus ();  //hide any status messages being displayed
                        shared.chat.show ();        //show the chat box
                        
                        //draw the face card to start with
                        game.run.discard = game.deck.drawCard ();
                        game.run.displayDiscard ();
                        
                        //set the player's hands
                        //the host takes their cards first, then the opponents. the opponent does the opposite
                        (b_mefirst?playerThem:playerMe).hand.takeCard (cards, function(){
                                (b_mefirst?playerMe:playerThem).hand.takeCard (cards, function(){
                                        //preempt to avoid drawing all unplayable cards. the host will check their own cards
                                        //and draw if none are playable, and the opponent will check the host's card to see
                                        //if they would have to draw, and thus switch turns
                                        game.preempt (b_mefirst);
                                });
                        });
                }
        },
        
        /* > playTurn : take your turn
           =============================================================================================================== */
        playTurn : function () {
                //set the chrome title
                shared.setTitle ("Your turn! - " + playerMe.name + " v. " + playerThem.name + " - ");
                //clear the "other player's turn" message on screen if its there
                shared.setPlayerStatus ();
                
                //disable cards that cannot be played
                var playable_cards = playerMe.hand.playableCards ();
                playerMe.hand.cards.each (function(s_card,n_index){
                        var enabled = (playable_cards.indexOf (n_index) >= 0),  //is this card enabled?
                            e       = $(playerMe.hand.element+'-'+s_card)       //quick reference to save Prototype calls
                        ;
                        //if this card cannot be played...
                        if (!enabled) {
                                //if the card is disabled, fade it out a little and drop it down
                                new Effect.Parallel ([
                                        new Effect.Opacity (e, {sync:true, from:1.0, to:0.9}),
                                        new Effect.Move    (e, {sync:true, x:0, y:15})
                                ], {duration: 0.5});
                                //use a no-sign(/) cursor (IE6, Firefox 1.5+)
                                e.addClassName ("card-disabled");
                                
                        } else {
                                e.addClassName ("card-playable");
                                e.onmouseover = game.events.cardMouseOver;  //for enabled cards, set the interactivity
                                e.onmouseout  = game.events.cardMouseOut;   //on mouse out, go back down to normal
                                e.onclick     = game.events.cardClick;      //when you click the card you want to play
                        }
                });
        },
        
        /* > preempt : switch players, but preempt certain actions (penalty / pickup cards)
           ===============================================================================================================
           params * b_self : if you or them should be checked
           =============================================================================================================== */
        preempt : function (b_self) {
                //this function is a 'switch box'. it is small and simple, but can confuse the hell out of you
                
                /* the game originally sent a signal to the other player at the end of each turn. whilst very simple to do,
                   it was very slow. the opponent would have to wait for your animation to finish before switching players.
                   secondly, if you could not place a card and had to draw one instead, the opponent would have to wait until
                   you had drawn the card before they could be known aware of it. in the situation where neither player
                   could draw a card several times in a row, there would be a massive wait as the game switched from player
                   to player only after each card was drawn
                *//*
                   to speed the gameplay up a lot, a signal is sent to the opponent as soon as you click on a card. each 
                   player's computer will then run this function to determine the outcome of the chosen card - being:
                   + 1.  you / they placed a combo card (Eight, Ace or Joker), and will go again
                   + 2a. you / they have no playable cards, draw a card
                   + 2b. there is a penalty, you / they have no playable cards, take the penalty
                   + 3.  you / they played a valid card, now other person's go
                *//*
                   in the case of 2a, or 2b, the function will call itself again, but assessing the opposite player. this 
                   means that when neither player has a playable card, several times in a row, cards are automatically drawn
                   without having to wait for the opposite player's computer to tell you so
                *//*
                   there are some complex rules about the last card put down (to win the game)
                   
                   + if you put down a Black Jack or a Two as your last card, play switches to the opponent,
                     > if they put down a Red Jack, the penalty is cancelled
                       + if that was their last card, they win, otherwise you win
                     > if they put down a Black Jack or Two you must take the penalty and continue playing
                       + if that was their last card, they win
                     > if they have no Red/Black Jack or Two then they take the penalty and you still win
                   + if you put down a Joker, Ace or Eight as your last card you must take another card (as these
                     cards must always be followed up by placing another card, or taking when no cards are playable)
                *///---------------------------------------------------------------------------------------------------------
                
                var player    = (b_self) ? playerMe : playerThem,   //the primary person being referred to
                    cards     = player.hand.playableCards (),       //which cards in the hand are playable
                    armed_run = this.run.armed (),                  //if the run is topped by a Black Jack or Two
                    count     = (armed_run ? this.run.penalty : 1)  //if there's a penalty, take that many cards
                ;
                
                //an Eight, Ace or Joker was put down, it is a combo card, have another go:
                if (b_self && this.run.combo ()) {  //-----------------------------------------------------------------------
                        //if no playable cards to do so (e.g. put down an Ace of Spades, but have no more Spades)...
                        if (!cards.length) {
                                //take a card from the deck, file the cards from the run onto the discard pile
                                player.hand.takeCard (count, function(){ game.run.fileCards (function(){
                                        //it'll be the other player's go - check if they have any playable cards
                                        game.preempt (!b_self);
                                }); });
                        } else {
                                //else, there is a playable card, have your go
                                game.playTurn ();
                        }
                                
                } else if (!this.run.combo () && !armed_run &&
                           (!playerMe.hand.cards.length || !playerThem.hand.cards.length)
                ) {  //------------------------------------------------------------------------------------------------------
                        //either person has no cards left, and there is no continuation (armed / combo cards),
                        //the other player has won in this situation
                        game.end (!b_self);
                        
                } else if (!cards.length) {  //------------------------------------------------------------------------------
                        //the player has no playable cards to use, preempt them taking the penalty / picking up a card, to
                        //save having to wait for a message to confirm the obvious from the opponent
                        
                        //a private function so that the same code can be run now, or after the heads-up timeout
                        var _drawCard = function () {
                                player.hand.takeCard (count, function(){ game.run.fileCards (function(){
                                        if (armed_run) {
                                                if (b_self) {
                                                        if (!playerThem.hand.cards.length) {game.end (false); return false;}
                                                }
                                                //if you took the penalty, it's your go (preempt for the rare occurance of
                                                //picking up cards, yet not having any playable ones afterwards)
                                                game.preempt (b_self);
                                        } else {
                                                //when someone takes a card, check if the other player can play too
                                                game.preempt (!b_self);
                                        }
                                }); });
                        }; //end _drawCard <
                        
                        if (!b_self && !armed_run) {
                                //display a heads-up message when the opponent has no playable cards, and the run is not
                                //armed (they are not drawing a penalty, but a single card instead)
                                shared.headsup.show ("No playable cards", 0.5, _drawCard);
                        } else {
                                //otherwise just take a card
                                _drawCard ();
                        }
                        
                } else {  //-------------------------------------------------------------------------------------------------
                        //there is a playable card; if this is you - it's your go, if not it's their go...
                        if (b_self) {
                                game.playTurn ();
                        } else {
                                //change your display to say it's their turn
                                shared.setPlayerStatus ("<p>Other Player's Turn, Please Wait&hellip;</p>");
                                //set the chrome title
                                shared.setTitle ("Their turn - "+playerMe.name+" v. "+playerThem.name+" - ");
                                
                                //in the case that the opponent put down an Eight, Ace or Joker, you'll arrive here. they
                                //will have placed another card, which will have been added to the queue. now that the
                                //animation moving the previous card is over, the next card can be plucked. this is done so
                                //that we do not try to move two cards onto the run at the same time (it breaks)
                                game.queue.cards.shift ();  //remove the previous card from the queue
                                game.queue.doNext ();       //pluck the next card (if there is one)
                        }
                }
        },
        
        /* > endGame : play is complete, someone won or lost
           ===============================================================================================================
           params * b_winner : if you are the winner or not
           =============================================================================================================== */
        end : function (b_winner) {
                var html   = '<a href="javascript:game.playAgain('+b_winner+');">Play Again?</a> ' +
                             '<a href="javascript:game.resign();">Resign</a>',
                    winner = b_winner ? playerMe : playerThem,
                    loser  = b_winner ? playerThem : playerMe,
                    onDrop = function () {
                            //add a point for each card left in the opponent's hand
                            winner.points ++;
                            $("player-status-"+(b_winner?"me":"them")+"-points").update (winner.points);
                    } 
                ;
                //drop out each card in the opponent's hand
                if (loser.hand.cards.length) {
                        loser.hand.cards.each (function(s_card,n_index){
                                //animate the card dropping
                                new Effect.DropOut (loser.hand.element+'-'+s_card, {
                                        delay       : (n_index/6),  //stagger the dropping
                                        afterFinish : onDrop
                                });
                        });
                }
                
                //increase the number of games played
                shared.played ++;
                shared.setTitle ((b_winner?"YOU WIN":"YOU LOSE ")+" - ");
                shared.headsup.show ((b_winner?"YOU WIN":"YOU LOSE")+"<br />"+html);
                //update the player info display
                winner.wins ++;
                $("player-status-me-wins").innerHTML   = playerMe.wins;
                $("player-status-them-wins").innerHTML = playerThem.wins;
                
                //listen out for the "play again" signal from the other person
                jax.listenFor ("game_again", function(o_response){
                        game.start (!b_winner);
                });
                
        },
        
        playAgain : function (b_winner) {
                //stop listening for the play again signal from the other player
                jax.listenFor ("game_again");
                //if you won, the loser starts, display a message whilst you wait for them to start
                if (b_winner) {
                        shared.setSystemStatus ("Waiting for the other player to start, Please Wait...");
                }
                //notify the opponent that the game is starting again
                jax.sendToQueue ("game_again", {winner: b_winner});
                //start the game for yourself (loser goes first)
                game.start (!b_winner);
        },
        
        resign : function () {
                jax.disconnect ({reason: "unload"});
                shared.setPlayerStatus ();
                shared.headsup.hide ();
                shared.setSystemStatus ('You have resigned.<br /><a href="javascript:location.reload ();">Play Again</a>');
        }
};

/* =======================================================================================================================
   OBJECT game.events : event functions, so that multiple elements may use a single pointer
   ======================================================================================================================= */
game.events = {
        /* > cardMouseOver : when the player moves the mouse on a card (in their hand)
           =============================================================================================================== */
        cardMouseOver : function () {
                //on mouse over, nudge the card up a little by using a CSS class
                this.addClassName ("card-hover");
                
                //the card's name is stored in the img tag's alt property
                var card = this.id.split ("-").last (),
                    msg  = ""
                ;
                //find action cards (Joker, Ace, Two, Eight, Black/Red Jack) and label them on mouseover
                switch (game.pack.value (card)) {
                        case 0:  msg = "Any Card";    break;  //a Joker goes on any card, followed by any card
                        case 1:  msg = "Another Go";  break;  //an Ace allows another card matched by suit/rank
                        case 2:  msg = "Pickup 2";    break;  //Two is pickup two
                        case 8:
                                //Eight goes on any card, followed by suit/rank match
                                msg = (game.pack.suit (game.run.getFaceCard()) != game.pack.suit (card)) ? "Change Suit" : "Another Go";
                                break;
                        case 11:
                                //a Black Jack is pickup 5, a Red Jack is cancel pickup
                                msg = (game.pack.colour (card) == "black")
                                    ? "Pickup 5" : (game.run.armed () ? "Cancel Penalty" : "")
                                ;
                                break;
                }
                //if any of the above matched
                if (msg != "") {
                        //put the text in the label
                        $("game-label").update (msg).setStyle ({left: Element.getStyle(this,'left')}).show ();
                }
        },
        
        /* > cardMouseOut : when the player moves the mouse off of a card (in their hand)
           =============================================================================================================== */
        cardMouseOut : function () {
                //remove the CSS class to move it back to normal position
                this.removeClassName ("card-hover");
                //hide the label (for action cards)
                $("game-label").hide ();
        },
        
        /* > cardClick : when the player clicks on a card
           =============================================================================================================== */
        cardClick : function () {
                //hide the label
                $("game-label").hide ();
                
                //which card was clicked?
                var card_name      = this.id.split ("-").last ();
                    playable_cards = playerMe.hand.playableCards ()
                ;
                
                //alert the other player to the card you chose. this is the most important, and most confusing aspect of this
                //game. see the "game card chosen" listen function underneath the game object for where the other player
                //picks up this signal
                jax.sendToQueue ("game_card_chosen", {card: card_name});
                
                //first, move all the cards in the hand back to normal places
                playerMe.hand.cards.each (function(s_card,n_index){
                        //construct the html id of the card in question
                        var e = $(playerMe.hand.element+'-'+s_card);
                        //remove click event from card to prevent player running this code twice!
                        e.onclick = Prototype.emptyFunction;
                        
                        //if the card is disabled...
                        if (playable_cards.indexOf (n_index) < 0) {
                                //make opaque and move back to normal position
                                new Effect.Parallel ([
                                        new Effect.Opacity (e, {sync:true, from:0.9, to:1.0}),
                                        new Effect.Move    (e, {sync:true, x:0, y:-15})
                                ], {
                                        transition:Effect.Transitions.linear}
                                );
                                e.removeClassName ("card-disabled");
                        } else {
                                //enabled cards, remove the interactivity
                                e.onmouseover = Prototype.emptyFunction;
                                e.onmouseout  = Prototype.emptyFunction;
                                e.removeClassName ("card-playable").removeClassName ("card-hover");
                        }
                });
                //take the chosen card out of the hand, and move it onto the run
                playerMe.hand.useCard (card_name, function(s_card){
                        //decide course of action:
                        //a: if armed, switch players
                        //b: if a combo, let the player continue
                        //c: if only a plain card, file the run onto the discard, and change players
                        if (game.pack.isArmed (s_card)) {
                                //add the penalty to the total and switch players
                                game.run.updatePenalty (
                                        game.run.penalty + (game.pack.value (s_card) == 2 ? 2 : 5)
                                );
                                game.preempt (false);
                                
                        } else if (game.pack.isCombo (s_card)) {
                                //let the player choose another card
                                game.preempt (true);
                                
                        } else {
                                //was this a Red Jack cancelling the penalty?
                                if (game.run.penalty && game.pack.value (s_card) == 11 &&
                                    game.pack.colour (s_card) == "red"
                                ) {
                                        //cancel the penalty
                                        game.run.updatePenalty (0);
                                }
                                //file the cards onto the discard pile
                                game.run.fileCards (function(){
                                        //once filed, switch players
                                        game.preempt (false);
                                });
                        }
                });
        }
};

/* =======================================================================================================================
   < game_card_chosen : the other player clicked on a card, mirror the animation locally
   ======================================================================================================================= */
jax.listenFor ("game_card_chosen", function(o_response){
        //queue it
        game.queue.cards.push (o_response.data.card);
        
        //if there's only one item in the queue, run it
        //after each card has completed its action, the next one will be taken (see game.preempt)
        if (game.queue.cards.length == 1) {game.queue.doNext ();}
});

//=== end of line ===========================================================================================================