<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- ====================================================================================================================
     othello - copyright (c) Kroc Camen 2006, 2007
     ==================================================================================================================== -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB">
<head>
	<title>Loading...</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<!-- === stylesheets ============================================================================================ -->
	<link rel="stylesheet" type="text/css" href="../../css/global.css" /><!-- styles for all of the site ............ -->
	<link rel="stylesheet" type="text/css" href="../../css/shared.css" /><!-- styles for all of the games ........... -->
	<link rel="stylesheet" type="text/css" href="game.css" /><!-- ........... styles for this game .................. -->
	<!-- === libraries ============================================================================================== -->
	<script type="text/javascript" src="../../js/boot.js">/* ................ include all base libraries .... */</script>
	<script type="text/javascript" src="../../js/board.js">/* ............... game board class .............. */</script>
	<!-- === game scripts =========================================================================================== -->
	<script type="text/javascript" src="game.js">/* ......................... game logic .................... */</script>
</head>
<body><div id="body">
	<h1><span>Othello</span></h1>
	<div id="shared-gamearea">
		<!-- === title = title screen, start or join a game ===================================================== -->
		<div id="page-title">
			<p><a href="javascript:showStartGame();">Start Game</a></p>
			<p><a href="javascript:showJoinGame();">Join Game</a></p>
		</div>
		<!-- === user = let the user enter a name =============================================================== -->
		<div id="page-user">
			<p><a href="javascript:game.showPage('title');">&laquo; Back</a></p>
			<p><label for="user-nickname">Enter a desired nickname:</label></p>
			<p><input type="text" name="user-nickname" id="user-nickname" maxlength="20" /></p>
			<fieldset style="background-image: url('../images/mask.png');"><legend>Choose an icon for yourself</legend>
			    <table id="user-icon-select">
			        <tr>
			                <td><img id="user-icon-user" src="../images/icons/user.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-user_red" src="../images/icons/user_red.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-user_green" src="../images/icons/user_green.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-user_female" src="../images/icons/user_female.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-user_suit" src="../images/icons/user_suit.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-user_gray" src="../images/icons/user_gray.png" width="16" height="16" alt="User" /></td>
			        </tr><tr>
			                <td><img id="user-icon-flag_blue" src="../images/icons/flag_blue.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-flag_red" src="../images/icons/flag_red.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-flag_green" src="../images/icons/flag_green.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-flag_yellow" src="../images/icons/flag_yellow.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-male" src="../images/icons/male.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-female" src="../images/icons/female.png" width="16" height="16" alt="User" /></td>
			        </tr><tr>
			                <td><img id="user-icon-star" src="../images/icons/star.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-heart" src="../images/icons/heart.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-cup" src="../images/icons/cup.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-house" src="../images/icons/house.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-gb" src="../images/icons/gb.png" width="16" height="16" alt="User" /></td>
			                <td><img id="user-icon-us" src="../images/icons/us.png" width="16" height="16" alt="User" /></td>
			        </tr>
			    </table>
			</fieldset>
			<div id="join-game">
				<p>Paste the key code your friend has given you into the box below to join the game.</p>
				<p><input type="text" name="join-key" id="join-key" size="6" maxlength="6" /></p>
			</div>
			<p><input type="button" id="user-submit" value="Start Game" onclick="javascript:game.connect(game.host);" /></p>
		</div>
		<!-- === game = the main game display =================================================================== -->
		<div id="page-game">
		        <div id="game-board"></div>
		</div>
		<!-- === common game elements =========================================================================== -->
		<div id="game-status-them" class="game-player-status">
		        <div id="game-status-them-info" class="game-player-info">
		                <div style="float: left;" id="game-status-them-win"><img src="../images/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /> Wins: <span id="game-status-them-wins">0</span></div>
			        <span id="jax-game-p2name" class="jax-game-player-name">Player 2</span> <img src="../images/icons/user_red.png" id="jax-game-p2icon" width="16" height="16" alt="User Icon" align="top" />
			</div>
		</div>
		<div id="game-status-me" class="game-player-status">
		        <div id="game-status-me-info" class="game-player-info">
		                <div style="float: right; text-align: right;" id="game-status-me-win">Wins: <span id="game-status-me-wins">0</span> <img src="../images/icons/award_star_gold_1.png" width="16" height="16" align="top" alt="Wins" /></div>
			        <img src="../images/icons/user.png" id="jax-game-p1icon" width="16" height="16" alt="User Icon" align="top" /> <span id="jax-game-p1name" class="jax-game-player-name">Player 1</span>
			</div><div id="game-status-me-msg" class="game-player-msg" style="display: none;">
			        &nbsp;
			</div>
		</div>
		<!--<div id="game-status" class="hv"><div class="hv1"><div class="hv2">
               		<div id="game-status-text" class="hvt"></div>
               	</div></div></div>-->
	</div>
        <?php include ("../../server/inc/footer.html")?>
</div></body>
<!-- === end of line ============================================================================================= --></html>