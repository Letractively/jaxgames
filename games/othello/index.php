<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- ====================================================================================================================
     othello - copyright (c) Kroc Camen 2006, 2007
     ==================================================================================================================== -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB">
<head>
	<?php include ("../-/inc/head.html");?>
	<!-- === this game ============================================================================================== -->
	<link rel="stylesheet" type="text/css" href="game.css" /><!-- ........... styles for this game .................. -->
</head>
<body><div id="body">
	<h1><span>Othello</span></h1>
	<div id="shared-gamearea">
		<!-- === title = title screen, start or join a game ===================================================== -->
		<div id="page-title" style="display:none;">
			<div id="title-clouds"><div id="title-cloud"></div></div>
			<div id="title-fg">
				<div id="title-board">
					<img id="title-logo" src="images/titlelogo.png" width="450" height="80" alt="Othello" />
					<p id="title-menu">
						<a id="title-start-game" href="#">Start Game</a>
						<a id="title-join-game" href="#">Join Game</a>
						<!-- <a id="title-rules" href="#page-rules">Rules</a> -->
					</p>
				</div>
			</div>
		</div>
		<!-- === game = the main game display =================================================================== -->
		<div id="page-game" style="display:none;">
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
		<div id="player-status-them" class="player-status" style="display:none;">
			<div id="player-status-them-info" class="player-info">
				<div id="player-status-them-win"><img src="../-/img/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /> Wins: <span id="player-status-them-wins">0</span></div>
				<span id="player-them-name" class="player-name">Player 2</span> <img src="../-/img/icons/user_red.png" id="player-them-icon" width="16" height="16" alt="User Icon" align="top" />
			</div>
		</div>
		<div id="player-status-me" class="player-status" style="display:none;">
			<div id="player-status-me-info" class="player-info">
				<div id="player-status-me-win">Wins: <span id="player-status-me-wins">0</span> <img src="../-/img/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /></div>
				<img src="../-/img/icons/user.png" id="player-me-icon" width="16" height="16" alt="User Icon" align="top" /> <span id="player-me-name" class="player-name">Player 1</span>
			</div><div id="player-status-me-msg" class="player-msg" style="display:none;">
				&nbsp;
			</div>
		</div>
	</div>
	<?php include ("../-/inc/footer.html")?>
	<script type="text/javascript" src="game.js">/* ......................... game logic .................... */</script>
</div></body>
<!-- === end of line ============================================================================================= --></html>