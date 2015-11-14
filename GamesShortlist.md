# Currently In Production #
  * **Blacjax (British Black Jack)**
> Also known as Crazy 8's or Put Down. A card game similar to Uno, played with standard playing cards. Players have to get rid of all their cards, by matching suit or rank with the card on top of the discard pile. [Wikipedia](http://en.wikipedia.org/wiki/Crazy_Eights)
  * **Othello**
> Originally 'Reversi', invented in 1880 in England, and became massively popular in Japan in the 1970's named Othello (after the Shakesperian play). Players must capture opponent pieces in order to have the most pieces once the board is full. [Wikipedia](http://en.wikipedia.org/wiki/Reversi)

  * **Quadrop (Connect 4)**
> Players take turns placing pieces to achieve four in a row to win. The board has simulated gravity, meaning that players cannot play anywhere, but only on the bottom of an empty column, or on top of pieces already in a column. [Wikipedia](http://en.wikipedia.org/wiki/Connect_Four)


# Suggestions #
Add here suggestions for games suitable for inclusion in Jax Games. Please bear in mind:
  1. Some games are copyrighted, and possibly patented. In most cases, a game extends from original versions hundreds of years old and a differently named clone can be produced.
  1. This is HTML and Javascript, not Flash. Games must be turn based and practical to implement
  1. Not all games translate to web pages very well. There should be an element of strategy, and not just a random factor (like Dice)


  * **Checkers**
> The American version of British Draughts, played on a smaller (and more practical for the Internet) board of 8x8. Players move their pieces to the other side of the board, capturing opponent pieces by jumping over them. [Wikipedia](http://en.wikipedia.org/wiki/Draughts)

  * **Battleships**
> A guessing game whereby the player must sink the battleships hidden in the opponents grid by giving cell references to attack. [Wikipedia](http://en.wikipedia.org/wiki/Battleship_%28game%29)

  * **Chess**
> Doesn't really need a description. [Wikipedia](http://en.wikipedia.org/wiki/Chess)

  * **Blokus**
> A modern puzzle game where players must dispatch of up to 21 unique shapes by placing them so that no sides touch another existing piece. [Wikipedia](http://en.wikipedia.org/wiki/Blokus)

  * **Minesweeper Flags**
> A two player version of Minesweeper as seen on MSN Messenger. The players take turns trying to find the mines. Empty squares reveal a number stating how many mines surround that square [Wikipedia](http://en.wikipedia.org/wiki/Minesweeper_%28computer_game%29)

  * ~~**Jigsaw puzzle**~~
> ~~Maybe a puzzle where the player who can place the most pieces wins? [Wikipedia](http://en.wikipedia.org/wiki/Jigsaw_puzzle)~~

> There is no strategy to this, and would play rather dull, being no more than finding a piece and clicking it, there is no way to game the opponent. Jax Games cannot do real time actions between the players, it is turn based only. (see maze notes below for more details)

  * ~~**Maze**~~
> ~~Each player could start in a corner, moving to the center. This could be used in two ways, I think. The users could compete about who could get to the center first, or they could work together on beating the time (would have to have some kind of global highscore) it takes for them to meet in the middle. [Wikipedia](http://en.wikipedia.org/wiki/Maze)~~

> This is not ideal as the maze would likely be random, and thus provide no strategy. Also any time limit on any game, or timing of the running time is completely unreliable as this is AJAX, and there is no guarantee of the time it takes for the message to be sent, and then received. It is also impossible for both clients to start a timer at exactly the same time, and thus you will not have the same running time on each client. (because one client sends a message to the server queue, and the other client receives it in an indeterminate amount of time). Lastly, Jax cannot provide for any real time gaming elements, it is turn based only because of the indeterminate time for received messages.


