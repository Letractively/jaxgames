<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- ====================================================================================================================
     othello - copyright (c) Kroc Camen 2006, 2007
     ==================================================================================================================== -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB">
<head>
	<?php include ("../-/inc/head.html");?>
	<!-- === this game ============================================================================================== -->
	<link rel="stylesheet" type="text/css" href="game.css" /><!-- ........... styles for this game .................. -->
	<script type="text/javascript" src="../../js/board.js">/* ............... game board class .............. */</script>
	<script type="text/javascript" src="game.js">/* ......................... game logic .................... */</script>
</head>
<body><div id="body">
	<h1><span>Othello</span></h1>
	<div id="shared-gamearea">
		<!-- === title = title screen, start or join a game ===================================================== -->
		<div id="page-title">
			<div id="title-clouds"><div id="title-cloud"></div></div>
			<div id="title-fg">
				<div id="title-board">
					<img id="title-logo" src="images/titlelogo.png" width="450" height="80" alt="Othello" />
					<p><a id="title-start-game" href="#page-user"><img src="images/white.png" width="40" height="40" class="left" /><img src="images/white.png" width="40" height="40" class="right" />Start Game</a></p>
					<p><a id="title-join-game" href="#page-user"><img src="images/white.png" width="40" height="40" class="left" /><img src="images/white.png" width="40" height="40" class="right" />Join Game</a></p>
					<p><a id="title-rules" href="#page-rules"><img src="images/white.png" width="40" height="40" class="left" /><img src="images/white.png" width="40" height="40" class="right" />Rules</a></p>
				</div>
			</div>
		</div>
		<!-- === user = let the user enter a name =============================================================== -->
		<div id="page-user">
			<p><a href="javascript:shared.showPage('title');">&laquo; Back</a></p>
			<p><label for="user-nickname">Enter a desired nickname:</label></p>
			<p><input type="text" name="user-nickname" id="user-nickname" maxlength="20" /></p>
			<div id="join-game">
				<p>Paste the key code your friend has given you into the box below to join the game.</p>
				<p><input type="text" name="join-key" id="join-key" size="6" maxlength="6" /></p>
			</div>
			<p><input type="button" id="user-submit" value="Start Game" /></p>
		</div>
		<!-- === game = the main game display =================================================================== -->
		<div id="page-game">
			<div id="game-board"></div>
			<div id="game-paper-me" class="game-paper">
				<div id="game-paper-me-pieces" class="game-paper-pieces"></div>
				<div id="game-paper-me-piece"></div>
			</div>
			<div id="game-paper-them" class="game-paper">
				<div id="game-paper-them-piece"></div>
				<div id="game-paper-them-pieces" class="game-paper-pieces"></div>
			</div>
		</div>
		<!-- === common game elements =========================================================================== -->
		<div id="player-status-them" class="player-status">
			<div id="player-status-them-info" class="player-info">
				<div style="float: left;" id="player-status-them-win"><img src="../-/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /> Wins: <span id="player-status-them-wins">0</span></div>
				<span id="jax-game-p2name" class="player-name">Player 2</span> <img src="../-/icons/user_red.png" id="jax-game-p2icon" width="16" height="16" alt="User Icon" align="top" />
			</div>
		</div>
		<div id="player-status-me" class="player-status">
			<div id="player-status-me-info" class="player-info">
				<div style="float: right; text-align: right;" id="player-status-me-win">Wins: <span id="player-status-me-wins">0</span> <img src="../-/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /></div>
				<img src="../-/icons/user.png" id="jax-game-p1icon" width="16" height="16" alt="User Icon" align="top" /> <span id="jax-game-p1name" class="player-name">Player 1</span>
			</div><div id="player-status-me-msg" class="player-msg" style="display: none;">
				&nbsp;
			</div>
		</div>
	</div>
	<?php include ("../-/inc/footer.html")?>
</div></body>
<!-- === end of line ============================================================================================= --></html>