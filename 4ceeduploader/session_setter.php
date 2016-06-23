<?php
	session_start();
	$_SESSION['username'] = $_POST["username"];
	$_SESSION['password'] = $_POST["password"];
	$_SESSION['fullname'] = ucwords($_POST["fullname"]);
	$_SESSION['clowderURL'] = $_POST["clowderURL"];
	$_SESSION['baseURL'] = $_POST["baseURL"];
	$_SESSION['homeURL'] = $_POST["homeURL"];

?>
