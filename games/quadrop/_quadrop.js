/* =======================================================================================================================
   games/quadrop/_quadrop.js - the logic for this game
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   name   : Quadrop
   author : Kroc Camen | kroccamen@gmail.com | kroc.deviantart.com
   type   : board game
   desc   : as known as 'Connect 4™'
            each player is in competition to get four pieces in a row in the 7x6 grid. the grid has simulated gravity,
            meaning that players cannot play anywhere, but only on the bottom of an empty column, or on top of pieces already
            in a column
            
rules of play:
--------------


-------------------------------------------------------------------------------------------------------------------------- */

//add to the Player class the ability to set who plays red "R" and who plays yellow "Y"
Player.prototype.piece = "";

//create the players
var playerMe   = new Player (),  //the player on this computer
    playerThem = new Player ()   //the opponent is always the opposite player from either end
;

/* =======================================================================================================================
   OBJECT game : this game
   ======================================================================================================================= */
var game = {
        name    : "Quadrop",
        version : "0.1.0",
        
        grid   : new Grid ("game-grid", 7, 6),  //the game grid, a board of 7x6. see '_grid.js'
        pieces  : [],                         //the layout of pieces on the grid
        
        /* > load : called for you on page load (see shared.js)
           =============================================================================================================== */
        load : function () {
                //create the empty board
                this.grid.injectHTML ();
                
                shared.showPage ("game");
                $("player-status-me").show ();
                $("player-status-them").show ();
                this.start (true);
        },
                
        /* > start : begin playing
           ===============================================================================================================
           params * (b_mefirst) : who begins play (yourself, or the opponent). default: whoever is host
           =============================================================================================================== */
        start : function (b_mefirst) {
                //please note: this function is called for you. when the user clicks the Start Game or Join Game button after
                //entering their name / join key, `shared.(start/join)Connection` is called. when a connection is established
                //between the two players, game.start is called for you
                if (b_mefirst == null) {b_mefirst = shared.host;}  //default: host goes first
                
                shared.setTitle (playerMe.name+" v. "+playerThem.name+" - ");
                
                //set which piece each player is using. the host always plays black, and goes first
                playerMe.piece   = (shared.host) ? "Y" : "R";
                playerThem.piece = (shared.host) ? "R" : "Y";
                
                //blank the two dimensional array holding the location of the pieces on the board
                this.pieces = create2DArray (this.grid.width, this.grid.height, "");
                
                shared.setSystemStatus ();  //hide any status messages being displayed
                shared.chat.show ();        //show the chat box
                
                if (b_mefirst) {
                        this.playTurn ();
                } else {
                        shared.setPlayerStatus ("<p>Other Player's Turn, Please Wait&hellip;</p>");
                }
        },
        
        /* > updateBoard : refresh the board to reflect the changes in pieces
           =============================================================================================================== */
        updateBoard : function () {
                //loop through the array holding the pieces, and put the relevant html into the board cells
                for (var y=0; y<this.grid.height; y++) { for (var x=0; x<this.grid.width; x++) {
                        //get the html element for this cell
                        var e = $(this.board.getCellId(x, y));
                        //remove the hover effect from any cells
                        e.removeClassName ("hover");
                        //remove mouse events from any cells
                        e.onclick     = Prototype.emptyFunction;
                        e.onmouseover = Prototype.emptyFunction;
                        e.onmouseout  = Prototype.emptyFunction;
                        
                        //update the html for the cell (in memory)
                        this.grid.cells[x][y] = (this.pieces[x][y] == "") ? "" : '<img width="40" height="40" src="images/'+
                                                (this.pieces[x][y]=="X"?'black.png" alt="Black':'white.png" alt="White')+'" />'
                        ;
                } }
                //reflect any changes on the cells
                this.board.display ();
        },
        
        /* > playTurn : take your turn
           =============================================================================================================== */
        playTurn : function () {
                //clear the "other player's turn" message on screen if it's there
                shared.setPlayerStatus ();
                
                //check each column to see which are playable
                for (var x=0; x<this.grid.width; x++) {
                        //if the top cell is empty, the column can be played
                        if (!this.pieces[x][1]) {
                                //enable the whole column...
                                for (var y=0; y<this.grid.height; y++) {
                                        //enable mouse events for each cell in the column
                                        var e = $(this.grid.getCellId(x,y));
                                        e.onmouseclick = this.events.playableCellClick;
                                        e.onmouseover  = this.events.playableCellMouseOver;
                                        e.mouseout     = this.events.playableCellMouseOut;
                                }
                        }
                }
        },
        
        /* > endGame : play is complete, someone won or lost
           ===============================================================================================================
           params * b_winner : if you are the winner or not
           =============================================================================================================== */
        end : function (b_winner) {
                shared.end (b_winner);
        }
};

/* =======================================================================================================================
   < game_square_chosen : the other player clicked on a square
   ======================================================================================================================= */
jax.listenFor ("game_square_chosen", function(o_response){
});

/* =======================================================================================================================
   OBJECT game.events : event functions, so that multiple elements may use a single function pointer
   ======================================================================================================================= */
game.events = {
        /* > playableCellMouseOver
           =============================================================================================================== */
        playableCellMouseOver :  function () {
                //highlight the column
                var position = game.grid.getCoordsFromId (this.id);
                for (var y=0; y<game.grid.height; y++) {
                        $(game.grid.getCellId(position.x,y)).addClassName ("hover");
                }
        },
        
        /* > playableCellMouseOut
           =============================================================================================================== */
        playableCellMouseOut : function () {
                var position = game.grid.getCoordsFromId (this.id);
                for (var y=0; y<game.grid.height; y++) {
                        $(game.grid.getCellId(position.x,y)).removeClassName ("hover");
                }
        },
        
        /* > playableCellClick
           =============================================================================================================== */
        playableCellClick : function () {
                
        }
};

//=== end of line ===========================================================================================================