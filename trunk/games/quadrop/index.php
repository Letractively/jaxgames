<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- ====================================================================================================================
     quadrop - copyright (c) Kroc Camen 2007
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
	<h1><span>Quadrop</span></h1>
	<div id="shared-gamearea">
		<!-- === title = title screen, start or join a game ===================================================== -->
		<div id="page-title">
			<p><a id="title-start-game" href="#">Start Game</a></p>
			<p><a id="title-join-game" href="#">Join Game</a></p>
		</div>
		<!-- === game = the main game display =================================================================== -->
		<div id="page-game">
			<div id="game-grid"></div>
		</div>
		<!-- === common game elements =========================================================================== -->
		<div id="player-status-them" class="player-status" style="display:none;">
			<div id="player-status-them-info" class="player-info">
				<div id="player-status-them-win"><img src="../-/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /> Wins: <span id="player-status-them-wins">0</span></div>
				<span id="player-them-name" class="player-name">Player 2</span> <img src="../-/icons/user_red.png" id="player-them-icon" width="16" height="16" alt="User Icon" align="top" />
			</div>
		</div>
		<div id="player-status-me" class="player-status" style="display:none;">
		        <div id="player-status-me-info" class="player-info">
		                <div id="player-status-me-win">Wins: <span id="player-status-me-wins">0</span> <img src="../-/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /></div>
			        <img src="../-/icons/user.png" id="player-me-icon" width="16" height="16" alt="User Icon" align="top" /> <span id="player-me-name" class="player-name">Player 1</span>
			</div><div id="player-status-me-msg" class="player-msg" style="display:none;">
			        &nbsp;
			</div>
		</div>
	</div>
	<?php include ("../-/inc/footer.html")?>
</div></body>
<!-- === end of line ============================================================================================= --></html>