/* =======================================================================================================================
   games/othello/_othello.js - the logic for this game
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax, jax games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   name   : othello
   author : Kroc Camen | kroccamen@gmail.com | kroc.deviantart.com
   type   : board game
   desc   : also known in America as 'Reversi', and sometimes 'Turncoat'.
            each player is in competition to have the most pieces remaining at the end.
            the straight forward nature of this game makes it an ideal sample for programming your own Jax Games
            
rules of play:
--------------
 + each player takes turn to place a single piece on the board. you must place a piece on an empty square, adjacent to an
   opponent's piece, whereby another one of your own pieces is within line-of-sight (in one or more of the eight directions)
   the opponents pieces then become yours and play changes sides
 + the winner is the player with the most pieces when neither player can place or when the opponent has no pieces remaining.
 
-------------------------------------------------------------------------------------------------------------------------- */

//add to the Player class the ability to set who plays white "O" and who plays black "X"
Player.prototype.piece = "";

//create the players. they must use these names, as they are referenced in shared.js. the reason the Player instances are not
//created automatically for you, is because you could extend the Player class to include a constructor function requiring
//parameters. an example of this can be seen in /games/blacjax/classes.js
var playerMe   = new Player (),  //the player on this computer
    playerThem = new Player ()   //the opponent is always the opposite player from either end
;

/* =======================================================================================================================
   OBJECT game : this game
   ======================================================================================================================= */
var game = {
        name    : "Othello",  //a user-seen name for your game. required, as used in shared.js
        version : "0.3.0",
        
        board   : new Board ("game-board"),  //the game board (default size of 8x8 will be used), see board.js
        pieces  : [],                        //the layout of pieces on the board
        
        templates : {
                //the player's black or white piece icon on the paper at the sides
                paper_piece : new Template (
                        '<img src="images/#{colour}.png" width="40" height="40" alt="#{colour}" />'
                )
        },
        
        /* ===============================================================================================================
           OBJECT pages - show/hide actions for the screens in the game (title screen, game screen, rules screen &c)
           =============================================================================================================== */
        pages : [{
                name : "title",
                show : function () {
                        var menuItemHover = function () {  //private function for mouse over menu item
                                //loop over each image in the link and show them (the black and white pieces)
                                this.immediateDescendants ().each (function(e_item){ e_item.show (); });
                        },  menuItemOut = function () {    //private function for mouse over menu item
                                //loop over each image in the link and hide them
                                this.immediateDescendants ().each (function(e_item){ e_item.hide (); });
                        },  menuItemClick = function () {  //private function for menu item click
                                //remove the focus rectangle around the link
                                this.blur ();
                                //remove the mouse events for everything else (so that the animation doesn't hide if you
                                //mouse out, nor are you able to click on another menu item). loop over each hyperlink
                                //in the menu...
                                $("title-menu").immediateDescendants ().each (function(e_item){
                                        //remove mouse events
                                        e_item.onmouseover = Prototype.emptyFunction;
                                        e_item.onmouseout  = Prototype.emptyFunction;
                                        e_item.onclick     = Prototype.emptyFunction;
                                });
                                
                                //animate the white pieces either side the menu item 'flipping' over to black pieces:
                                var anims = [];
                                //loop over each image in the link (4)...
                                this.immediateDescendants ().each (function(e_menu){
                                        //if this image is white, zoom out... black, zoom in
                                        var piece = e_menu.hasClassName ("white");
                                        //add the animation to an array awaiting parallel animation
                                        anims.push (new Effect.Puff (e_menu, {
                                                sync        : true,
                                                transition  : (piece ? Effect.Transitions.linear : Effect.Transitions.reverse),
                                                afterFinish : function() {
                                                        if (piece) {e_menu.hide ();} else {e_menu.show ();}
                                                }
                                        }));
                                });
                                //run the animation
                                new Effect.Parallel (anims, {duration:0.4, afterFinish:function(){
                                        //which menu item was clicked?
                                        switch (this.id) {
                                                case "title-start-game":
                                                        shared.events.titleStartGameClick ();
                                                        shared.showPage ("title");
                                                        break;
                                                        
                                                case "title-join-game":
                                                        shared.events.titleJoinGameClick ();
                                                        shared.showPage ("title");
                                                        break;
                                                        
                                                case "title-rules":
                                                        //!/TODO: rules page
                                                        break;
                                        }
                                }.bind(this)});
                        };
                        //prepare the menu items: loop over each menu link
                        $("title-menu").immediateDescendants ().each (function(e_item){
                                //apply mouse events (as you've seen above)
                                e_item.onmouseover = menuItemHover;
                                e_item.onmouseout  = menuItemOut;
                                e_item.onclick     = menuItemClick;
                                //hide the white/black pieces to begin with
                                e_item.immediateDescendants ().each (function(e_item){
                                        e_item.hide ();
                                });
                        });
                        
                        //animate the title screen
                        game.events.clouds.start ();
                },
                hide : function () {
                        //stop title screen animation
                        game.events.clouds.stop ();
                }
        }, {
                name : "game"
        }],
        
        /* > load : called for you on page load (see shared.js)
           =============================================================================================================== */
        load : function () {
                //set the icons for the players that will be used in this game (replacing the default Blue vs. Red ones)
                shared.icons.host     = "images/iconblack.png";
                shared.icons.opponent = "images/iconwhite.png";
                //create the empty board
                this.board.injectHTML ();
                
                //prepare the menu items: loop over each menu link
                $("title-menu").immediateDescendants ().each (function(e_item){
                        //insert 2 white / 2 black pieces into each link
                        new Insertion.Top (e_item,
                                '<image src="images/black.png" width="40" height="40" class="left black" /><img src="images'+
                                '/white.png" width="40" height="40" class="left white" style="position:absolute;left:136px;'+
                                '" /><img src="images/white.png" width="40" height="40" class="right white" style="position'+
                                ':absolute;left:336px;" /><image src="images/black.png" width="40" height="40" class="right'+
                                ' black" />'
                        );
                });
                
                //?/debug: leap straight into the game screen
                /*shared.showPage ("game"); this.start (true);*/
        },
        
        /* > start : begin playing
           ===============================================================================================================
           params * (b_mefirst) : who begins play (yourself, or the opponent)
           =============================================================================================================== */
        start : function (b_mefirst) {
                //please note: this function is called for you. when the user clicks the Start Game or Join Game button after
                //entering their name / join key, `shared.(start/join)Connection` is called. when a connection is established
                //between the two players, `game.start` is called for you
                if (typeof b_mefirst == "undefined") {b_mefirst = shared.host;}  //default: host goes first
                
                shared.setTitle (playerMe.name+" v. "+playerThem.name+" - ");
                shared.setPlayerStatus ();
                shared.headsup.hide ();
                
                //set which piece each player is using. the host always plays black, and goes first
                playerMe.piece   = (shared.host) ? "X" : "O";
                playerThem.piece = (shared.host) ? "O" : "X";
                //put your/their piece in the piece-count sections (the paper)
                $("game-paper-me-piece").update (this.templates.paper_piece.evaluate({colour:shared.host?"black":"white"}));
                $("game-paper-them-piece").update (this.templates.paper_piece.evaluate({colour:shared.host?"white":"black"}));
                
                //blank the two dimensional array holding the location of the pieces on the board
                this.pieces = create2DArray (game.board.width, game.board.height, "");
                                
                //put in the starting pieces
                this.pieces[3][3] = "O";
                this.pieces[4][3] = "X";
                this.pieces[3][4] = "X";
                this.pieces[4][4] = "O";
                //?/this.pieces = [["O","X","","X","X","X","X","X"],["O","X","X","","O","O","X","X"],["X","O","X","O","X","X","X","X"],["X","X","O","X","O","X","X","X"],["X","X","X","X","O","X","X","X"],["X","X","X","O","X","O","X","X"],["X","X","O","X","X","X","X","X"],["X","X","X","X","X","X","O","O"]];
                this.updateBoard ();
                
                //reset the piece counters to 2 a piece
                $("game-paper-me-pieces").innerHTML   = "2";
                $("game-paper-them-pieces").innerHTML = "2";
                
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
                for (var y=0; y<this.board.height; y++) { for (var x=0; x<this.board.width; x++) {
                        //get the html element for this cell
                        var e = $(this.board.getCellId(x,y));
                        //remove the hover effect from any cells
                        e.removeClassName ("hover");
                        //remove mouse events from any cells
                        e.onclick     = Prototype.emptyFunction;
                        e.onmouseover = Prototype.emptyFunction;
                        e.onmouseout  = Prototype.emptyFunction;
                        
                        //update the html for the cell (in memory)
                        this.board.cells[x][y] = (this.pieces[x][y] == "") ? "" : '<img width="40" height="40" src="images/'+
                                                 (this.pieces[x][y]=="X"?'black.png" alt="black':'white.png" alt="white')+'" />'
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
                
                //find playable moves (loop all cells in the table...)
                for (var y=0; y<this.board.height; y++) { for (var x=0; x<this.board.width; x++) {
                        //is this your piece?
                        if (this.pieces[x][y] == playerMe.piece) {
                                //check all 8 directions...
                                for (var dir=0; dir<8; dir++) {
                                        //test this direction for a possible playable move
                                        var result = this.findBridge (true, x, y, dir);
                                        //if there is a move...
                                        if (result) {
                                                //put a mark in the cell to show it as playable
                                                var e = $(this.board.getCellId(result.x, result.y));
                                                e.innerHTML = '<img src="images/spot.png" width="3" height="3" alt="Click '+
                                                              'to place your piece here" />'
                                                ;
                                                //make the empty cell clickable so you can choose that square
                                                //see `game.events` further down to continue following program flow
                                                e.onclick     = this.events.playableCellClick;
                                                //when you hover over the cell
                                                e.onmouseover = this.events.playableCellMouseOver;
                                                e.onmouseout  = this.events.playableCellMouseOut;
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
                    object       : {
                                           n_x : x coordinate of the matched cell
                                           n_y : y coordinate of the matched cell
                                   }
           =============================================================================================================== */
        findBridge : function (b_self, n_x, n_y, n_dir, f_piece, b_reverse, n_distance) {
                /* this function will traverse the board in a given direction, checking for:
                   1) b_reverse = false, this function will continue to check cells in the specified direction until
                      an empty cell is found. in othello, you must place a piece so that it comes between any number of
                      opponent pieces and one of your own. this function will return an object with the x and y coordinates
                      of the playable cell found, otherwise false
                   2) b_reverse = true, used to backtrack from an empty cell, over opponent pieces, to one of your pieces.
                      this is used when you click on a playable cell, to then flip the opponent pieces along the way
                *//*
                   if a callback function is provided as f_piece, it will be called on each opponent piece encountered along
                   the way - *only if the specified direction turns out to be playable*. therefore you do not need to check
                   beforehand if the direction is playable, before using this function with the callback. examples of use in
                   this game are: flipping the pieces over and highlighting the cells on mouseover
                */
                if (!n_distance) {n_distance = 0;}                        //default: start counting number of steps
                if (!f_piece)    {f_piece    = Prototype.emptyFunction;}  //default: no callback
                
                var piece_me   = (b_self) ? playerMe.piece : playerThem.piece,  //are you playing white or black?
                    piece_them = (b_self) ? playerThem.piece : playerMe.piece,  //and conversely...
                    new_x      = n_x + this.board.directions[n_dir].x,          //x location after step forward
                    new_y      = n_y + this.board.directions[n_dir].y           //y location after step forward
                ;
                //is the next step out of range?
                if ((new_x >= 0 && new_x < this.board.width) && (new_y >= 0 && new_y < this.board.height)) {
                        switch (this.pieces[new_x][new_y]) {
                                //if the next square is the opponents, keep searching
                                case piece_them:
                                        //get the result of proceeding to the next sqaure
                                        var result = this.findBridge (b_self, new_x, new_y, n_dir, f_piece, b_reverse, n_distance+1);
                                        //if this direction yields a playable square then this function will fold back down
                                        //the recursion, executing the callback function for each cell
                                        if (result) {
                                                //call the callback for this piece
                                                f_piece (n_dir, new_x, new_y, n_distance);
                                        }
                                        //fold back to the previous recursive call of this function (reverse march!)
                                        return result;
                                        
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
                var piece     = (b_self) ? playerMe.piece : playerThem.piece,
                    centre_id = this.board.getCellId (n_x,n_y),
                    anims     = []
                ;
                //set your piece to the specified cell
                this.pieces[n_x][n_y] = piece;
                
                //search all directions for bridges built, and change the pieces between into your own
                for (var dir=0; dir<8; dir++) {
                        //flip each piece in each direction that yields a valid move
                        this.findBridge (b_self, n_x, n_y, dir, function(n_dir,n_x,n_y,n_dist){
                                //set the piece to this cell
                                this.pieces[n_x][n_y] = piece;
                                //queue the cell for animation
                                anims.push (this.board.getCellId(n_x,n_y));
                                //?/this.updateBoard ();
                        }.bind(this), true);
                }
                //loop over each cell in the queue...
                anims.each (function(s_item){
                        //...and animate the pieces being flipped
                        this.flipPiece (s_item, piece);
                }.bind(this));
                //animate in the original piece this function was called for. this 
                this.flipPiece (centre_id, piece);
                //wait until all peices have flipped before continuing
                new Effect.Event ({queue:{position:'end', scope:'flipPiece'}, afterFinish:function(){
                        //preempt the next move
                        this.preempt (!b_self);
                }.bind(this)});
        },
        
        /* > flipPiece : animate in, or flipping over a piece on the board
           ===============================================================================================================
           params * s_htmlid     : html id of the element containing the image to flip
                    (s_piece)    : the piece ("X" or "O") to place if the cell specified is empty
                    (f_callback) : function to call after the flip animation is complete
           =============================================================================================================== */
        flipPiece : function (s_htmlid, s_piece, f_callback) {
                if (!f_callback) {f_callback = Prototype.emptyFunction;}  //default: no callback
                
                var e = $(s_htmlid);
                if (e.innerHTML == "") {
                        var piece = (s_piece == "X" ? "black" : "white");
                        new Effect.Event ({afterFinish:function(){
                                new Insertion.Top (e, '<image src="images/'+piece+'.png" width="40" height="40" alt="'+piece+'" />');
                                var e2 = e.down ();
                                new Effect.Puff (e2, {transition:Effect.Transitions.reverse, duration:0.4, afterFinish:function(){
                                        e2.show ();
                                        f_callback ();
                                }, queue:{position:'end',scope:'flipPiece'}});
                        }, queue:{position:'end',scope:'flipPiece'}});
                } else {
                        var e1      = e.down (),
                            flip_to = (e1.alt == "white") ? "black" : "white"
                        ;
                        new Insertion.After (e1, '<image src="images/'+flip_to+'.png" width="40" height="40" alt="'+flip_to+'" />');
                        var e2 = e1.next ();
                        new Effect.Parallel ([
                                new Effect.Puff (e1, {sync:true, beforeStart:function(o_effect){
                                        o_effect.render ();
                                }}),
                                new Effect.Puff (e2, {sync:true, transition: Effect.Transitions.reverse, afterFinish:function(){
                                        e2.show ();
                                        e1.remove ();
                                }})
                        ], {
                                duration    : 0.4,
                                queue       : {position:'end',scope:'flipPiece'},
                                afterFinish : function(){
                                        f_callback ();
                                }
                        });
                }
        },
        
        /* > preempt : switch players, but preempt the rare occassion of not being able to take a turn
           ===============================================================================================================
           params * b_self : if you or them should be checked (true = you)
           =============================================================================================================== */
        preempt : function (b_self) {
                //the player's piece (X or O)
                var piece          = (b_self ? playerMe : playerThem).piece,
                    count          = {
                            moves  : 0,  //number of playable moves on the board (for the player specified)
                            me     : 0,  //number of squares occupied by you
                            them   : 0,  //number of squares occupied by them
                            spaces : 0   //number of empty squares on the board
                    }
                ;
                //check for available moves (loop all cells in the table...)
                for (var y=0; y<this.board.height; y++) { for (var x=0; x<this.board.width; x++) {
                        //count this cell (the totals are used to determine the winner)
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
                
                //if there is no spaces left, someone has won
                if (!count.spaces) {
                        //TODO: draw condition
                        //(count.me>count.them) will return true if you win, false if they win
                        this.end ((count.me>count.them));
                        
                } else if (!count.me || !count.them) {
                        //if either player has no pieces left, they've been wiped out
                        //(count.me>0) will return true if you have any pieces left, false if not
                        this.end ((count.me>0));
                        
                } else if (!count.moves) {
                        //if there are no playable moves, skip go
                        shared.headsup.show ("No available moves, turn skipped", 2);
                        //TODO: apparently there is a rare condition where neither player can play
                        this.preempt (!b_self);
                        
                } else if (b_self) {
                        //your go
                        this.playTurn ();
                        
                } else {
                        //other player's go
                        shared.setPlayerStatus ("<p>Other Player's Turn, Please Wait&hellip;</p>");
                }
        },
        
        /* > endGame : play is complete, someone won or lost
           ===============================================================================================================
           params * b_winner : if you are the winner or not
           =============================================================================================================== */
        end : function (b_winner) {
                //!/TODO: this
                var html = '<a href="javascript:game.playAgain('+b_winner+');">Play Again?</a> ' +
                           '<a href="javascript:game.resign();">Resign</a></p>',
                   winner = b_winner ? playerMe : playerThem,
                   loser  = b_winner ? playerThem : playerMe
                ;
                //increase the number of games played
                shared.played ++;
                shared.setTitle ((b_winner?"YOU WIN":"YOU LOSE ")+" - ");
                shared.headsup.show ((b_winner?"YOU WIN":"YOU LOSE ")+"<br />"+html);
                //update the player info display
                winner.wins ++;
                $("player-status-me-wins").innerHTML   = playerMe.wins;
                $("player-status-them-wins").innerHTML = playerThem.wins;
                
                //listen out for the "play again" signal from the other person
                jax.listenFor("game_again", function(o_response){
                        jax.listenFor ("game_again");
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
                this.start (!b_winner);
        },
        
        resign : function () {
                jax.disconnect ({reason: "unload"});
                shared.setPlayerStatus ();
                shared.headsup.hide ();
                shared.setSystemStatus ();
        }
};

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
game.events = {
        /* > playableCellClick : when you click on a cell to make a move 
           =============================================================================================================== */
        playableCellClick : function () {
                for (var y=0; y<game.board.height; y++) { for (var x=0; x<game.board.width; x++) {
                        //get the html element for this cell
                        var e = $(game.board.getCellId(x,y));
                        if (game.pieces[x][y] == "" && e.innerHTML != "") {
                                e.update ();
                                //remove mouse events from any cells
                                e.onclick     = Prototype.emptyFunction;
                                e.onmouseover = Prototype.emptyFunction;
                                e.onmouseout  = Prototype.emptyFunction;
                        }
                        //remove the hover effect from any cells
                        e.removeClassName ("hover");
                } }
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
                //refer this to a function to handle both states
                game.events.playableCellMouseHover (this.id, true);
        },
        
        /* > playableCellMouseOut : when you move the mouse out of a playable cell
           =============================================================================================================== */
        playableCellMouseOut : function () {
                //refer this to a function to handle both states
                game.events.playableCellMouseHover (this.id, false);
        },
        
        /* > playableCellMouseHover : when you hover over an available cell
           ===============================================================================================================
           params * s_cellid    : html element id of the cell to highlight from
                    b_highlight : whether to highlight the cells, or remove existing highlighting
           =============================================================================================================== */
       playableCellMouseHover : function (s_cellid, b_highlight) {
               var position = game.board.getCoordsFromId (s_cellid),  //get the x/y location of the cell passed
                   cells    = []                                      //array of cells to highlight
               ;
               //the initial cell will be highlighted
               cells.push (position);
               //proceed checking for playable moves in the eight directions
               for (var dir=0; dir<8; dir++) {
                       //run a function for each cell traversed in the process (if the direction is a valid move)
                       var result = game.findBridge (true, position.x, position.y, dir, function(n_dir,n_x,n_y,n_dist){
                               //add this cell's location to the array of cells to highlight. this callback function is
                               //only called on cells from a direction yielding a valid move
                               cells.push ({x: n_x, y: n_y});
                       }, true);
                       if (result) {cells.push (result);}
               }
               //turn each of the cell locations into the element reference for that cell
               cells.collect (function(o_cell){
                       //given the x, y of a the cell, return the element reference
                       return $(game.board.getCellId(o_cell.x, o_cell.y));
               }).invoke (
                       //depending whether highlighting is being enabled or not, invoke "addClassName" or "removeClassName"
                       //function on each of the html elements in the array using the .hover CSS class (see game.css)
                       (b_highlight?"add":"remove")+"ClassName", "hover"
               );
       },
       
       /* OBJECT > clouds : the clouds on the title screen
          ================================================================================================================ */
       clouds : {
               /* start : start the animation, and keep it going
                  ======================================================================================================== */
               start : function () {
                       //move the cloud back (there's two side by side)
                       new Effect.Move ("title-cloud", {
                               x           : -501,
                               y           : 0,
                               duration    : 60,
                               mode        : 'absolute',
                               transition  : Effect.Transitions.linear,           //do not speed-up/slow-down at start/end
                               queue       : {position: 'end', scope: 'clouds'},  //reference it (to be able to cancel)
                               afterFinish : function(){
                                       //move the cloud back to the starting position
                                       Effect.MoveBy ("title-cloud", 0,0,{mode:'absolute',duration:0,queue:{position:'end',scope:'clouds'}});
                                       //repeat the animation
                                       game.events.clouds.start ();
                               }
                       });
               },
               
               /* stop : stop the animation
                  ======================================================================================================== */
               stop : function () {
                       //get the animation queue for the clouds
                       var queue = Effect.Queues.get ('clouds');
                       //cancel each animation in the queue
                       queue.each (function(o_item){o_item.cancel ();});
               }
       } //end game.events.clouds <
};

//=== end of line ===========================================================================================================