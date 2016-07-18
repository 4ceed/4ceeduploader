<?php
	session_start();

	header('Access-Control-Allow-Origin: *'); 
	header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
	header('Access-Control-Allow-Methods: Content-Type');
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		<title>T2C2</title>

		<!-- Bootstrap -->
		<link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
		<!-- Optional theme -->
		<link rel="stylesheet" href="bootstrap/css/bootstrap-theme.min.css">
		<link rel="stylesheet" href="jquery-ui/css/jquery-ui.css">		
		
  		<link rel="stylesheet" href="css/style.css">		
  		<link rel="stylesheet" href="css/login.css">		
		<link rel="stylesheet" href="jstree/themes/default/style.min.css" />
 		<!--[if lt IE 9]>
		  <script src="bootstrap/js/html5shiv.min.js"></script>
		  <script src="bootstrap/js/respond.min.js"></script>
		<![endif]-->
	</head>
	<body>

		<div class="container">
			<div class="header clearfix"></div>
			<div class="panel-group" id="accordion1">
				<div class="panel panel-default">
					<div class="panel-heading panel-info ">
						<h3 class="panel-title ">
							Sign In
						</h3>
					</div>
				</div>
			</div>
			<div class="alert alert-danger" role="alert" style="display:none;" id="displayMsg">
				<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
				<span class="sr-only">Error:</span>
				User not authorized
			</div>				
			<div class="jumbotron">
				<form method="" id="formLogin" action="">
					<div id="" class="tab-pane">
						<div class="form-group">
							<label>Username/Email:</label>
							<input type="text" id="username" name="username" class="form-control" placeholder="yourname@email.com" required>
						</div>
						<div class="form-group">
							<label>Password:</label>
							<input type="password" id="password" name="password" class="form-control" required>
						</div>				
						<div class="form-group">
							<input id="btnLogin" type="button" value="Sign In" class="btn btn-warning btn-lg"/>		
						</div>		
					</div>
				</form>
			</div>
			<footer class="footer">
				<p>4CeeD - 2015</p>
			</footer>
		</div>
		<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
		<script src="jquery/js/jquery.min.js"></script>
		<script src="jquery-ui/js/jquery-ui.js"></script>
		<!-- Include all compiled plugins (below), or include individual files as needed -->
		<!-- Latest compiled and minified JavaScript -->
		<script src="bootstrap/js/bootstrap.min.js"></script>
		<script src="jquery-validate/js/jquery.validate.min.js"></script>	
		<script>

			//center container login and sets focus to username
			jQuery.fn.center = function () {
			    this.css("position","absolute");
			    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
			    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
			    return this;
			}

			$("#username").focus(); 
			$(".container").center();

			//Listener for button click or enter key press
			$("#btnLogin").on("click", function(){
				
				//LOCAL
				// var clowderURL = "http://127.0.0.1:9000/api/"; 
				// var baseURL = "http://127.0.0.1:9000/"; 
				// var homeURL = "http://127.0.0.1:8888/4ceeduploader/";
			
				//REMOTE
				var clowderURL = "https://4ceed.illinois.edu/api/"; 
				var baseURL = "https://4ceed.illinois.edu/"; 
				var homeURL = "https://4ceed.illinois.edu/4ceeduploader"; 
			
				var username = $("#username").val(); 
				var password = $("#password").val(); 

				if ($('#formLogin').valid()){
					getAuth(username, password, clowderURL, baseURL, homeURL); 
				} 			

			});

			$("input").keypress(function(event) {
			    if (event.which == 13) {
			    	$("#btnLogin").click(); 
			    }
			});

			//The api/me route will return as a success if the username/password combination is valid
			function getAuth(username, password, clowderURL, baseURL, homeURL) {

				$.ajax({
					url: clowderURL+"me",
					dataType: "json",
					beforeSend: function(xhr){
						xhr.setRequestHeader("Content-Type", "application/json"); 
						xhr.setRequestHeader("Accept", "application/json");
						xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
					}, 
					success: function(data) {
						//Create client side sessions variables to hold login and response data
						sessionStorage.setItem("username", username);
						sessionStorage.setItem("password", password);
					    sessionStorage.setItem("fullname", data.fullName);		
						sessionStorage.setItem("clowderURL", clowderURL);		
						sessionStorage.setItem("baseURL", baseURL);		
						sessionStorage.setItem("homeURL", homeURL);		

						createSession(username, password, data.fullName, clowderURL, baseURL, homeURL); 
					}, 
					error: function(xhr, status, error) {
						$("#displayMsg").show()
					}	
				});

			}

			//Create PHP sessions variables to redirect unauthorized users 
			function createSession(username, password, fullname, clowderURL, baseURL, homeURL) {

				$.ajax({
				    type: 'POST',
				    url: 'session_setter.php',
				    data: {username: username, password: password, fullname: fullname, clowderURL: clowderURL, baseURL:  baseURL, homeURL: homeURL}, 
					success: function(data) {
						window.location.href = homeURL; // "http://127.0.0.1:8888/index.php";				
					}, 
					error: function(xhr, status, error) {
						$("#displayMsg").show()
					}	

				}); 
			}

		</script>	

	</body>
</html>