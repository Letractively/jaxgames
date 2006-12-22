// >>>>>>>>>>>>>>>>> this work is licensed under the Creative Commons Attribution-ShareAlike 2.5 license <<<<<<<<<<<<<<<<<
/* =======================================================================================================================
   games/blacjax/classes.js - extra classes unique to this game
   ======================================================================================================================= */

/* =======================================================================================================================
   EXTEND CLASS Pack - add BlackJack specific functions to the standard pack class
   ======================================================================================================================= */
/* isCombo : is the card a wild card?
   =======================================================================================================================
   params * s_card  : name of the card in question
   return * b_combo : if the card is a wild card or not
   ======================================================================================================================= */
Pack.prototype.isCombo = function (s_card) {
        //a Joker (value 0), Ace or Eight are combo cards
        var value = this.value (s_card);
        return (!value || value == 1 || value == 8);
};
/* isArmed : is the card an armed card? (a Two or Black Jack)
   =======================================================================================================================
   params * s_card  : name of the card in question
   return * b_combo : if the card is an armed card or not
   ======================================================================================================================= */
Pack.prototype.isArmed = function (s_card) {
        //a Two, or a Black Jack are armed cards
        var colour = this.colour (s_card);
        var value  = this.value (s_card);
        return (value == 2 || (value == 11 && colour == "black"));
};

/* =======================================================================================================================
   EXTEND CLASS Player - add extra properties to the player class for this game
   ======================================================================================================================= */
/* initialize : constructor function for Player class
   =======================================================================================================================
   params * s_element : html id to inject the player's hand into
          * b_host   : if this player instance is the game's host or not (i.e. the near or far hand on screen)
   ======================================================================================================================= */
Player.prototype.initialize = function (s_element, b_host) {
        this.hand = new Hand (s_element, b_host);  //create a new hand instance for the player
};
//cards in hand, needs to be set to a new instance of game_hand class below, done for you if you create a new Player class
Player.prototype.hand   = null;
Player.prototype.wins   = 0;     //keep track of number of wins
Player.prototype.points = 0;     //number of points earnt

/* =======================================================================================================================
   CLASS Hand - the cards in the player's hand
   ======================================================================================================================= */
function Hand (s_element, b_host) {
        //this array cannot be defined as a prototype otherwise the pointer will be shared by all instances of the class,
        //and thus both player's hands will point to the same array
        this.cards = [];
        
        this.element = s_element;  //the id of an html element the cards will be injected into
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
           params * n_count      : number of cards to take from the deck
                    f_onComplete : a function to call once the animation is complete
           return * s_card       : returns the first card taken, regardless of n_count
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
                                cardanims.push (new Effect.MoveBy (this.element+'-'+s_card, 0, cardpos[n_index+1], {mode:'absolute'}));
                        }.bind(this));
                }

                //slide the card from the deck to the hand
                this.cards.unshift (game.deck.cards.pop());
                var card    = this.cards.first (),
                    card_id = this.element + '-' + card
                ;
                new Insertion.Top (this.element, '<img id="'+card_id+'" style="position: absolute; left: 5px; top: ' +
                                   (this.host?-113:113)+'px;" src="../images/cards/back.png" width="71" height="96" '+
                                   'alt="'+card+'" />'
                );
                cardanims.push (new Effect.MoveBy (card_id, 0, cardpos[0], {mode:'absolute', afterFinish:function(o_effect){
                        //flip the card over by switching to the face image (playerMe only)
                        if (this.host) {$(o_effect.element.id).src = "../images/cards/" + card + ".png";}
                }.bind(this)}));
                
                new Effect.Parallel (cardanims, {
                        duration    : 0.3,
                        afterFinish : function(){
                                $("game-deck").innerHTML = "";
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
           params * n_count     : how many cards (1-based) to return the positions for
           return * a_positions : an array containing the X position of each card
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
                $(this.element).innerHTML = "";  //!/change to .update(); for prototype 1.5.0.rc2
                this.cards.clear ();
        },
        
        /* > useCard : take a card from the hand and move it onto the run
           ===============================================================================================================
           params * s_card       : name of the card to take from the player's hand (e.g. KC)
                    f_onComplete : function to call once the animation is complete
                                   param * s_card : name of chosen card
           =============================================================================================================== */
        useCard : function (s_card, f_onComplete) {
                if (!f_onComplete) {f_onComplete = Prototype.emptyFunction}  //default: no callback
                
                var card_id = this.cards.indexOf (s_card),
                    elid    = this.element + '-' + s_card,           //the html id of the card
                    curpos  = parseInt($(elid).getStyle ("left")),   //get the X position of the chosen card...
                    cardpos = game.run.getCardPositions (game.run.cards.length+1),
                    newpos  = cardpos.last ()
                ;
                //slide the card out a bit,
                new Effect.MoveBy (elid, (this.host?-57:57), 0, {duration:0.5, beforeStart:function(){
                        $(elid).style.zIndex = this.cards.length+1;
                }.bind(this)});
                
                //if there's any cards in the run, slide them around to make room for one more
                if (game.run.cards.length) {
                        game.run.cards.each (function(s_card,n_index){
                                //assign an animation to each card
                                $("game-run-"+s_card).style.zIndex = n_index + 1;
                                var move_to = cardpos[n_index] - parseInt($("game-run-"+s_card).getStyle("left"));
                                new Effect.MoveBy ('game-run-'+s_card, 0, move_to);
                        }.bind(this));
                }
                
                //slide the card over onto the run
                new Effect.MoveBy (elid, (this.host?-113:113), newpos, {
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
                                        anims.push (new Effect.MoveBy (this.element+'-'+s_card, 0, cardpos[d], {mode:'absolute'}));
                                        d++;
                                }
                        }.bind(this));
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
                                if (!this.host) {$("game-run-"+chosencard).src = "../images/cards/" + chosencard + ".png";}

                                f_onComplete (chosencard);
                        }.bind(this)});
                        
                }.bind(this)});
        },
        
        /* > playableCards : return a list of the indexes of which cards can be played
           ===============================================================================================================
           return * a_indexes : an array of the indexes of cards in your hand which are playable
           =============================================================================================================== */
        playableCards : function () {                
                var armedrun  = game.run.armed (),
                    matchcard = (game.run.cards.length) ? game.run.cards.last () : game.run.face,
                    results   = []
                ;                
                //check which of your cards are playable
                this.cards.each (function(s_card,n_index){
                        //get the value/suit of the card in your hand, and the match card
                        var face_value = game.pack.value (matchcard), face_suit = game.pack.suit (matchcard),
                            card_value = game.pack.value (s_card),    card_suit = game.pack.suit (s_card)
                        ;
                        if ((
                             //if the run is not armed, standard matching rules apply
                             !armedrun && (!face_value || !card_value ||  //Jokers
                                            face_value == card_value  ||  //value matches
                                            face_suit  == card_suit   ||  //suit matches
                                            card_value == 8)              //8's match anything underneath
                        ) || (
                             //if run is armed, only Jacks or Two's allowed
                             armedrun && (card_value == 11 || card_value == 2)
                        )) {
                                //add the index of this card in your hand to the results (of playable cards)
                                results.push (n_index);
                        }
                });
                return results;
        }
}; 

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
                return (this.cards.length) && (game.pack.isCombo (this.cards.last()));
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
                $("game-face").innerHTML = (this.face) ? '<img src="../images/cards/'+this.face+'.png" width="71" height="96" alt="Face" />' : "";
        },

        /* > getCardPositions : return the positions for each card, given a number of cards to fit into the run
           ===============================================================================================================
           params * n_count     : how many cards (1-based) to return the positions for
           return * a_positions : an array containing the X position of each card
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
                                cardanims.push (new Effect.MoveBy ("game-run-"+s_card, 0, move_to));
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