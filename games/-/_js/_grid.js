/* =======================================================================================================================
   js/_grid.js - create and manage a game grid/board
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   css guide:
   ----------
   when you create an instance of the grid class, you must provide the ID of an HTML element that currently exists (ideally
   a <div>) that the grid table will be injected into. the grid will use the following HTML IDs for the various table
   elements, where 'element' is the HTML ID you created the grid class with.
   
   where `var grid = new Grid ('element');`:
   <table> = #element-table    (class: .grid)
   <col>   = #element-col-X    (where X is column number - 1, 2, 3 &c)
   <tr>    = #element-row-Y    (where Y is the row number 1 to number of rows)
   <td>    = #element-cell-XxY (where X is the column number and Y is the row number. e.g. #element-cell-3x6)
*/
var Grid = Class.create ({
        element : "",  //HTML ID to inject the grid into
        width   : 0,   //number of columns in the table
        height  : 0,   //number of rows
        cells   : [],  //an array of HTML content to go in each cell (as a two dimensional array, e.g. [x][y])
        
        //this is a set of vectors to move in the eight directions. you can use this in your own logic to traverse the 
        //grid for your own reasons. refer to othello for good examples. it isn't used internally at all
        directions : [
                {x:  0, y: -1},  //0 - up
                {x:  1, y: -1},  //1 - right-up
                {x:  1, y:  0},  //2 - right
                {x:  1, y:  1},  //3 - right-down
                {x:  0, y:  1},  //4 - down
                {x: -1, y:  1},  //5 - left-down
                {x: -1, y:  0},  //6 - left
                {x: -1, y: -1}   //7 - left-up
        ],
        
        /* > intialize : constructor function
           ===============================================================================================================
           params * s_element  : HTML element ID to inject the grid into
                    (n_width)  : width of the grid in cells (1-based). default: 8
                    (n_height) : height of the grid in cells (1-based). default: 8
           =============================================================================================================== */
        initialize : function (s_element, n_width, n_height) {
                if (!n_width)  {n_width  = 8;}  //default: eight squares wide
                if (!n_height) {n_height = 8;}  //default: eight squares high
                
                this.element = s_element;
                this.width   = n_width;
                this.height  = n_height;
                
                //create the two-dimensional array to store HTML content for each cell. e.g. cells[x][y] = "blah";
                this.clear ();
        },
        
        /* > clear: empty the grid
           =============================================================================================================== */
        clear : function () {
                //create the two dimensional array to represent the html content of each cell
                this.cells = create2DArray (this.width, this.height, "");
        },
        
        /* > injectHTML : inserts the initial empty html table for the grid
           =============================================================================================================== */
        injectHTML : function () {
                //this function cannot be called in `initialize` because HTML cannot be editied before the page has 
                //finished loading. you can either call this function when you need it, or it will be called automatically
                //in `display` if the table is not already present
                
                //start the table
                var html = '<table id="'+this.element+'-table" class="grid"><cols>\n';
                //add the cols (so that you can style a whole coulmn in one go)
                for (x=0; x<this.width; x++) {
                        html += '\t\t\t\t<col id="'+this.element+'-col-'+x+'"></col>\n';
                }
                html += '\t\t\t</cols><tbody>\n';
                //loop over each row...
                for (var y=0; y<this.height; y++) {
                        //create the row
                        html += '\t\t\t\t<tr id="'+this.element+'-row-'+y+'">\n';
                        //loop over each column...
                        for (x=0; x<this.width; x++) {
                                //chequer the grid by alternating classes horizontally and vertically
                                var chequer = (y%2 + x%2 == 1) ? "B" : "A";  
                                //create the table cell and put the content in
                                html += '\t\t\t\t\t<td id="'+this.getCellId(x,y)+'" class="'+chequer+'">'+
                                        this.cells[x][y]+'</td>\n'
                                ;
                        }
                        //finish the row
                        html += '\t\t\t\t</tr>\n';
                }
                //finish the table
                html += "\t\t\t</tbody></table>";
                //put the table to screen. the Prototype `update` function is used instead of `innerHTML` so that it will
                //work in IE (which has no `innerHTML` for some elements) also as a bonus for l33t programmers, any <script>
                //blocks in any cells will be executed (but not included)
                $(this.element).update (html);
        },
        
        /* > getCellId : return the HTML element ID for a cell, given the x/y
           ===============================================================================================================
           params * n_x    : x cell reference
                    n_y    : y cell reference
           return * string : HTML element ID of the cell requested 
           =============================================================================================================== */
        getCellId : function (n_x, n_y) {
                return this.element + '-cell-' + n_x + "x" + n_y;
        },
        
        /* > getCoordsFromId : return x/y position given a HTML ID for a cell
           ===============================================================================================================
           params * s_id   : HTML element ID of the cell in question
           return * object : {
                                     x : column of cell
                                     y : row of cell
                             }
           =============================================================================================================== */
        getCoordsFromId : function (s_id) {
                var id  = s_id.split ("-").last (),              //get the cell reference from the cell ID
                    col = parseInt (id.split("x").first(), 10),  //the first reference is the col
                    row = parseInt (id.split("x").last(), 10)    //row is the second reference
                ;
                return {x: col, y: row};
        },
        
        /* > display: refresh the grid
           =============================================================================================================== */
        display : function () {
                //if the element that the grid is (supposed to be) in is empty, create the grid
                if (!$(this.element)) {this.injectHTML ();}
                
                //loop over each row...              //loop over each column...
                for (var y=0; y<this.height; y++) { for (var x=0; x<this.width; x++) {
                        //get the HTML element for this cell (x, y)
                        var e = $(this.getCellId(x,y));
                        //if the HTML in the cell is not the same as in memory, update it
                        if (e.innerHTML != this.cells[x][y]) {e.update (this.cells[x][y]);}
                } }
        }
});
   
//=== end of line ===========================================================================================================