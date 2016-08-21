<?php
	session_start();
	header('Access-Control-Allow-Origin: *'); 
	header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
	header('Access-Control-Allow-Methods: Content-Type');
	
	//Redirect user if sessions are not found
	if ($_SESSION['username'] == "" || $_SESSION['password'] == ""){
		header('Location: login.php'); 
	}
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
		<link rel="stylesheet" href="4ceeduploader/bootstrap/css/bootstrap.min.css">
		<!-- Optional theme -->
		<link rel="stylesheet" href="4ceeduploader/bootstrap/css/bootstrap-theme.min.css">
		<link rel="stylesheet" href="4ceeduploader/jquery-ui/css/jquery-ui.css">		
		
 		<link rel="stylesheet" href="4ceeduploader/sweetalert/css/sweetalert.css">
  		<link rel="stylesheet" href="4ceeduploader/css/style.css">		
  		<link rel="stylesheet" href="4ceeduploader/jquery-upload/css/uploadfile.css">		
		<link rel="stylesheet" href="4ceeduploader/jstree/themes/default/style.min.css" />
  		<link rel="stylesheet" href="4ceeduploader/select2/css/select2.css">		

 		<!--[if lt IE 9]>
		  <script src="bootstrap/js/html5shiv.min.js"></script>
		  <script src="bootstrap/js/respond.min.js"></script>
		<![endif]-->
		<script>
		  //If user opens another identical tab, redirect them back to login
		  if (sessionStorage.length == 0){ 
		  	window.location.href = "4ceeduploader/login.php";				
		  }
		</script>
	</head>
	<body>
	<div class="container">
		<div class="header clearfix">
			<nav>
				<ul class="nav nav-pills pull-right">
<!-- 					<li role="presentation" class="active"><a href="4ceeduploader/faq.php">FAQ</a></li>
 -->					<li role="presentation"><a href="4ceeduploader/logout.php">Logout</a></li>
				</ul>
			</nav>
 			<h3 class="text-muted username"></h3>
 			<h5 class="text-muted logout error"></h5>
 			<h5 class="text-muted timer error"></h5>

 		</div>
		<!-- dialog window markup -->
		<div id="dialog" title="Your session is about to expire!" class="hidden">
			<p>
				<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 50px 0;"></span>
				You will be logged off in <span id="dialog-countdown" style="font-weight:bold"></span> seconds.
			</p>
			
			<p>Do you want to continue your session?</p>
		</div>

		<!-- Collection --> 
		<form id="formGetCollections" class="" method="get" action="" name="clientForm">
			<div class="jumbotron">
				<div class="form-group colPanel">
					<img src="4ceeduploader/images/one.jpg" width="50px">
					<label style="padding-left:10px;">Choose a collection...</label>
					<span><a style="font-height:12px;" href="#" data-toggle="popover" title="Collections" data-trigger="hover" data-content="A logical container used to describe a parent/child level project, experiment, process, or sample." title=" ">what's this?</a></span>	
				</div>				
				<div class="panel-group" id="accordion1">
					<div class="panel panel-default">
						<div class="panel-heading panel-info ">
							<h3 class="panel-title ">
								<a data-toggle="collapse" data-parent="#accordion1" href="#collapse1">Existing collections</a>
							</h3>
						</div>
						<div id="collapse1" class="panel-collapse collapse in">
							<div class="panel-body">
								<div class="wells">
								    <div class="showSearch">
										<input class="search-input form-control" placeholder="Search your collections"></input><br />
									</div>
									<div class="alert alert-info showInfo">
										<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
										<span class="glyphicon glyphicon-info-sign"></span> Right click a collection to create a sub-collection.
									</div>	
									<div class="alert alert-info showDanger hidden">
										<span class="glyphicon glyphicon-exclamation-sign"></span> You have no collections. Create one below. 
									</div>									
									<div id="collections" required>
									</div>
									<span class="validCollection">Collection is required.</span>
								</div>
							</div>
						</div><!-- collapse1 -->
					</div><!-- panel default -->
					<div class="panel panel-success newColPanel">
						<div class="panel-heading">
							<h4 class="panel-title">
								<a data-toggle="collapse" data-parent="#accordion1" href="#collapse2" id="rootCollection">New Root Collection</a>
							</h4>
						</div>
						<div id="collapse2" class="panel-collapse collapse">
							<div class="panel-body">
								<div class="wells">
									<p>
									<div class="form-group">
										<label>Choose a name for the new collection:</label>
										<input type="text" class="form-control" name="collectionName" id="collectionName" placeholder="Example... Sample Name, Project Name, TuB2" required>
									</div>
									<div class="form-group">
										<label>Choose a description for the new collection:</label>
										<input type="text" class="form-control" name="collectionDescription" id="collectionDescription" placeholder="Example... Collection Description" required>
									</div>									
									<div class="form-group">									
										<input class="btn btn-success form-control" type="submit" value="Create Collection">
									</div>
									</p>
								</div>					
							</div>
						</div><!-- collapse2 -->
					</div><!-- panel-success -->
		 		</div><!-- accordion1 -->
			</div><!-- jumbotron -->
		</form>

		<!-- Dataset --> 
		<form id="formGetDatasets" class="hidden" method="get" action="">
		<div class="jumbotron">
			<div class="form-group dsPanel" >
				<img src="4ceeduploader/images/two.jpg" width="50px">
				<label style="padding-left:10px;">Choose a dataset...</label>
				<span><a style="font-height:12px;" href="#" data-toggle="popover" title="Datasets" data-trigger="hover" data-content="A logical container that describes samples, processes, and techniques that produce meta-data." title=" ">what's this?</a></span>	
			</div>				
			<div class="panel-group" id="accordion2">
				<div class="panel panel-default existingDS">
					<div class="panel-heading existingDS">
						<h4 class="panel-title">
							<a data-toggle="collapse" data-parent="#accordion2" href="#collapse3">Existing Datasets</a>
						</h4>
					</div>
					<div id="collapse3" class="panel-collapse collapse in">
						<div class="panel-body">
							<div class="wells">
								<label>Your Datasets:</label>						
								<select id="datasets" name="datasets" class="form-control ignore" required >
									<option value="">--</option>
								</select>
							</div>
						</div>
					</div><!-- collapse3 -->
				</div><!-- panel-default -->

				<div class="panel panel-success dsNewPanel">
					<div class="panel-heading newDS">
						<h4 class="panel-title">
							<a data-toggle="collapse" data-parent="#accordion2" href="#collapse4">New Dataset</a>
						</h4>
					</div>
					<div id="collapse4" class="panel-collapse collapse">
						<div class="panel-body">
							<div class="wells">
								<ul class="nav nav-tabs">
								  <li class="active"><a data-toggle="tab" href="#basicMenu" class="clearMenu">Basic</a></li>
								  <li><a data-toggle="tab" href="#custMenu" class="custMenu">Load Template</a></li>
								  <li><a data-toggle="tab" href="#createMenu" class="createMenu">Create Template</a></li>
								  <li><a data-toggle="tab" href="#prevMenu" class="prevMenu">Load Previous</a></li>
								</ul>	
								<div class="tab-content padTop">
								  <div id="basicMenu" class="tab-pane fade in active ">
									<div class="form-group">
										<label>Choose a name for the new dataset:</label>
										<input type="text" class="form-control ignore datasetName" placeholder="Example... Sample Name, PECVD Oxide, Diffusion" required>
									</div>
									<div class="form-group">
										<label>User defined metadata:</label>
										<input type="text" class="form-control ignore datasetDescription" name="datasetDescription" id="datasetDescription" placeholder="Example... Time, Temp, Pressure, Current" required >
									</div>	
									<div class="form-group">	
								    	<input class="btn btn-success form-control btnDataset" type="button" value="Create Dataset">
									</div>
								  </div>
								  <div id="custMenu" class="tab-pane fade">
								    <div class="form-group padTop">
										<div class="showTemplates">

											<div class="container">
												<div class="row">
													<div class="col-lg-4">
														<label>My Templates:</label><br />
														<select class="templates form-control"></select>
													</div>
													<div class="col-sm-4">
														<label>Global Templates:</label><br />
														<select class="globalTemplates form-control"></select>
													</div>
													<div class="col-sm-4">
														<label>Template Tag Search:</label><br />											
														<input class="form-control templateSearch" type="text" placeholder="Search by name or tag">
													</div>
												</div>
											</div>
										</div>
										<hr />
								    	<div class="tagData">
											<label>Template Name:</label>

											<select class="form-control tagTemplates">
											</select>
											<br />
								    	</div>										
										<div class="otherOptions">
											<label>Choose a name for your dataset:</label>
											<input type="text" class="form-control datasetName" placeholder="Example... Sample Name, PECVD Oxide, Diffusion" required><br />
											<input type="button" value="Add New Field" class="btn btn-success btnAdd"/>	
									    	<button type="button" class="clearTemplate btn btn-danger">Clear Template</button><br />
									    	<hr />
								    	</div>

										<div class="metaDataSettings">
										</div>	
										<div class="templateData">
											<!--Template boxes will be added here -->
											<br />

										</div>
								    </div>

									<div class="form-group">	
								    	<input class="btn btn-success form-control btnDataset" type="button" value="Create Dataset">
									</div>
								  </div>
								  <div id="createMenu" class="tab-pane fade">
								    <div class="form-group">
									    	<div class="showTemplates">
												<label>Load another template to start with (optional):</label><br />
												<select class="form-control templates">
												</select>
												<br />
											</div>

												<label>Choose a name for your template:</label>
												<input type="text" class="form-control datasetName" placeholder="<Example> Sample Name, PECVD Oxide, Diffusion" required><br />
												<label>Create tags to describe your template: (optional)</label> 				
												<span><a style="font-height:12px;" href="#" data-toggle="popover" title="Template Tags" data-trigger="hover" data-content="Tags allow users to search personal and global templates through descriptive tags." title=" ">
												<span class="glyphicon glyphicon-question-sign"></a></span>	
												<br />
												<input type="text" class="form-control tagName" placeholder="<Example> SEM, Diffusion" required><br />
												<input type="button" value="Add New Field" class="btn btn-success btnAdd"/>		
										    	<button class="btn btn-danger clearTemplate" type="button">Clear Template</button>
										    	<br /><br />
												<label>Share this template with others?</label> <input type="checkbox" id="checkShareTemplate"><br />
												
												<div class="metaDataSettings">
												</div>	
												<div class="templateData">
													<!--Template boxes will be added here -->
													<br />
												</div>
												<br />
											<div class="form-group" id="btnTemplate">	
													<input type="button" value="Create Template" class="btn btn-success btnTemplate form-control">
		 										</div>
 										</div>
								  </div>
								  <div id="prevMenu" class="tab-pane fade">
								    <div class="form-group">
								    	<div class="showTemplates">
											<label>Load previous dataset:</label><br />
											<select class="form-control prevTemplates">
											</select>
											<br />
										</div>
										<div class="otherOptions">
											<label>Choose a name for your Dataset:</label>
											<input type="text" class="form-control datasetName" placeholder="Example... Sample Name, PECVD Oxide, Diffusion" required><br />
											<input type="button" value="Add New Field" class="btn btn-success btnAdd"/>		
									    	<button class="btn btn-danger clearTemplate" type="button">Clear Template</button><br /><br />

											<div class="metaDataSettings">
											</div>	
											<div class="templateData">
												<!--Template boxes will be added here -->
											<br />
											</div>
											<br />
											<div class="form-group" id="btnTemplate">	
												<input type="button" value="Create New Dataset" class="btn btn-success btnDataset form-control">
		 									</div>
		 								</div>
 									</div>
 									
								  </div>

						  		</div>
							</div>					
						</div>
					</div><!-- collapse4 -->
				</div><!-- panel-success -->
			</div><!-- accordion2 -->	
		</div><!-- jumbotron --> 	
		</form>

		<div id="fileSubmit" class="hidden">
			<div class="jumbotron ">
				<div class="form-group">
					<img src="4ceeduploader/images/three.jpg" width="50px">
					<label style="padding-left:10px;">Click browse or drag and drop files..</label>
				</div>
				<div id="mulitplefileuploader">Browse</div>

			</div><!-- jumbotron -->

			<div class="form-group">									
				<input class="btn btn-success form-control" type="button" id="btnSubmit" value="Submit">
			</div>
		</div>
		<footer class="footer">
			<p>4CeeD - 2015</p>
		</footer>
	</div><!-- container --> 

	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="4ceeduploader/jquery/js/jquery.min.js"></script>
	<script src="4ceeduploader/jquery-ui/js/jquery-ui.js"></script>
	<!-- Include all compiled plugins (below), or include individual files as needed -->
	<!-- Latest compiled and minified JavaScript -->
	<script src="4ceeduploader/bootstrap/js/bootstrap.min.js"></script>
	<script src="4ceeduploader/jquery-validate/js/jquery.validate.min.js"></script>	
	<script src="4ceeduploader/select2/js/select2.js"></script>	
	<script src="4ceeduploader/jquery-idle-timeout-master/src/jquery.idletimer.js"></script>
	<script src="4ceeduploader/jquery-idle-timeout-master/src/jquery.idletimeout.js"></script>
	<script src="4ceeduploader/scripts/client.js"></script>
	<script src="4ceeduploader/jquery-upload/js/jquery.uploadfile.js"></script>
	<script src="4ceeduploader/sweetalert/js/sweetalert-dev.min.js"></script>	
	<script src="4ceeduploader/jstree/jstree.js"></script>	   
	</body>
</html>

