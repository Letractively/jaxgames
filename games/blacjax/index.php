<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- ====================================================================================================================
     blacjax - copyright (c) Kroc Camen 2005-2007
     ==================================================================================================================== -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB">
<head>
	<?php include ("../-/inc/head.html");?>
	<!-- === this game ============================================================================================== -->
	<link rel="stylesheet" type="text/css" href="game.css" /><!-- ........... styles for this game .................. -->
	<script type="text/javascript" src="../../js/cards.js">/* ............... playing cards classes ......... */</script>
	<script type="text/javascript" src="classes.js">/* ...................... game classes .................. */</script>
	<script type="text/javascript" src="game.js">/* ......................... game logic .................... */</script>
</head>
<body><div id="body">
	<h1><span>Blacjax</span></h1>
	<div id="shared-gamearea">
		<!-- === title = title screen, start or join a game ===================================================== -->
		<div id="page-title">
			<p><a id="title-start-game" href="#page-user">Start Game</a></p>
			<p><a id="title-join-game" href="#page-user">Join Game</a></p>
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
		        <div id="game-label" style="display: none;"></div>
			<div id="game-face"></div>
			<div id="game-deck"></div>
			<div id="game-penalty"></div>
			<div id="game-farhand"></div>
			<div id="game-nearhand"></div>
		</div>
		<!-- === common game elements =========================================================================== -->
		<div id="player-status-them" class="player-status">
		        <div id="player-status-them-info" class="player-info">
		                <div id="player-status-them-win"><img src="../-/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /> <strong>Wins:</strong> <span id="player-status-them-wins">0</span></div>
		                <div id="player-status-them-score"><img src="../-/icons/coins.png" width="16" height="16" align="top" alt="Points" /> <strong>Points:</strong> <span id="player-status-them-points">0</span></div>
			        <span id="jax-game-p2name" class="player-name">Player 2</span> <img src="../-/icons/user_red.png" id="jax-game-p2icon" width="16" height="16" alt="User Icon" align="top" />
			</div>
		</div>
		<div id="player-status-me" class="player-status">
		        <div id="player-status-me-info" class="player-info">
		                <div id="player-status-me-win"><strong>Wins:</strong> <span id="player-status-me-wins">0</span> <img src="../-/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /></div>
		                <div id="player-status-me-score"><strong>Points:</strong> <span id="player-status-me-points">0</span> <img src="../-/icons/coins.png" width="16" height="16" align="top" alt="Points" /></div>
			        <img src="../-/icons/user.png" id="jax-game-p1icon" width="16" height="16" alt="User Icon" align="top" /> <span id="jax-game-p1name" class="player-name">Player 1</span>
			</div><div id="player-status-me-msg" class="player-msg" style="display: none;">
			        &nbsp;
			</div>
		</div>
	</div>
	<?php include ("../-/inc/footer.html")?>
</div></body>
<!-- === end of line ============================================================================================= --></html>