/* =======================================================================================================================
   games/blacjax/_events.js - event functions (`onclick` &c) and events in-game (animation, response &c)
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*/

/* =======================================================================================================================
   OBJECT game.events
   ======================================================================================================================= */
game.events = {
        /* > cardMouseOver : when the player moves the mouse on a card (in their hand)
           =============================================================================================================== */
        cardMouseOver : function () {
                //on mouse over, nudge the card up a little by using a CSS class
                this.addClassName ("card-hover");
                
                //the card's name is stored in the <img> tag's 'alt' property
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
                //game. see the "game card chosen" listen function underneath the `game` object for where the other player
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
                                ]);
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
};

//=== end of line ===========================================================================================================