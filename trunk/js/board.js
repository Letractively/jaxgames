/* =======================================================================================================================
   js/board.js - create and manage a game board
   ======================================================================================================================= */
var Board = Class.create ();
Board.prototype = {
        element : "",  //html id to inject the board into
        width   : 0,   //number of columns in the table
        height  : 0,   //number of rows
        cells   : [],  //an array of html content to go in each cell (as a two dimensional array, e.g. [x][y])
        
        /* > intialize : constructor function
           ===============================================================================================================
           params * s_element : html element id to inject the board into
                    n_width   : width of the board in cells (1-based)
                    n_height  : height of the board in cells (1-based)
           =============================================================================================================== */
        initialize : function (s_element, n_width, n_height) {
                if (!n_width)  {n_width  = 8;}  //default: eight squares wide
                if (!n_height) {n_height = 8;}  //default: eight squares high
                
                this.element = s_element;
                this.width   = n_width;
                this.height  = n_height;
                
                //create the two-dimensional array to store html content for each cell. e.g. cells[x][y] = "blah";
                this.clear ();
        },
        
        /* > clear: empty the board
           =============================================================================================================== */
        clear : function () {
                //create the two dimensional array to represent the html content of each cell
                //index 0 of each row/column is not actually used. the table is 1-based (so that the top left cell is
                //'this.cells[1][1]' and not [0][0]). this is done so your own code is simpler and more direct
                this.cells = new Array (this.width);
                for (var x=1; x<=this.width; x++) {
                        this.cells[x] = new Array (this.height);
                        for (var y=1; y<=this.height; y++) {this.cells[x][y] = "";}
                }
        },
        
        /* > injectHTML : inserts the initial empty html table for the board
           =============================================================================================================== */
        injectHTML : function () {
                //this function cannot be called in initialize() because html cannot be editied before the page has 
                //finished loading. you can either call this function when you need it, or it will be called automatically
                //in display() if the table is not already present
                
                //start the table
                var html = '<table id="'+this.element+'-table" class="board"><tbody>\n';
                //loop over each row...
                for (var y=1; y<=this.height; y++) {
                        //create the row
                        html += '\t\t\t\t<tr id="'+this.element+'-row-'+y+'" class="row">\n';
                        //loop over each column...
                        for (var x=1; x<=this.width; x++) {
                                //chequer the board by alternating classes horizontally and vertically
                                var chequer = (y%2 + x%2 == 1) ? "B" : "A";  
                                //create the table cell and put the content in
                                html += '\t\t\t\t\t<td id="'+this.getCell(x,y)+'" class="cell '+chequer+'">'+
                                        this.cells[x][y]+'</td>\n'
                                ;
                        }
                        //finish the row
                        html += '\t\t\t\t</tr>\n';
                }
                //finish the table
                html += "\t\t\t</tbody></table>";
                //put the table to screen
                $(this.element).innerHTML = html;
        },
        
        /* > getCell : return the html element id for a cell, given the x/y
           ===============================================================================================================
           params * n_x  : x cell reference
                    n_y  : y cell reference
           return * s_id : html element id of the cell requested 
           =============================================================================================================== */
        getCell : function (n_x, n_y) {
                //'String.fromCharCode' is used to get the letter for the column number (e.g. 1=A, 2=B and so on)
                return this.element + '-cell-' + String.fromCharCode (64+n_x) + n_y;
        },
        
        /* > getCoordsFromId : return x/y position given a html id for a cell
           ===============================================================================================================
           params * s_id : html element id of the cell in question
           =============================================================================================================== */
        getCoordsFromId : function (s_id) {
                var id  = s_id.split ("-").last (),              //get the cell reference from the cell id
                    col = id.substr (0, 1).charCodeAt (0) - 64,  //the first letter is the col, convert A=1, B=2 and so on
                    row = parseInt (id.substr(1))                //row is the second letter onwards (e.g. B15)
                ;
                return {x: col, y: row};
        },
        
        /* > display: refresh the board
           =============================================================================================================== */
        display : function () {
                //if the element that the board is (supposed to be) in is empty, create the board
                if (!$(this.element)) {this.injectHTML ();}
                
                //loop over each row...              //loop over each column...
                for (var y=1; y<=this.height; y++) { for (var x=1; x<=this.width; x++) {
                        //get the html element for this cell (x, y)
                        var e = $(this.getCell (x, y));
                        //if the html in the cell is not the same as in memory, update it
                        if (e.innerHTML != this.cells[x][y]) {e.innerHTML = this.cells[x][y];}
                } }
        }
};
   
//=== end of line ===========================================================================================================
//licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
//jax, jax games (c) copyright Kroc Camen 2005-2007