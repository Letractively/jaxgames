/* =======================================================================================================================
   games/blacjax/_blacjax.js - the logic for this game
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   + js/CONFIG.js
   + js/boot.js [ + jax/jax.js + js/_shared.js + js/_chat.js + js/_global.js ]
   + games/blacjax/game.js [
     + games/-/_js/_cards.js
     + games/blacjax/_classes.js
     » games/blacjax/_blacjax.js
     - games/blacjax/_events.js
     - games/blacjax/_run.js
   ]
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
        
        /* > load : called for you on page load (see '_shared.js')
           =============================================================================================================== */
        load : function () {
        },
        
        /* > start : begin playing
           ===============================================================================================================
           params * (b_mefirst) : who begins play (yourself, or the opponent)
                    (n_cards)   : number of cards to draw for each player (default 7)
           =============================================================================================================== */
        start : function (b_mefirst, n_cards) {
                //please note: this function is called for you. when the user clicks the "Start Game" or "Join Game" button
                //after entering their name & join key, `shared.(start/join)Connection` is called. when a connection is
                //established between the two players, `game.start` is called for you
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
                                //use a no-sign "(/)" cursor (IE6+, Firefox 1.5+)
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
                                
                } //---------------------------------------------------------------------------------------------------------
                  else if (!this.run.combo () && !armed_run &&
                           (!playerMe.hand.cards.length || !playerThem.hand.cards.length)
                ) {  
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
                                shared.queue.declareTaskFinished ();
                        }
                }
        },
        
        /* > endGame : play is complete, someone won or lost
           ===============================================================================================================
           params * b_winner : if you are the winner or not
           =============================================================================================================== */
        end : function (b_winner) {
                var winner = b_winner ? playerMe : playerThem,
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
                
                shared.end (b_winner);
        }
};


/* =======================================================================================================================
   < game_card_chosen : the other player clicked on a card, mirror the animation locally
   ======================================================================================================================= */
jax.listenFor ("game_card_chosen", function(o_response){
        //queue it - call this function, with this argument
        shared.queue.addTask (game.events.opponentCardClick, o_response.data.card);
        
        //if there's only one task in the queue, run it
        //after each card has completed its action, the next one will be taken (see `game.preempt`)
        if (shared.queue.tasks.length == 1) {shared.queue.startNextTask ();}
});

//=== end of line ===========================================================================================================