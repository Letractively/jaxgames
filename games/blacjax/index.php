<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- ====================================================================================================================
     blacjax - copyright (c) Kroc Camen 2005-2007
     ==================================================================================================================== -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB">
<head>
	<?php include ("../-/inc/head.html");?>
	<!-- === this game ============================================================================================== -->
	<link rel="stylesheet" type="text/css" href="game.css" /><!-- ........... styles for this game .................. -->
</head>
<body><div id="body">
	<h1><span>Blacjax</span></h1>
	<div id="cache">
		<img src="../-/img/cards/place.png" width="71" height="96" alt="place" />
		<img src="../-/img/cards/cards.png" width="994" height="384" alt="cards" />
	</div>
	<div id="shared-gamearea">
		<!-- === title = title screen, start or join a game ===================================================== -->
		<div id="page-title" style="display:none;">
			<p><a id="title-start-game" href="#">Start Game</a></p>
			<p><a id="title-join-game" href="#">Join Game</a></p>
		</div>
		<!-- === game = the main game display =================================================================== -->
		<div id="page-game" style="display:none;">
		        <div id="game-label" style="display:none;"></div>
			<div id="game-discard"></div>
			<div id="game-deck"></div>
			<div id="game-penalty"></div>
			<div id="game-farhand"></div>
			<div id="game-nearhand"></div>
		</div>
		<!-- === common game elements =========================================================================== -->
		<div id="player-status-them" class="player-status" style="display:none;">
		        <div id="player-status-them-info" class="player-info">
		                <div id="player-status-them-win"><img src="../-/img/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /> <strong>Wins:</strong> <span id="player-status-them-wins">0</span></div>
		                <div id="player-status-them-score"><img src="../-/img/icons/coins.png" width="16" height="16" align="top" alt="Points" /> <strong>Points:</strong> <span id="player-status-them-points">0</span></div>
			        <span id="player-them-name" class="player-name">Player 2</span> <img src="../-/img/icons/user_red.png" id="player-them-icon" width="16" height="16" alt="User Icon" align="top" />
			</div>
		</div>
		<div id="player-status-me" class="player-status" style="display:none;">
		        <div id="player-status-me-info" class="player-info">
		                <div id="player-status-me-win"><strong>Wins:</strong> <span id="player-status-me-wins">0</span> <img src="../-/img/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /></div>
		                <div id="player-status-me-score"><strong>Points:</strong> <span id="player-status-me-points">0</span> <img src="../-/img/icons/coins.png" width="16" height="16" align="top" alt="Points" /></div>
			        <img src="../-/img/icons/user.png" id="player-me-icon" width="16" height="16" alt="User Icon" align="top" /> <span id="player-me-name" class="player-name">Player 1</span>
			</div><div id="player-status-me-msg" class="player-msg" style="display:none;">
			        &nbsp;
			</div>
		</div>
	</div>
	<?php include ("../-/inc/footer.html");?>
	<script type="text/javascript" src="game.js">/* ......................... game logic .................... */</script>
</div></body>
<!-- === end of line ============================================================================================= --></html>