/* =======================================================================================================================
   games/blacjax/_classes.js - extra classes unique to this game
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*/

/* =======================================================================================================================
   EXTEND CLASS Pack - add BlackJack specific functions to the standard pack class
   ======================================================================================================================= */
/* isCombo : is the card a wild card?
   =======================================================================================================================
   params * s_card  : name of the card in question
   return * boolean : if the card is a wild card or not
   ======================================================================================================================= */
Pack.prototype.isCombo = function (s_card) {
        //a Joker (value 0), Ace or Eight are combo cards
        var value = this.value (s_card);
        return (!value || value == 1 || value == 8);
};
/* isArmed : is the card an armed card? (a Two or Black Jack)
   =======================================================================================================================
   params * s_card  : name of the card in question
   return * boolean : if the card is an armed card or not
   ======================================================================================================================= */
Pack.prototype.isArmed = function (s_card) {
        //a Two, or a Black Jack are armed cards
        var value  = this.value (s_card);
        return (value == 2 || (value == 11 && this.colour(s_card) == "black"));
};

/* =======================================================================================================================
   EXTEND CLASS Player - add extra properties to the player class for this game
   ======================================================================================================================= */
/* initialize : constructor function for Player class
   =======================================================================================================================
   params * s_element : HTML ID to inject the player's hand into
          * boolean   : if this player instance is the game's host or not (i.e. the near or far hand on screen)
   ======================================================================================================================= */
Player.prototype.initialize = function (s_element, b_host) {
        this.hand = new Hand (s_element, b_host);  //create a new hand instance for the player
};
//cards in hand, needs to be set to a new instance of game_hand class below, done for you if you create a new Player class
Player.prototype.hand   = null;
Player.prototype.points = 0;     //number of points earnt

/* =======================================================================================================================
   CLASS Hand - the cards in the player's hand
   ======================================================================================================================= */
function Hand (s_element, b_host) {
        //this array cannot be defined as a prototype otherwise the pointer will be shared by all instances of the class,
        //and thus both player's hands will point to the same array
        this.cards = [];
        
        this.element = s_element;  //the ID of an HTML element the cards will be injected into
        this.host    = b_host;     //if the player is the local player (and not the opponent)
}
Hand.prototype = {
        spacing : [
                0, 0,                //0 and 1 cards: no spacing between cards even possible
                -5, -5, -5, -5, -5,  //2 - 6 cards:   5 pixel spacing between cards
                0,      /* 7  cards */  10.2,  /* 8  cards */  17.8,   /* 9  cards */  23.7,   /* 10 cards */
                28.4,   /* 11 cards */  32.3,  /* 12 cards */  35.5,   /* 13 cards */  38.25,  /* 14 cards */
                40.6,   /* 15 cards */  42.6,  /* 16 cards */  44.4,   /* 17 cards */  45.95,  /* 18 cards */
                47.35,  /* 19 cards */  48.6,  /* 20 cards */  49.7,   /* 21 cards */  50.72,  /* 22 cards */
                51.65,  /* 23 cards */  52.5,  /* 24 cards */  53.25,  /* 25 cards */  53.96   /* 26 cards */
        ],
        
        /* > takeCard : take a card from the deck and put it into the player's hand
           ===============================================================================================================
           params * (n_count)      : number of cards to take from the deck
                    (f_onComplete) : a function to call once the animation is complete
           return * string         : returns the first card taken, regardless of `n_count`
           =============================================================================================================== */
        takeCard : function (n_count, f_onComplete) {
                if (!n_count)      {n_count      = 1;}                        //default: take 1 card
                if (!f_onComplete) {f_onComplete = Prototype.emptyFunction;}  //default: no callback
                
                //slide the cards in the hand up to make room for the new card
                var cardanims = [],
                    cardpos   = this.getCardPositions (this.cards.length+1)  //positions of cards with extra space for one
                ;
                if (this.cards.length) {
                        //for each card in the hand...
                        this.cards.each (function(s_card,n_index){
                                //assign an animation to each card to shift it to the new position
                                cardanims.push (new Effect.Move(this.element+'-'+s_card, {sync:true, x:cardpos[n_index+1], y:0, mode:'absolute'}));
                        }, this);
                }
                
                //slide the card from the deck to the hand
                this.cards.unshift (game.deck.cards.pop());
                var card    = this.cards.first (),
                    card_id = this.element + '-' + card
                ;
                $(this.element).insert ({
                        top : '<div id="'+card_id+'" class="card card-bk" style="left:5px;top:'+(this.host?-113:113)+'px;" ></div>'
                });
                cardanims.push (new Effect.Move(card_id, {sync:true, x:cardpos[0], y:0, mode:'absolute', afterFinish:function(o_effect){
                        //flip the card over by switching to the face image (playerMe only)
                        if (this.host) {$(o_effect.element.id).className = "card card-" + card;}
                }.bind(this)}));
                
                new Effect.Parallel (cardanims, {
                        duration    : 0.3,
                        afterFinish : function(){
                                $("game-deck").update ();
                                //if there's a penalty, take one from the penalty total
                                if (game.run.penalty) {game.run.updatePenalty (game.run.penalty-1);}
                                //more cards to draw?
                                if (n_count > 1) {
                                        //take another card
                                        this.takeCard (n_count-1, f_onComplete);
                                } else {
                                        //call the callback function provided
                                        f_onComplete ();
                                }
                        }.bind(this)
                });
                //return the card that was drawn
                return this.cards.first ();
        },
        
        /* > getCardPositions : return the positions for each card, given a number of cards to fit into the hand
           ===============================================================================================================
           params * (n_count) : how many cards (1-based) to return the positions for
           return * array     : the X position of each card
           =============================================================================================================== */
        getCardPositions : function (n_count) {
                //defaults
                if (!n_count) {n_count = this.cards.length;}  //default: current number of cards in hand
                
                var result    = [],
                    spacing   = this.spacing[n_count],                       //space between each card
                    handwidth = (n_count * 71) - ((n_count - 1) * spacing),  //width of the whole hand
                    centering = Math.round ((502 - handwidth) / 2, 0),       //offset to centre the hand on the screen
                    pos       = 5 + centering                                //position of the first card
                ;
                //calculate the X position of each card
                for (var i=0; i<n_count; i++) {
                        result[i] = pos;        //store the position
                        pos += (71 - spacing);  //move onto the next card
                }
                return result;
        },
        
        /* > clear : clear the cards in the hand (will also remove any cards in the run too!)
           =============================================================================================================== */
        clear : function () {
                $(this.element).update ();
                this.cards.clear ();
        },
        
        /* > useCard : take a card from the hand and move it onto the run
           ===============================================================================================================
           params * s_card         : name of the card to take from the player's hand (e.g. "KC")
                    (f_onComplete) : function to call once the animation is complete
                                     param * s_card : name of chosen card
           =============================================================================================================== */
        useCard : function (s_card, f_onComplete) {
                if (!f_onComplete) {f_onComplete = Prototype.emptyFunction;}  //default: no callback
                
                var card_id = this.cards.indexOf (s_card),
                    elid    = this.element + '-' + s_card,              //the HTML ID of the card
                    curpos  = parseInt($(elid).getStyle ("left"), 10),  //get the X position of the chosen card...
                    cardpos = game.run.getCardPositions (game.run.cards.length+1),
                    newpos  = cardpos.last ()
                ;
                //slide the card out a bit,
                new Effect.Move (elid, {x:0, y:(this.host?-57:57), duration:0.5, beforeStart:function(){
                        $(elid).style.zIndex = this.cards.length+1;
                }.bind(this)});
                
                //if there's any cards in the run, slide them around to make room for one more
                if (game.run.cards.length) {
                        var anims = [];
                        game.run.cards.each (function(s_card,n_index){
                                //assign an animation to each card
                                $("game-run-"+s_card).style.zIndex = n_index + 1;
                                var move_to = cardpos[n_index] - parseInt ($("game-run-"+s_card).getStyle("left"), 10);
                                anims.push (new Effect.Move("game-run-"+s_card, {sync:true, x:move_to, y:0}));
                        }, this);
                        new Effect.Parallel (anims);
                }
                
                //slide the card over onto the run
                new Effect.Move (elid, {
                        x           : newpos,
                        y           : (this.host?-113:113),
                        mode        : 'absolute',
                        duration    : (Math.abs (newpos-curpos) / 500) + 0.3,  //time taken is based on the distance
                        queue       : 'end',
                        afterFinish : function()
                {
                        //re-position the cards in the hand to adjust even spacing with 1 less card
                        var cardpos = this.getCardPositions (this.cards.length-1),
                            anims   = [],
                            d       = 0
                        ;
                        this.cards.each (function(s_card,n_index){
                                //assign an animation to each card (excluding the card that was chosen)
                                if (n_index != card_id) {
                                        anims.push (new Effect.Move (this.element+'-'+s_card, {sync:true, x:cardpos[d], y:0, mode:'absolute'}));
                                        d++;
                                }
                        }, this);
                        //animate all the cards at the same time
                        new Effect.Parallel (anims, {duration:0.5, afterFinish:function(){
                                //once the animation is complete...
                                var chosencard = this.cards[card_id];  //pull the card actually out of the hand array
                                this.cards[card_id] = null;            //set that slot to null
                                this.cards = this.cards.compact ();    //and rebuild the array
                                
                                //add the card to the run, update the run
                                game.run.cards.push (chosencard);
                                $(this.element+"-"+chosencard).id = "game-run-"+chosencard;
                                
                                //flip the card over by switching to the face image (your cards are already face up)
                                if (!this.host) {$("game-run-"+chosencard).className = "card card-" + chosencard;}
                                
                                f_onComplete (chosencard);
                        }.bind(this)});
                        
                }.bind(this)});
        },
        
        /* > playableCards : return a list of the indexes of which cards can be played
           ===============================================================================================================
           return * array : the indexes of cards in your hand which are playable
           =============================================================================================================== */
        playableCards : function () {
                var armed_run  = game.run.armed (),
                    match_card = game.run.getFaceCard (),
                    results    = []
                ;                
                //check which of your cards are playable
                this.cards.each (function(s_card,n_index){
                        //get the value/suit of the card in your hand, and the match card
                        var face_value = game.pack.value (match_card), face_suit = game.pack.suit (match_card),
                            card_value = game.pack.value (s_card),     card_suit = game.pack.suit (s_card)
                        ;
                        if ((
                             //if the run is not armed, standard matching rules apply
                             !armed_run && (!face_value || !card_value ||  //Jokers
                                             face_value == card_value  ||  //value matches
                                             face_suit  == card_suit   ||  //suit matches
                                             card_value == 8)              //8s match anything underneath
                        ) || (
                             //if run is armed, only Jacks or Twos allowed
                             armed_run && (card_value == 11 || card_value == 2)
                        )) {
                                //add the index of this card in your hand to the results (of playable cards)
                                results.push (n_index);
                        }
                });
                return results;
        }
};

//=== end of line ===========================================================================================================