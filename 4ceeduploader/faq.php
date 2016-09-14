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
		<link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
		<!-- Optional theme -->
		<link rel="stylesheet" href="bootstrap/css/bootstrap-theme.min.css">
		<link rel="stylesheet" href="jquery-ui/css/jquery-ui.css">		
		
 		<link rel="stylesheet" href="sweetalert/css/sweetalert.css">
  		<link rel="stylesheet" href="css/style.css">		
  		<link rel="stylesheet" href="jquery-upload/css/uploadfile.css">		
		<link rel="stylesheet" href="jstree/themes/default/style.min.css" />
  		<link rel="stylesheet" href="select2/css/select2.css">		

 		<!--[if lt IE 9]>
		  <script src="bootstrap/js/html5shiv.min.js"></script>
		  <script src="bootstrap/js/respond.min.js"></script>
		<![endif]-->
		<script>
		  //If user opens another identical tab, redirect them back to login
		  if (sessionStorage.length == 0){ 
		  	window.location.href = "login.php";				
		  }
		</script>
	</head>
	<body>
<div class="container">
	<div class="header clearfix">
		<nav>
			<ul class="nav nav-pills pull-right">
				<li role="presentation" class="active"><a href="index.php">Uploader</a></li>
				<li role="presentation"><a href="/logout.php">Logout</a></li>
			</ul>
		</nav>

		<h3>4CeeD FAQ</h3>
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

	<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
		<div class="panel panel-default">
			<div class="panel-heading" role="tab" id="headingOne">
				<h4 class="panel-title">
					<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">OverView</a>
				</h4>
			</div>
			<div id="collapseOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
				<div class="panel-body">
					<p><b>What is this?</b><br />
						The 4CeeD curator is a light weight web tool used to upload scientific data files and metadata descriptors to a local repository. 
					</p>

					<p><b>Why use this? </b><br />
						The 4CeeD curator and coordinator replace outdated and inefficient methodologies used in many laboratories.</p>		   

					<p><b>How can this help me?</b><br />
					<ul>
						<li>Data gets stored to a local cloud storage.</li>
						<li>All accessible data can be downloaded with its data-model hierarchy preserved. </li>
						<li>Extractors pull descriptive meta-data out of files and instrument logs for analysis and discovery. </li>
						<li>Use templates for reliable user defined meta data entry.</li>
						<li>Support for automating repetitive tasks. </li>
						<li>Get reliable calibration data and how to reference it. </li>
						<li>Share your data and use powerful free-text and faceted search for comparisons. </li>
						<li>Broad set of customizable access control rules. </li>
					</ul>
				</div>
			</div>
		</div>
		<div class="panel panel-default">
			<div class="panel-heading" role="tab" id="headingGeneral">
				<h4 class="panel-title">
					<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseGeneral" aria-expanded="false" aria-controls="collapseGeneral">
						General
					</a>
				</h4>
			</div>
			<div id="collapseGeneral" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingGeneral">
				<div class="panel-body">

					<div data-toggle="collapse" data-target="#general">
						<b><u>Easy as 1-2-3</u></b>
					</div>

					<div id="general" class="collapse out"> 
						A collection is a term used to describe a group of datasets. Collections are often named after a sample, project, or process.
					</div>
					<hr />
<!-- 					<div data-toggle="collapse" data-target="#create-new-collection">
						<b><u>Create a new collection</u></b>
					</div>
					<div id="create-new-collection" class="collapse out"> 
						<p><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>										
						<span><a style="font-height:12px;" href="#" data-toggle="popover" title="Create a new root collection" data-html="true" data-trigger="hover" data-content="1. Give your collection a name. <br />2. Give your collection a description.<br />3. Click the create collection button.<br /><br /> <i> A new root level collection is created.</i>" title=" ">More Info</a></span></p>
						<p><img src="images/new_collection.png"></p>
					</div>	 
 -->
				</div>
			</div>
		</div>
		<div class="panel panel-default">
			<div class="panel-heading" role="tab" id="headingTwo">
				<h4 class="panel-title">
					<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
						Collections
					</a>
				</h4>
			</div>
			<div id="collapseTwo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
				<div class="panel-body">

					<div data-toggle="collapse" data-target="#collection">
						<b><u>What’s a collection?</u></b>
					</div>

					<div id="collection" class="collapse out"> 
						A collection is a term used to describe a group of datasets. Collections are often named after a sample, project, or process.
					</div>
					<hr />
					<div data-toggle="collapse" data-target="#create-new-collection">
						<b><u>Create a new collection</u></b>
					</div>
					<div id="create-new-collection" class="collapse out"> 
						<p><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>										
						<span><a style="font-height:12px; color:red;" href="#" data-toggle="popover" title="Create a new root collection" data-html="true" data-trigger="hover" data-content="1. Give your collection a name. <br />2. Give your collection a description.<br />3. Click the create collection button.<br /><br /> <i> A new root level collection is created.</i>" title=" ">More Info</a></span></p>
						<p><img src="images/new_collection.png"></p>
					</div>	 
					<hr />
					<div data-toggle="collapse" data-target="#collection-new">
						<b><u>Select an existing collection</u></b>
					</div>
					<div id="collection-new" class="collapse out"> 
						<p><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>										
						<span><a style="font-height:12px; color:red;" href="#" data-toggle="popover" title="Select an existing collection" data-html="true" data-trigger="hover" data-content="1. Select a root or sub collection<br />2. (Optional) Enter text to search for collections. <br />3. (Optional) Create a new sub collection by right clicking the parent. <br /><br /> <i> A parent collection is selected or a new sub collection is created and selected.</i>" title=" ">More Info</a></span></p>
						<p><img src="images/existing_collection.png"></p>
					</div>

				</div>
			</div>
		</div>
		<div class="panel panel-default">
			<div class="panel-heading" role="tab" id="headingThree">
				<h4 class="panel-title">
					<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
						Datasets
					</a>
				</h4>
			</div>
			<div id="collapseThree" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
				<div class="panel-body">

					<div data-toggle="collapse" data-target="#dataset">
						<b><u>What’s a dataset?</u></b>
					</div>

					<div id="dataset" class="collapse out"> 
						A dataset is a term used to describe a group of related files that have metadata. 
					</div>
					<hr />
					<div data-toggle="collapse" data-target="#select-dataset">
						<b><u>Select an existing dataset</u></b>
					</div>
					<div id="select-dataset" class="collapse out"> 
						<p><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>					
						<span><a style="font-height:12px; color:red;" href="#" data-toggle="popover" title="Select an existing dataset" data-html="true" data-trigger="hover" data-content="1. Select an available dataset from the dropdown menu. <br /><br /> <i> A dataset is selected.</i>" title=" ">More Info</a></span></p>
						<p><img src="images/existing_datasets.png"></p>
					</div>	
					<hr />
					<div data-toggle="collapse" data-target="#basic-dataset">
						<b><u>Create a basic dataset</u></b>
					</div>
					<div id="basic-dataset" class="collapse out"> 
						<p><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>										
						<span><a style="font-height:12px; color:red;" href="#" data-toggle="popover" title="Create a basic dataset" data-html="true" data-trigger="hover" data-content="1. Give your dataset a name. <br />2. Enter your meta data in the dataset description.<br />3. Click the create dataset button.<br /><br /> <i> A new dataset is created.</i>" title=" ">More Info</a></span></p>
						<p><img src="images/new_dataset.png"></p>
					</div>	
					<hr />
					<div data-toggle="collapse" data-target="#create-dataset">
						<b><u>Create a dataset from a template</u></b>
					</div>
					<div id="create-dataset" class="collapse out"> 
						<p><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>										
						<span><a style="font-height:12px; color:red;" href="#" data-toggle="popover" title="Create a dataset from a template" data-html="true" data-trigger="hover" data-content="1. Select a template from the dropdown menu. <br />2. Give your dataset a name.<br /> 3. Enter values for your datasets labels. <br />4. Click the create dataset button.<br /> 5. (Optional) Add or remove additional key/value pairs to extend your dataset template. <br /><br /> <i> A new dataset is created from your templates key/value data.</i>" title=" ">More Info</a></span></p>
						<p><img src="images/load_template.png"></p>
					</div>						
					<hr />
					<div data-toggle="collapse" data-target="#create-template">
						<b><u>Create a new template</u></b>
					</div>
					<div id="create-template" class="collapse out"> 
						<p><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>										
						<span><a style="font-height:12px; color:red;" href="#" data-toggle="popover" title="Create a template" data-html="true" data-trigger="hover" data-content="1. (Optional) Use an existing template to design your new template. <br />2. Give your template a name.<br />3. Add new fields to your template. <br /> 4. Click create template button. <br /> 5. (Future) Assign default values and measurement types<br /><br /><i> A new dataset template is created.</i>" title=" ">More Info</a></span></p>
						<p><img src="images/create_template.png"></p>
					</div>	

				</div>
			</div>
		</div>

		<div class="panel panel-default">
			<div class="panel-heading" role="tab" id="headingFiles">
				<h4 class="panel-title">
					<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseFiles" aria-expanded="false" aria-controls="collapseFiles">
						Files
					</a>
				</h4>
			</div>
			<div id="collapseFiles" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingFiles">
				<div class="panel-body">

					<div data-toggle="collapse" data-target="#fileQuestion1">
						<b><u>What file types can I upload?</u></b>
					</div>

					<div id="fileQuestion1" class="collapse out"> 
						All major file types are supported.<br />
						For example, [.png, .dm3, .tif, .txt, .jpg]
					</div>
					<hr />

					<div data-toggle="collapse" data-target="#fileQuestion2">
						<b><u>What are file extractors?</u></b>
					</div>

					<div id="fileQuestion2" class="collapse out"> 
						File extractors work by extracting key and value pairs from supported file types. This information is indexed, archived, and available for download and search.<br />
					</div>
					<hr />

					<div data-toggle="collapse" data-target="#fileQuestion3">
						<b><u>How many files can I upload at one time?</u></b>
					</div>

					<div id="fileQuestion3" class="collapse out"> 
						There is no file size or quantity limit. 
					</div>
					<hr />

					<div data-toggle="collapse" data-target="#fileQuestion4">
						<b><u>What extractors/instruments are currently supported?</u></b>
					</div>

					<div id="fileQuestion4" class="collapse out"> 
						We currently support SEM and TEM instruments [.dm3, .tif, .jpg, .png., .txt]<br />
						Future support will include Atomic Force Microscopes and Xray. 
					</div>
					<hr />

					<div data-toggle="collapse" data-target="#select-upload-files">
						<b><u>Uploading files</u></b>
					</div>
					<div id="select-upload-files" class="collapse out"> 
						<p><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>					
						<span><a style="font-height:12px; color:red;" href="#" data-toggle="popover" title="Uploading files" data-html="true" data-trigger="hover" data-content="1. Browse or drag and drop your files. <br /> 2. (Optional) Add additional file level meta data. <br /> 3. Click submit.<br /><br /> <i> A dataset is selected.</i>" title=" ">More Info</a></span></p>
						<p><img src="images/file_upload.png"></p>
					</div>	


				</div>
			</div>
		</div>



<div class="panel panel-default">
<div class="panel-heading" role="tab" id="headingThree">
<h4 class="panel-title">
<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
Web Front
</a>
</h4>
</div>
<div id="collapseThree" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
<div class="panel-body">
Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
</div>
</div>
</div>

<div class="panel panel-default">
<div class="panel-heading" role="tab" id="headingThree">
<h4 class="panel-title">
<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
Permissions
</a>
</h4>
</div>
<div id="collapseThree" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
<div class="panel-body">
Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
</div>
</div>
</div>	
<div class="panel panel-default">
<div class="panel-heading" role="tab" id="headingThree">
<h4 class="panel-title">
<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
Security
</a>
</h4>
</div>
<div id="collapseThree" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
<div class="panel-body">
Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
</div>
</div>
</div>		  	  		  	  
</div>

</div><!-- container --> 

	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="jquery/js/jquery.min.js"></script>
	<script src="jquery-ui/js/jquery-ui.js"></script>
	<!-- Include all compiled plugins (below), or include individual files as needed -->
	<!-- Latest compiled and minified JavaScript -->
	<script src="bootstrap/js/bootstrap.min.js"></script>
	<script src="jquery-validate/js/jquery.validate.min.js"></script>	
	<script src="select2/js/select2.js"></script>	
	<script src="jquery-idle-timeout-master/src/jquery.idletimer.js"></script>
	<script src="jquery-idle-timeout-master/src/jquery.idletimeout.js"></script>
	<script src="scripts/client.js"></script>
	<script src="jquery-upload/js/jquery.uploadfile.js"></script>
	<script src="sweetalert/js/sweetalert-dev.min.js"></script>	
	<script src="jstree/jstree.js"></script>	   
	</body>
</html>

