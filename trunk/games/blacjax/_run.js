/* =======================================================================================================================
   games/blacjax/_run.js - the run of cards in the centre of the table (and the discard pile)
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   + js/CONFIG.js
   + js/boot.js [ + jax/jax.js + js/_shared.js + js/_chat.js + js/_global.js ]
   + games/blacjax/game.js [
     + games/-/_js/_cards.js
     + games/blacjax/_classes.js
     + games/blacjax/_blacjax.js
     + games/blacjax/_events.js
     » games/blacjax/_run.js
   ]
*/

/* =======================================================================================================================
   OBJECT game.run
   ======================================================================================================================= */
game.run = {
        cards   : [],  //the cards currently in the run
        discard : "",  //the top card on the discard pile
        penalty : 0,   //current card penalty in play
        
        //the spacing in pixels between each card on the run, given the number of cards present. these numbers allow for the
        //cards on the run to compact together to always stay within the run's area. this could be calculated as needed
        //in `getCardPositions`, but I couldn't get the math right
        spacing : [
                0, 5, 5, 5, 5,  //0, no spacing. 1-4 cards, normal spacing between cards
                -2.8,    /* 5  cards */  -16.3,  /* 6  cards */  -25.5,  /* 7  cards */  -32,    /* 8 cards */
                -36.9,   /* 9  cards */  -40.7,  /* 10 cards */  -43.7,  /* 11 cards */  -46.2,  /* 12 cards */
                -48.25,  /* 13 cards */  -50,    /* 14 cards */  -51.5   /* 15 cards */
        ],
        
        /* > getFaceCard : the card to match against; either the the last card on the run, if any, otherwise the discard card
           ===============================================================================================================
           return * string : card name of the face card
           =============================================================================================================== */
        getFaceCard : function () {
                return this.cards.length ? this.cards.last () : this.discard;
        },
        
        /* > armed : if the card on top of the run is a Two or a Black Jack
           ===============================================================================================================
           return * boolean : true if the top card is a Two or Black Jack, false otherwise
           =============================================================================================================== */
        armed : function () {
                return (this.cards.length) && (
                        game.pack.value (this.cards.last()) == 11 ||
                        game.pack.value (this.cards.last()) == 2
                );
        },
        
        /* > combo : if the card on top of the run is a combo card (Ace, Eight or Joker)
           ===============================================================================================================
           return * boolean : true if the top card is an Ace, Eight or Joker, false otherwise
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
                //clear the discard
                this.discard = "";
                this.displayDiscard ();
                //clear the penalty
                this.updatePenalty (0);
        },
        
        /* > updatePenalty : change the penalty value (and automatically display / hide it accordingly)
           ===============================================================================================================
           params * (n_value) : new penalty value to use
           =============================================================================================================== */
        updatePenalty : function (n_value) {
                var e = $("game-penalty");
                
                //if setting to directly to 0 (i.e. cancelling a penalty with a Red Jack) then...
                if (!n_value && this.penalty) {
                        //animate it dropping
                        new Effect.DropOut (e, {afterFinish:function(){ e.update (); }});
                        
                } else {
                        //update the penalty
                        if (!n_value) {
                                //if 0, hide the penalty, don't need to display "0"
                                e.hide ();
                        } else {
                                e.update (n_value).show ();
                        }
                }
                this.penalty = n_value;
        },
        
        /* > displayDiscard : update just the discard card
           =============================================================================================================== */
        displayDiscard : function () {
                $("game-discard").update (
                        (this.discard)?'<div class="card card-'+this.discard+'"></div>':""
                );
        },

        /* > getCardPositions : return the positions for each card, given a number of cards to fit into the run
           ===============================================================================================================
           params * (n_count) : how many cards (1-based) to return the positions for
           return * array     : the x position of each card
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
        
        /* > fileCards : file the cards from the run onto the discard, and set the new discard card
           ===============================================================================================================
           params * (f_onComplete) : function to call once the animation is complete
           =============================================================================================================== */
        fileCards : function (f_onComplete) {
                if (!f_onComplete) {f_onComplete = Prototype.emptyFunction;}  //defualt: no callback
                
                //are there any cards in the run anywho?
                if (!game.run.cards.length) {
                        //no, just callback
                        f_onComplete ();
                } else {
                        //animate all cards in the run sliding onto the discard pile
                        var anims = [];
                        game.run.cards.each (function(s_card,n_index){
                                var move_to = 436 - parseInt($("game-run-"+s_card).getStyle("left"), 10);
                                anims.push (new Effect.Move("game-run-"+s_card, {sync:true, x:move_to, y:0}));
                        });
                        new Effect.Parallel (anims, {duration:0.5, queue:'end', afterFinish:function(){
                                //put the old discard card back on the bottom of the deck (so that the deck rotates)
                                if (game.run.discard) {game.deck.cards.unshift (game.run.discard);}
                                //take the card on top of the run and set as the new discard card
                                game.run.discard = game.run.cards.last ();
                                //update the discard card on screen
                                game.run.displayDiscard ();
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