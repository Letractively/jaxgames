// >>>>>>>>>>>>>>>>> this work is licensed under the Creative Commons Attribution-ShareAlike 2.5 license <<<<<<<<<<<<<<<<<
/* =======================================================================================================================
   js/cards.js - a set of classes for using playing cards in your game
   ======================================================================================================================= */

/* =======================================================================================================================
   CLASS Pack - a standard 54 card pack of playing cards. decks can be made of one or more of these
   ======================================================================================================================= */
var Pack = Class.create();
Pack.prototype = {
        cards    : [],
        //10 is X because a card must be two letters only, face+suit. 10C would appear as 1C internally
        faces    : ["A", "2", "3", "4", "5", "6", "7", "8", "9", "X", "J", "Q", "K"],
        
        /* > initialize : create the pack of cards
           ===============================================================================================================
           params * b_jokers : boolean for wether to include jokers or not
           =============================================================================================================== */
        initialize : function (b_jokers) {
                if (!b_jokers) {b_jokers = false;}  //default: no jokers
                var self = this;
                
                //loop each suit
                ["S", "C", "D", "H"].each (function(s_suit){
                        //loop each face
                        self.faces.each (function(s_face){
                                //add the card to the deck
                                self.cards.push(s_face + s_suit);
                        });
                });
                //include Jokers?
                if (b_jokers) {
                        //add the two Jokers (marked Red & Black because no two cards can have the same name)
                        this.cards.push("RJ", "BJ");
                }
        },
        
        /* > value : given a card, return what value it is
           ===============================================================================================================
           params * s_card : card straight from the deck/pack
           return * s_suit : the value of the card (Ace is low, Joker is 0)
           =============================================================================================================== */
        value : function(s_card) {
                //the index of the card in the faces array is it's value
                return parseInt(this.faces.indexOf(s_card.substr(0, 1))) + 1;
        },
        
        /* > suit : given a card, return what suit it is
           ===============================================================================================================
           params * s_card : card straight from the deck/pack
           return * s_suit : the suit of the card as a single letter - S, C, D, H
           =============================================================================================================== */
        suit : function (s_card) {
                //the last letter of the card name is the suit
                return s_card.substr(-1,1);
        },
        
        /* > colour : given a card, return what colour it is
           ===============================================================================================================
           params * s_card : card straight from the deck/pack
           return * s_suit : the colour as the word "black" or "red"
           =============================================================================================================== */
        colour : function (s_card) {
                var suit = this.suit(s_card);
                //if the suit comes back as J (Joker), then check for Red Joker vs Black Joker
                return (suit == "J") ? (s_card.substr(0,1)  == "B" ? "black" : "red")
                                     : (suit == "S" || suit == "C" ? "black" : "red")  //else Spades or Clubs = Black
                ;
        },
        
        /* > cache : inject all card images into the page, hidden off screen
           =============================================================================================================== */
        cache : function () {
                var html = '\t<div style="position: absolute; top: -4999px;">\n'
                         + '\t\t<img src="../images/cards/back.png" width="71" height="96" alt="back" />\n'    //back of card
                         + '\t\t<img src="../images/cards/place.png" width="71" height="96" alt="place" />\n'  //place holder
                ;
                this.cards.each(function(s_card){
                        html += '\t\t<img src="../images/cards/'+s_card+'.png" width="71" height="96" alt="'+s_card+'" />\n';
                });
                html += "\t</div>\n";
                new Insertion.Top("body", html);
        }
};


/* =======================================================================================================================
   CLASS Deck - a playing deck, which can have any number of cards
   ======================================================================================================================= */
var Deck = Class.create();
Deck.prototype = {
        cards : [],
        
        /* > initialize : constructor function, allow adding of packs to the deck upon class creation
           ===============================================================================================================
           params * o_pack    : a pack object to take the cards from
                    n_count   : number of packs to add to the deck
                    b_shuffle : boolean to shuffle the deck every time a pack is added 
           =============================================================================================================== */
        initialize : function(o_pack, n_count, b_shuffle){
                //if a pack is provided on class creation...
                if (o_pack) {
                        if (!n_count)   {n_count = 1;}       //default: 1 pack in the deck
                        if (!b_shuffle) {b_shuffle = true;}  //default: shuffle
                        //add the pack to the deck
                        this.addPack (o_pack, n_count, b_shuffle);
                }
        },
        
        /* > addPack : add pack(s) of cards to the deck
           ===============================================================================================================
           params * o_pack    : a pack object to take the cards from
                    n_count   : number of packs to add to the deck
                    b_shuffle : boolean to shuffle the deck every time a pack is added
           =============================================================================================================== */
        addPack : function(o_pack, n_count, b_shuffle) {
                var self = this;  //in order to refer to this instance from within another function

                //you can add more than 1 pack at a time
                for (var i=1; i<=n_count; i++) {
                        //go over each card in the pack and add it to the deck
                        //!/TODO: use merge here
                        o_pack.cards.each (function(s_card){
                                self.cards.push(s_card);
                        });
                        //if the parameter to shuffle each time is true, then.
                        if (b_shuffle) {this.shuffle();}
                }
        },
        
        /* > shuffle : shuffle the cards in the deck
           =============================================================================================================== */
        shuffle : function() {
                var i = this.cards.length, j, t;
                while (i) {
                        j = Math.floor((i--) * Math.random());
                        t = this.cards[i];
                        this.cards[i] = this.cards[j];
                        this.cards[j] = t;
                }
        },
        
        /* > jax_deck.drawCard : take a card off of the deck
           ===============================================================================================================
           return * s_card : card name
           =============================================================================================================== */
        drawCard : function() {
                return this.cards.pop();
        }
};

//=== end of line ===========================================================================================================