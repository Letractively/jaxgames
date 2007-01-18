/* =======================================================================================================================
   games/blacjax/game.js - the logic for this game
   ======================================================================================================================= */
/* name   : blacjax
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
       (players can continue to reply with 2's and Black Jacks as long as they have them in their hands)
     > a Red Jack can be used to cancel out the penalty against you
     > if you cannot put down a 2, Black Jack, or Red Jack then you must take the number of penalty cards from the deck
     > after a penalty is taken, the player may then place cards

TODO:
 + allow chaining of pairs
 + tactical draws
-------------------------------------------------------------------------------------------------------------------------- */

//create the players (see classes.js)
var playerMe   = new Player ("game-nearhand", true),  //the player on this computer
    playerThem = new Player ("game-farhand", false)   //the opponent is always the opposite player from either end
;

/* =======================================================================================================================
   OBJECT game : this game, extends the object in gloabl.js which provides shared functions between all the games
   ======================================================================================================================= */
var game = {
        name    : "Blacjax",
        version : "0.5.0", 
        
        pack    : new Pack (true),  //the pack of cards that decks are made from (include Jokers)
        deck    : new Deck (),      //create a deck of cards
        
        /* > load : called for you on page load (see element)
           =============================================================================================================== */
        load : function () {
                //write out all the cards to the page to load the images ready for when they need to appear. this reduces
                //flicker as the card images are cached and do not have to load on each new appearance
                game.pack.cache ();
        },
        
        /* OBJECT > queue : when you receive ajax calls for cards the opponent clicked on, queue them for processing
           =============================================================================================================== */
        queue  : {
                cards : [],  //cards yet to be processed
                
                /* > doNext : process the next card (on the queue) that the opponent clicked
                   ======================================================================================================= */
                doNext : function () {
                        //if there's 1 or more cards queued, process the first one
                        if (this.cards.length) {this.opponentCardClick (this.cards.first());}
                },
                
                /* > opponentCardClick : move the card onto the run
                   ======================================================================================================= */
                opponentCardClick : function (s_card) {
                        //pluck the card from their hand, and move it onto the run
                        playerThem.hand.useCard (s_card, function(s_card){
                                //decide course of action:
                                //if the card played was a Two or Black Jack, the opponent will have to attack or defend
                                if (game.pack.isArmed(s_card)) {
                                        //add the penalty to the total. a Two is pickup 2, and a Black Jack is pickup 5
                                        game.run.updatePenalty (game.run.penalty + (game.pack.value(s_card) == 2 ? 2 : 5));
                                        game.preempt (true);

                                } else if (game.pack.isCombo (s_card)) {
                                        //no action, the other player gets to choose another card
                                        game.preempt (false);

                                } else {
                                        //if the player put down a Red Jack...
                                        if (game.run.penalty && game.pack.value(s_card) == 11 &&
                                            game.pack.colour(s_card) == "red")
                                        {
                                                //...cancel the penalty
                                                game.run.updatePenalty (0);
                                        }
                                        //file the cards onto the discard pile
                                        game.run.fileCards (function(){
                                                //play your turn
                                                game.preempt (true);
                                        });
                                }
                        });
                }
        }, //end game.queue <
                
        /* > start : begin playing
           ===============================================================================================================
           params * b_mefirst : who begins play (yourself, or the opponent)
                    n_cards   : number of cards to draw for each player (default 7)
           =============================================================================================================== */
        start : function (b_mefirst, n_cards) {
                //please note: this function is called for you. when the user clicks the Start Game or Join Game button after
                //entering their name / join key, shared.connect is called. when a connection is established between the two
                //players, game.start is called for you
                if (b_mefirst == null) {b_mefirst = shared.host;}  //default: host goes first
                if (!n_cards)          {n_cards   = 7;}            //default: 7 cards each
                
                shared.setTitle (playerMe.name + " v. " + playerThem.name + " - ");
                shared.setPlayerStatus ();
                
                //clear any cards on the table
                [this.run, playerMe.hand, playerThem.hand].invoke ("clear");
                
                //if you're going first..
                if (b_mefirst) {
                        //prepare a new deck. the person who is going first shuffles a deck of cards and sends the order to
                        //the other player so that both players are playing off of the same order of cards
                        this.deck.cards.clear ();
                        //note: if you want to setup a fake deck of cards for forcing order of play, do it here
                        //?/this.deck.cards = ["AS", "4H", "5H", "2S", "3S", "6H", "7H", "3D", "4D", "5D"].reverse ();
                        this.deck.addPack (
                                this.pack,  //which pack to use in the deck
                                1,          //add one pack to the deck
                                true        //shuffle the deck each time a pack is added
                        );
                        //send the deck to use to the other player...
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
                        game.run.face = game.deck.drawCard ();
                        game.run.displayFace ();
                        
                        //set the player's hands
                        //the host takes their cards first, then the opponents. the opponent does the opposite
                        (b_mefirst?playerThem:playerMe).hand.takeCard (cards, function(){
                                (b_mefirst?playerMe:playerThem).hand.takeCard (cards, function(){
                                        //preempt to avoid drawing 7 unplayable cards. the host will check their own cards
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
                //clear the "other player's turn" message on screen if it's there
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
                                        new Effect.Opacity (e, {from:1.0, to:0.9}),
                                        new Effect.MoveBy  (e, 15, 0)
                                ], {duration: 0.5});
                                //use a no-sign(/) cursor (IE6, Firefox 1.5)
                                e.addClassName ("card-disabled");
                                
                        } else {
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
                
                var player   = (b_self) ? playerMe : playerThem,  //the primary person being referred to
                    cards    = player.hand.playableCards (),      //which cards in the hand are playable
                    armedrun = this.run.armed (),                 //if the run is topped by a Black Jack or Two
                    count    = (armedrun ? this.run.penalty : 1)  //if there's a penalty, take that many cards
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
                                
                } else if (!this.run.combo () && !armedrun &&
                           (!playerMe.hand.cards.length || !playerThem.hand.cards.length)
                ) {  //------------------------------------------------------------------------------------------------------
                        //either person has no cards left, and there is no continuation (armed / combo cards),
                        //the other player has won in this situation
                        game.end (!b_self);
                        
                } else if (!cards.length) {  //------------------------------------------------------------------------------
                        //the player has no playable cards to use, preempt them taking the penalty / picking up a card, to
                        //save having to wait for a message to confirm the obvious from the opponent
                        player.hand.takeCard (count, function(){ game.run.fileCards (function(){
                                if (armedrun) {
                                        if (b_self) {
                                                if (!playerThem.hand.cards.length) {game.end (false); return false}
                                        }
                                        //if you took the penalty, it's your go (preempt for the rare occurance of picking
                                        //up cards, yet not having any playable ones afterwards)
                                        game.preempt (b_self);
                                } else {
                                        //when someone takes a card, check if the other player can play too
                                        game.preempt (!b_self);
                                }
                        }); });
                        
                } else {  //-------------------------------------------------------------------------------------------------
                        //there is a playable card; if this is you - it's your go, if not it's their go...
                        if (b_self) {
                                game.playTurn ();
                        } else {
                                //change your display to say it's their turn
                                shared.setPlayerStatus ("<p>Other Player's Turn, Please Wait&hellip;</p>");
                                //set the chrome title
                                shared.setTitle ("Their turn - " + playerMe.name + " v. " + playerThem.name + " - ");
                                
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
                //!/TODO: this
                var html   = '<a href="javascript:game.playAgain('+b_winner+');">Play Again?</a> ' +
                             '<a href="javascript:game.resign();">Resign</a></p>',
                    anims  = [],
                    winner = b_winner ? playerMe : playerThem,
                    loser  = b_winner ? playerThem : playerMe
                ;
                //drop out each card in the opponent's hand
                if (loser.hand.cards.length) {
                        loser.hand.cards.each (function(s_card,n_index){
                                //animate the card dropping
                                new Effect.DropOut (loser.hand.element+'-'+s_card, {
                                        delay       : (n_index/6),  //stagger the dropping
                                        afterFinish : function(){
                                                //add a point for each card left in the opponent's hand
                                                winner.points ++;
                                                $("player-status-"+(b_winner?"me":"them")+"-points").innerHTML = winner.points;
                                        }
                                });
                        });
                }
                
                //increase the number of games played
                shared.played ++;
                shared.setTitle ((b_winner?"YOU WIN":"YOU LOSE") + playerMe.name + " v. " + playerThem.name + " - ");
                shared.setPlayerStatus ("<p>"+(b_winner?"YOU WIN":"YOU LOSE")+"<br />"+html);
                //update the player info display
                winner.wins ++;
                $("player-status-me-wins").innerHTML   = playerMe.wins;
                $("player-status-them-wins").innerHTML = playerThem.wins;
                
                //listen out for the resign signal from the other person
                /*jax.listenFor("jax_disconnect", function(o_response) {
                        //if the opponent resigned
                        if (o_response.data.reason = "resign") {
                                game.setStatus();
                                shared.setSystemStatus(playerThem.name + " resigned");
                                var anims = [];
                                
                                var whodo = (playerMe.hand.cards.length) ? playerMe.hand : playerThem.hand;
                                if (whodo.cards.length) {
                                        whodo.cards.each(function(s_name,n_index){
                                                var elid = whdo.element + '-' + (n_index+1);
                                                anims.push(new Effect.DropOut(elid, {delay: (n_index/8)}));
                                        });
                                        new Effect.Parallel(anims, {queue: 'end'});
                                }
                        }
                });*/
                
                //listen out for the 'play again' signal from the other person
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
                shared.setSystemStatus ();
        }
        
        /* > setStatus : the box in the game for status, like 'other player's turn, please wait'
           ===============================================================================================================
           params * s_html : some html to display in the status box
           =============================================================================================================== */
        /*setStatus : function (s_html) {
                var e = $("game-status");
                if(!s_html) {
                        //if the status message is already visible, fade it out
                        if (e.visible ()) {
                                 new Effect.Opacity (e, {duration:0.3, from:1, to:0, queue:'end', afterFinish:function(){
                                         //hide and blank
                                         e.hide ();
                                         $("game-status-text").innerHTML = "";    
                                 }});
                        }
                } else {
                        //if the status message is hidden, fade it in
                        if (!e.visible ()) {
                                new Effect.Opacity (e, {duration:0.3, from:0, to:1, queue:'end', beforeStart:function(){
                                        //before starting the animation, change the html
                                        $("game-status-text").innerHTML = s_html;
                                        e.show ();
                                }});
                        } else {
                                $("game-status-text").innerHTML = s_html;
                                e.show ();
                        }
                } 
        }*/
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
                var card = this.alt,
                    msg  = ""
                ;
                //find action cards (Joker, Ace, Two, Eight, Black/Red Jack) and label them on mouseover
                switch (game.pack.value (card)) {
                        case 0:  msg = "Any Card";    break;  //a Joker goes on any card, followed by any card
                        case 1:  msg = "Another Go";  break;  //an Ace allows another card matched by suit/rank
                        case 2:  msg = "Pickup 2";    break;  //Two is pickup two
                        case 8:  msg = "Change Suit"; break;  //Eight goes on any card, followed by suit/rank match
                        case 11:
                                //a Black Jack is pickup 5, a Red Jack is cancel pickup
                                msg = (game.pack.colour (card) == "black")
                                    ? "Pickup 5" : (game.run.armed () ? "Cancel Pickup" : "")
                                ;
                                break;
                }
                //if any of the above matched
                if (msg) {
                        //put the text in the label
                        $("game-label").innerHTML = msg;
                        //move the label over the card in question
                        Element.setStyle ("game-label", {left: Element.getStyle(this,'left')});
                        //and make it visible
                        $("game-label").show ();
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
                var cardname       = this.alt;
                    playable_cards = playerMe.hand.playableCards ()
                ;
                
                //alert the other player to the card you chose
                jax.sendToQueue ("game_card_chosen", {card: cardname});
                
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
                                        new Effect.Opacity (e, {from:0.9, to:1.0}),
                                        new Effect.MoveBy  (e, -15, 0)
                                ]);
                                e.removeClassName ("card-disabled");
                        } else {
                                //enabled cards, remove the interactivity
                                e.onmouseover = Prototype.emptyFunction;
                                e.onmouseout  = Prototype.emptyFunction;
                                e.removeClassName ("card-hover");
                        }
                });
                //take the chosen card out of the hand, and move it onto the run
                playerMe.hand.useCard (cardname, function(s_card){
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
                                    game.pack.colour (s_card) == "red")
                                {
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

/* =======================================================================================================================
   OBJECT game.run - the run of cards in the centre
   ======================================================================================================================= */
game.run = {
        cards   : [],  //the cards currently in the run
        face    : "",  //the top card on the discard pile (the face) to match against
        penalty : 0,   //current card penalty in play
        
        //the spacing in pixels between each card on the run, given the number of cards present. these numbers allow for the
        //cards on the run to get compact together to always stay within the run's area. this could be calculated as needed
        //in .getCardPositions, but I couldn't get the math right
        spacing : [
                0, 5, 5, 5, 5,  //0, no spacing. 1-4 cards, normal spacing between cards
                -2.8,    /* 5  cards */  -16.3,  /* 6  cards */  -25.5,  /* 7  cards */  -32,    /* 8 cards */
                -36.9,   /* 9  cards */  -40.7,  /* 10 cards */  -43.7,  /* 11 cards */  -46.2,  /* 12 cards */
                -48.25,  /* 13 cards */  -50,    /* 14 cards */  -51.5   /* 15 cards */
        ],
        
        /* > armed : if the card on top of the run is a Two or a Black Jack
           =============================================================================================================== */
        armed : function () {
                return (this.cards.length) && (
                        game.pack.value (this.cards.last()) == 11 ||
                        game.pack.value (this.cards.last()) == 2
                );
        },
        
        /* > combo : if the card on top of the run is a combo card (Ace, Eight or Joker)
           =============================================================================================================== */
        combo : function () {
                return (this.cards.length) && game.pack.isCombo (this.cards.last());
        },
        
        /* > clear : clear everything in the run and set it back to default
           =============================================================================================================== */
        clear : function () {
                //remove any existing cards in the html
                this.cards.each (function(s_card,n_index){
                        $("game-run-"+s_card).remove ();
                });
                //clear the cards in memory
                this.cards.clear ();
                //clear the face
                this.face = "";
                this.displayFace ();
                //clear the penalty
                this.updatePenalty (0);
        },
        
        /* > updatePenalty : change the penalty value (and automatically display / hide it accordingly)
           =============================================================================================================== */
        updatePenalty : function (n_value) {
                //if setting to directly to 0 (i.e. cancelling a penalty with a Red Jack) then animate it dropping
                if (!n_value && this.penalty) {
                        new Effect.DropOut ("game-penalty", {afterFinish:function(){
                                $("game-penalty").innerHTML = "";
                        }});
                        
                } else {
                        //update the penalty
                        if (!n_value) {
                                //if 0, hide the penalty, don't need to display "0"
                                $("game-penalty").hide ();
                        } else {
                                $("game-penalty").innerHTML = n_value;
                                $("game-penalty").show ();
                        }
                }
                this.penalty = n_value;
        },
        
        /* > displayFace : update just the face card
           =============================================================================================================== */
        displayFace : function () {
                $("game-face").innerHTML = (this.face) ? '<img src="../-/cards/'+this.face+'.png" width="71" height="96" alt="Face" />' : "";
        },

        /* > getCardPositions : return the positions for each card, given a number of cards to fit into the run
           ===============================================================================================================
           params * n_count     : how many cards (1-based) to return the positions for
           return * a_positions : an array containing the x position of each card
           =============================================================================================================== */
        getCardPositions : function (n_count) {
                //defaults
                if (!n_count) {n_count = this.cards.length;}  //default: current number of cards in run
                
                var result  = [],
                    spacing = this.spacing[n_count],  //space between each card
                    pos     = 357                     //position of the first card
                ;
                //calculate the X position of each card
                for (var i=0; i<n_count; i++) {
                        result[i] = pos;        //store the position
                        pos -= (71 + spacing);  //move onto the next card
                }
                return result;
        },
        
        /* > fileCards : file the cards from the run onto the discard, and set the new face card
           ===============================================================================================================
           params * f_onComplete : function to call once the animation is complete
           =============================================================================================================== */
        fileCards : function (f_onComplete) {
                if (!f_onComplete) {f_onComplete = Prototype.emptyFunction;}  //defualt: no callback

                //are there any cards in the run anywho?
                if (!game.run.cards.length) {
                        //no, just callback
                        f_onComplete ();
                } else {
                        //animate all cards in the run sliding onto the discard pile
                        var cardanims = [];
                        game.run.cards.each (function(s_card,n_index){
                                var move_to = 436 - parseInt($("game-run-"+s_card).getStyle("left"));
                                cardanims.push (new Effect.MoveBy("game-run-"+s_card, 0, move_to));
                        });
                        new Effect.Parallel (cardanims, {duration:0.5, queue:'end', afterFinish:function(){
                                //put the old face card on the discard pile
                                if (game.run.face) {game.deck.cards.unshift (game.run.face);}
                                //take the card on top of the run and set as the new face card
                                game.run.face = game.run.cards.last ();
                                //update the face card on screen
                                game.run.displayFace ();
                                //remove the cards from the run
                                game.run.cards.each (function(s_card,n_index){
                                        $("game-run-"+s_card).remove ();
                                        game.deck.cards.unshift (s_card);
                                });
                                game.run.cards.clear ();
                                
                                //once eveything is done, call the function passed
                                f_onComplete ();
                        }});
                }
        }
};

//=== end of line ===========================================================================================================
//licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
//jax, jax games (c) copyright Kroc Camen 2005-2007