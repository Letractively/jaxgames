/* =======================================================================================================================
   games/othello/game.js - the logic for this game
   ======================================================================================================================= */
/* name   : othello
   author : Kroc Camen | kroccamen@gmail.com | kroc.deviantart.com
   type   : board game
   desc   : also known in America as 'Reversi', and sometimes 'Turncoat'.
            each player is in competition to have the most pieces remaining at the end

rules of play:
--------------
 + each player takes turn to place a single piece on the board. you must place a piece on an empty square adjacent to an
   opponent's piece, whereby another one of your own pieces is within line-of-sight (in one or more of the eight directions)
 + the winner is the player with the most pieces once all squares are filled, or when the opponent has no pieces remaining
 
-------------------------------------------------------------------------------------------------------------------------- */

Player.prototype.piece = "";  //add to the Player class the ability to set who plays white "O" and who plays black "X"
Player.prototype.wins  = 0;   //number of games won by the player

//create the players
var playerMe   = new Player (),  //the player on this computer
    playerThem = new Player ()   //the opponent is always the opposite player from either end
;

/* =======================================================================================================================
   OBJECT game : this game, extends the object in shared.js which provides shared functions between all the games
   ======================================================================================================================= */
Object.extend (game,
{
        name    : "Othello",
        version : "0.2.0",
        
        board   : new Board ("game-board"),  //the game board (default size of 8x8 will be used)
        pieces  : [],                        //the layout of pieces on the board
        played  : 0,                         //number of matches played
        
        //private storage
        _ : {
                //this is a set of vectors to move in the eight possible directions
                directions : [
                        {x:  0, y: -1},  //0 - up
                        {x:  1, y: -1},  //1 - right-up
                        {x:  1, y:  0},  //2 - right
                        {x:  1, y:  1},  //3 - right-down
                        {x:  0, y:  1},  //4 - down
                        {x: -1, y:  1},  //5 - left-down
                        {x: -1, y:  0},  //6 - left
                        {x: -1, y: -1}   //7 - left-up
                ]
        },
        
        /* > load : called for you on page load (see shared.js)
           =============================================================================================================== */
        load : function () {
                /*game.showPage ("game"); game.start (true);*/
                //create the empty board
                game.board.injectHTML ();
        },
                
        /* > start : begin playing
           ===============================================================================================================
           params * b_mefirst : who begins play (yourself, or the opponent)
           =============================================================================================================== */
        start : function (b_mefirst) {
                if (b_mefirst == null) {b_mefirst = this.host;}  //default: host goes first
                
                //please note: this function is called for you. when the user clicks the Start Game or Join Game button after
                //entering their name / join key, game.connect is called. when a connection is established between the two
                //players, this function is called for you. playerMe & playerThem will have their details ready
                
                //display player 1's name / icon
                $("jax-game-p1name").innerHTML = playerMe.name;
                $("jax-game-p1icon").src = "../images/icons/" + playerMe.icon + ".png";
                $("game-status-me").style.display = "block";
                this.setPlayerStatus ();
                
                //display player 2's name / icon
                $("jax-game-p2name").innerHTML = playerThem.name;
                $("jax-game-p2icon").src = "../images/icons/" + playerThem.icon + ".png";
                $("game-status-them").style.display = "block";
                
                //set which piece each player is using. the host always plays black, and goes first
                playerMe.piece   = (this.host) ? "X" : "O";
                playerThem.piece = (this.host) ? "O" : "X";
                //put your/their piece in the piece-count sections (the paper)
                $("game-paper-me-piece").update ('<img src="images/'+(this.host?"black":"white")+'.png" width="40" height'+
                                                 '="40" alt="You are playing '+(this.host?"black":"white")+' pieces" />'
                );
                $("game-paper-them-piece").update ('<img src="images/'+(this.host?"white":"black")+'.png" width="40" height'+
                                                   '="40" alt="You are playing '+(this.host?"white":"black")+' pieces" />'
                );
                
                //blank the two dimensional array holding the location of the pieces on the board
                this.pieces = new Array (8);
                for (var x=1; x<=8; x++) {
                        this.pieces[x] = new Array (8);
                        for (var y=1; y<=8; y++) {this.pieces[x][y] = "";}
                }
                
                //put in the starting pieces
                this.pieces[4][4] = "O";
                this.pieces[5][4] = "X";
                this.pieces[4][5] = "X";
                this.pieces[5][5] = "O";
                this.updateBoard ();
                
                //reset the piece counters to 2 a piece
                $("game-paper-me-pieces").innerHTML   = "2";
                $("game-paper-them-pieces").innerHTML = "2";
                
                game.setSystemStatus ();  //hide any status messages being displayed
                game.chat.show ();        //show the chat box
                
                if (b_mefirst) {
                        game.playTurn ();
                } else {
                        game.setPlayerStatus ("<p>Other Player's Turn, Please Wait&hellip;</p>");
                }
        },
        
        /* > updateBoard : refresh the board to reflect the changes in pieces
           =============================================================================================================== */
        updateBoard : function () {
                //loop through the array holding the pieces, and put the relevant html into the board cells
                for (var y=1; y<=8; y++) { for (var x=1; x<=8; x++) {
                        var e = $(this.board.getCell(x, y));
                        //remove the hover effect from any cells
                        e.removeClassName ("hover");
                        //remove mouse events from any cells
                        e.onclick     = Prototype.emptyFunction;
                        e.onmouseover = Prototype.emptyFunction;
                        e.onmouseout  = Prototype.emptyFuncyion;
                        
                        switch (this.pieces[x][y]) {
                                case "X":
                                        //black
                                        game.board.cells[x][y] = '<img src="images/black.png" width="40" height="40" alt="White" />';
                                        break;
                                case "O":
                                        //white
                                        game.board.cells[x][y] = '<img src="images/white.png" width="40" height="40" alt="White" />';
                                        break;
                                default:
                                        //empty cell
                                        game.board.cells[x][y] = "";
                                        break;
                        }
                } }
                game.board.display ();
        },
        
        /* > playTurn : take your turn
           =============================================================================================================== */
        playTurn : function () {
                //clear the "other player's turn" message on screen if it's there
                this.setPlayerStatus ();
                
                //find playable moves (loop all cells in the table...)
                for (var y=1; y<=8; y++) { for (var x=1; x<=8; x++) {
                        //is this your piece?
                        if (this.pieces[x][y] == playerMe.piece) {
                                //check all 8 directions...
                                for (var dir=0; dir<8; dir++) {
                                        //test this direction for a possible playable move
                                        var result = this.findBridge (true, x, y, dir);
                                        //if there is a move...
                                        if (result) {
                                                //put a mark in the cell to show it as playable
                                                var e = $(game.board.getCell(result.x, result.y));
                                                e.innerHTML = '<img src="images/spot.png" width="3" height="3" alt="Click '+
                                                              'to place your piece here" />'
                                                ;
                                                //make the empty cell clickable so you can choose that spot
                                                e.onclick     = game.events.playableCellClick;
                                                //when you hover over the cell
                                                e.onmouseover = game.events.playableCellMouseOver;
                                                e.onmouseout  = game.events.playableCellMouseOut; 
                                        }
                                }
                        }
                } }
        },
        
        /* > findBridge : check if a direction will give a playable square
           =============================================================================================================== 
           params * b_self       : if checking your pieces (false to check theirs, used in preempt)
                    n_x          : x coordinate of the cell
                    n_y          : y coordinate of the cell
                    n_dir        : direction to proceed checking (0-7 clockwise)
                    (f_piece)    : optional, function to call with each opponent piece along the way
                                   params * n_dir  : direction (0-7 clockwise)
                                            n_x    : x position of cell
                                            n_y    : y position of cell
                                            n_dist : distance from origin cell
                    (b_reverse)  : optional, false for matching piece to space, true to match space to piece
                    (n_distance) : optional, used in recursion to track how many steps have been made, don't use yourself
           return * false        : if no bridge was found, or...
                    o_position   : {
                                           n_x : x coordinate of the matched cell
                                           n_y : y coordinate of the matched cell
                                   }
           =============================================================================================================== */
        findBridge : function (b_self, n_x, n_y, n_dir, f_piece, b_reverse, n_distance) {
                //this function will traverse the board in a given direction, checking for:
                // 1) b_reverse = false, this function will continue to check cells in the specified direction until
                //    an empty cell is found. in othello, you must place a piece so that it comes between any number of
                //    opponent pieces and one of your own. this function will return an object with the x and y coordinates
                //    of the playable cell found, otherwise false
                // 2) b_reverse = true, used to backtrack from an empty cell, over opponent pieces, to one of your pieces.
                //    this is used when you click on a playable cell, to then flip the opponent pieces along the way
                
                //if a callback function is provided as f_piece, it will be called on each opponent piece encountered along
                //the way - *even if the specified direction does not turn out to be playable*. therefore you should first
                //call this function without a callback to see if the direction is playable, before repeating with the
                //callback. example of use in this game are: flipping the pieces over and highlighting the cells
                
                if (!n_distance) {n_distance = 0;}                        //default: start counting number of steps
                if (!f_piece)    {f_piece    = Prototype.emptyFunction;}  //default: no callback
                
                var piece_me   = (b_self) ? playerMe.piece : playerThem.piece,  //are you playing white or black?
                    piece_them = (b_self) ? playerThem.piece : playerMe.piece,  //and conversely...
                    new_x      = n_x + this._.directions[n_dir].x,              //X location after step forward
                    new_y      = n_y + this._.directions[n_dir].y               //Y location after step forward
                ;
                //is the next step out of range?
                if ((new_x > 0 && new_x < 9) && (new_y > 0 && new_y < 9)) {
                        switch (this.pieces[new_x][new_y]) {
                                //if the next square is the opponents, keep searching
                                case piece_them:
                                        f_piece (n_dir, new_x, new_y, n_distance)  //call the callback for this piece
                                        return this.findBridge (b_self, new_x, new_y, n_dir, f_piece, b_reverse, n_distance+1);
                                        
                                case piece_me:
                                        //bumped into one of your own pieces, this direction is already bridged
                                        return (b_reverse) ? (n_distance ? {x: new_x, y: new_y} : false) : false;
                                        
                                default:
                                        //a blank space has been found, you can place a piece here (as long as at least one
                                        //opponent piece has been bridged)
                                        return (b_reverse) ? false : (n_distance ? {x: new_x, y: new_y} : false);
                        }
                } else {
                        //hit the edge of the board, and didn't find another of your pieces - return false
                        return false;
                }
        },
        
        /* > placePiece : put a piece in an empty cell, and flip bridged pieces
           ===============================================================================================================
           params * b_self : if you or them should be checked
                    n_x    : x position of the cell to place in
                    n_y    : y position of the cell to place in
           =============================================================================================================== */
        placePiece : function (b_self, n_x, n_y) {
                //change the cell first
                var whodunit = (b_self) ? playerMe : playerThem;
                this.pieces[n_x][n_y] = whodunit.piece;
                
                //search all directions for bridges built, and change the pieces between into your own
                for (var dir=0; dir<8; dir++) {
                        //if this is a bridge...
                        if (this.findBridge (b_self, n_x, n_y, dir, null, true)) {
                                //repeat the step through, but flip each piece on the way
                                this.findBridge (b_self, n_x, n_y, dir, function(n_dir,n_x,n_y,n_dist){
                                        this.pieces[n_x][n_y] = whodunit.piece;
                                        this.updateBoard ();
                                }.bind(this), true);
                        }
                }
                this.preempt (!b_self);
        },
        
        /* > preempt : switch players, but preempt the rare occassion of not being able to take a turn
           ===============================================================================================================
           params * b_self : if you or them should be checked (true = you)
           =============================================================================================================== */
        preempt : function (b_self) {
                var piece          = (b_self ? playerMe : playerThem).piece,  //the player's piece (X or O)
                    count          = {
                            moves  : 0,  //number of playable moves on the board (for the player specified)
                            me     : 0,  //number of squares occupied by you
                            them   : 0,  //number of squares occupied by them
                            spaces : 0   //number of empty squares
                    }
                ;
                //check for available moves (loop all cells in the table...)
                for (var y=1; y<=8; y++) { for (var x=1; x<=8; x++) {
                        //count this cell (the totals used to determine the winner)
                        switch (this.pieces[x][y]) {
                                case playerMe.piece   : count.me     ++; break;  //occupied by you
                                case playerThem.piece : count.them   ++; break;  //occupied by them
                                default               : count.spaces ++; break;  //an empty square
                        }
                        //is this the player's piece?
                        if (this.pieces[x][y] == piece) {
                                //check all 8 directions...
                                for (var dir=0; dir<8; dir++) {
                                        //test this direction for a possible playable move
                                        var result = this.findBridge (b_self, x, y, dir);
                                        //if there is a move, add it to the list of known moves
                                        if (result) {count.moves ++;}
                                }
                        }
                } }
                //update the piece counts on either side of the board
                $("game-paper-me-pieces").innerHTML   = count.me;
                $("game-paper-them-pieces").innerHTML = count.them;
                
                if (!count.spaces) {
                        //TODO: draw condition
                        game.end ((count.me>count.them));
                        
                } else if (count.me==0 || count.them==0) {
                        game.end ((count.me>0));
                        
                } else if (!count.moves) {
                        //TODO: apparently there is a rare condition where neither player can play
                        this.preempt (!b_self);
                        
                } else if (b_self) {
                        //your go
                        game.playTurn ();
                        
                } else {
                        //other player's go
                        game.setPlayerStatus ("<p>Other Player's Turn, Please Wait&hellip;</p>");
                }
        },
        
        /* > endGame : play is complete, someone won or lost
           ===============================================================================================================
           params * b_winner : if you are the winner or not
           =============================================================================================================== */
        end : function (b_winner) {
                //!/TODO: this
                var html = '<a href="javascript:game.playAgain('+b_winner+');">Play Again?</a> ' +
                           '<a href="javascript:game.resign();">Resign</a></p>'
                ;
                
                //increase the number of games played
                game.played ++;
                if (b_winner) {
                        playerMe.wins ++;  //increase your tally
                        game.setPlayerStatus ("<p>YOU WIN<br />"+html);
                } else {
                        playerThem.wins ++;  //increase their tally
                        game.setPlayerStatus ("<p>YOU LOSE<br />"+html);
                }
                $("game-status-me-wins").innerHTML   = playerMe.wins;
                $("game-status-them-wins").innerHTML = playerThem.wins;
                
                //listen out for the 'play again' signal from the other person
                jax.listenFor("game_again", function(o_response){
                        game.start(!b_winner);
                });
                
        },
        
        playAgain : function (b_winner) {
                //stop listening for the play again signal from the other player
                jax.listenFor("game_again");
                //if you won, the loser starts, display a message whilst you wait for them to start
                if (b_winner) {
                        game.setSystemStatus ("Waiting for the other player to start, Please Wait...");
                }
                //notify the opponent that the game is starting again
                jax.sendToQueue("game_again", {winner: b_winner});
                //start the game for yourself (loser goes first)
                game.start(!b_winner);
        },
        
        resign : function () {
                jax.disconnect({reason: "unload"});
                game.setPlayerStatus();
                game.setSystemStatus();
        }
        
        /* > setStatus : the box in the game for status, like 'other player's turn, please wait'
           ===============================================================================================================
           params * s_html : some html to display in the status box
           =============================================================================================================== */
        /*setStatus : function(s_html) {
                var e = $("game-status");
                if(!s_html) {
                        //if the status message is already visible, fade it out
                        if (e.visible()) {
                                 new Effect.Opacity(e, {duration:0.3, from:1, to:0, queue:'end', afterFinish:function(){
                                         //hide and blank
                                         e.hide();
                                         $("game-status-text").innerHTML = "";    
                                 }});
                        }
                } else {
                        //if the status message is hidden, fade it in
                        if (!e.visible()) {
                                new Effect.Opacity(e, {duration:0.3, from:0, to:1, queue:'end', beforeStart:function(){
                                        //before starting the animation, change the html
                                        $("game-status-text").innerHTML = s_html;
                                        e.show();
                                }});
                        } else {
                                $("game-status-text").innerHTML = s_html;
                                e.show();
                        }
                } 
        }*/
});

/* =======================================================================================================================
   < game_square_chosen : the other player clicked on a square
   ======================================================================================================================= */
jax.listenFor ("game_square_chosen", function(o_response){
        //place their piece on the board
        game.placePiece (false, o_response.data.x, o_response.data.y);
});

/* =======================================================================================================================
   OBJECT game.events : event functions, so that multiple elements may use a single function pointer
   ======================================================================================================================= */
Object.extend (game.events,
{
        /* > playableCellClick : when you click on a cell to make a move 
           =============================================================================================================== */
        playableCellClick : function () {
                //the update board function will remove the mouse events on all the cells, preventing you from clicking
                //another playable cell again, or the same one twice in a row
                game.updateBoard ();
                //get the x/y location of the cell clicked
                var position = game.board.getCoordsFromId (this.id);
                //alert the opponent to the chosen square
                jax.sendToQueue ("game_square_chosen", {x:position.x, y:position.y});
                //place your piece on the board
                game.placePiece (true, position.x, position.y);
        },
        
        /* > playableCellMouseOver : when you hover over an available cell
           =============================================================================================================== */
        playableCellMouseOver : function () {
                //get the x/y location of the cell clicked
                var position = game.board.getCoordsFromId (this.id);
                
                $(game.board.getCell(position.x, position.y)).addClassName ("hover");
                
                for (var dir=0; dir<8; dir++) {
                        if (game.findBridge (true, position.x, position.y, dir, null, true)) {
                                var endcap = game.findBridge (true, position.x, position.y, dir, function(n_dir,n_x,n_y,n_dist){
                                        $(game.board.getCell(n_x, n_y)).addClassName ("hover");
                                }, true);
                                $(game.board.getCell(endcap.x, endcap.y)).addClassName ("hover");
                        }
                }
        },
        
        /* > playableCellMouseOut : when you move the mouse out of a playable cell
           =============================================================================================================== */
        playableCellMouseOut : function () {
                //get the x/y location of the cell clicked
                var position = game.board.getCoordsFromId (this.id);
                
                $(game.board.getCell(position.x, position.y)).removeClassName ("hover");
                
                for (var dir=0; dir<8; dir++) {
                        if (game.findBridge (true, position.x, position.y, dir, null, true)) {
                                var endcap = game.findBridge (true, position.x, position.y, dir, function(n_dir,n_x,n_y,n_dist){
                                        $(game.board.getCell(n_x, n_y)).removeClassName ("hover");
                                }, true);
                                $(game.board.getCell(endcap.x, endcap.y)).removeClassName ("hover");
                        }
                }
        }
});

//=== end of line ===========================================================================================================
//licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
//jax, jax games (c) copyright Kroc Camen 2005-2007