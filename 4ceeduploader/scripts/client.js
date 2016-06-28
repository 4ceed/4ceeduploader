//Populate colection and dataset menus on load
$(document).ready(function() {
	//These need to be set 
	username = sessionStorage.getItem('username');	
	password = sessionStorage.getItem('password');	
	fullname = sessionStorage.getItem('fullname');	
	author = sessionStorage.getItem('username');	
	clowderURL = sessionStorage.getItem('clowderURL');	
	baseURL = sessionStorage.getItem('baseURL');	

	$("#fileSubmit").hide(); 
	$("#formGetDatasets").hide(); 

	// hideDivs();
	//disable ds and file divs
	$(".username").text(fullname);
	$(".username").css('text-transform', 'capitalize');

	//load collections
	getCollections(); 
    $('[data-toggle="popover"]').popover(); 
	setDatasetID = ""; 

});

function hideDivs() {
	$("#fileSubmit").hide(); 
	$("#formGetDatasets").hide(); 
}

// setup the dialog and handle user idleness
$("#dialog").dialog({
	autoOpen: false,
	modal: true,
	width: 400,
	height: 200,
	closeOnEscape: false,
	draggable: false,
	resizable: false,
	buttons: {
		'Yes, Keep Working': function(){
			$(this).dialog('close');
		},
		'No, Logoff': function(){
			// fire whatever the configured onTimeout callback is.
			// using .call(this) keeps the default behavior of "this" being the warning
			// element (the dialog in this case) inside the callback.
			$.idleTimeout.options.onTimeout.call(this);
		}
	}
});

// cache a reference to the countdown element so we don't have to query the DOM for it on each ping.
var $countdown = $("#dialog-countdown");

// start the idle timer plugin
$.idleTimeout('#dialog', 'div.ui-dialog-buttonpane button:first', {
	idleAfter: 1800, //seconds
	pollingInterval: 2,
	// keepAliveURL: 'keepalive.php',
	serverResponseEquals: 'OK',
	onTimeout: function(){
		window.location = "logout.php";
	},
	onIdle: function(){
		$(this).dialog("open");
	},
	onCountdown: function(counter){
		$countdown.html(counter); // update the counter
	}
});

//On collection selection/deselection pull in datasets, or clear datasets menu
$("#collections").on("select_node.jstree", function(e, data){
		
		var str = data.node.id;  
		var res = str.match(/J/gi);
	 	
	 	//Prevents loading dataset for sub-collections that have no dataset yet
	 	if (res != "j"){
			getDatasets(data.node.id, ''); 
	 	}
		
		$("#formGetDatasets").removeClass("hidden");					
		$("#formGetDatasets").show(); 
	 	$(".validCollection").hide("slow");
});

$("#collections").on("deselect_node.jstree", function(e, data){
	$("#datasets").attr("disabled", "disabled");	
	$("#datasets").empty(); 
	$("#fileSubmit").hide(); 
	$("#formGetDatasets").hide(); 
});

$("#collections").on("changed.jstree", function(e, data){
	$("#fileSubmit").hide("slow"); 
});

//Set focus of textbox depending on what accordion is being shown
$("#accordion1").on("shown.bs.collapse", function () {
	$("#collectionName").focus(); 
});

$("#accordion2").on("shown.bs.collapse", function () {
	$("#datasetName").focus(); 
});

$(".newDS").on('click', function() { 
	// $(".existingDS").hide(); 
	$("#fileSubmit").hide(); 
});

$(".existingDS").on('click', function() { 
	// $(".newDS").hide(); 
	//if there is a value for a selection then show the file panel
	if ($("#datasets").val() != "" && $("#datasets").val() != null){
		$("#fileSubmit").show(); 
	}
});

$(".dsNewPanel").on('click', function() { 
	// $(".existingDS").hide(); 
	$(".collapse3").hide(); 
	$(".collapse4").show(); 
});

$(".dsPanel").on('click', function() { 
	// $(".existingDS").hide(); 
	$(".collapse4").hide(); 
	$(".collapse3").show(); 
});

//Nested collection created during jstree rename event
$("#collections").on("rename_node.jstree", function (e, data) {
    var currentNodeId = jQuery("#collections").jstree("get_selected");
	var selectedText = data.node.text;
	postNestedCollection(currentNodeId, selectedText); 
	$('#collections').jstree("deselect_all");
	$('#collections').jstree(true).check_node(data.node.id);
});

$("#datasets").change(function() {
	setDatasetID = $("#datasets").val();
	var newUrl = clowderURL+"uploadToDataset/"+setDatasetID+"";
	uploadObj.update({url:newUrl});	 
	$("#fileSubmit").removeClass("hidden");					
	$("#fileSubmit").show("slow"); 
});	

$("#datasets").select(function() {
	$("#fileSubmit").removeClass("hidden");					
	$("#fileSubmit").show("slow"); 
});	

$(".dsNewPanel").click(function(){
	$("#fileSubmit").hide("slow"); 
});

$("#rootCollection").click(function(){
	$("#formGetDatasets").hide("slow");
	$("#collections").jstree("deselect_all");	
}); 

$('.panel-heading a').on('click',function(e){
    if($(this).parents('.panel').children('.panel-collapse').hasClass('in')){
        e.preventDefault();
        e.stopPropagation();
    }
});

// Sort dataset menus
function sortJsonDatasetName(a,b){
		return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
};

//Get collections
function getCollections(collectionName, collectionID) {
	$.ajax({
		url: clowderURL+"collections/allCollections",
		dataType: "json",
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data) {
			$("#datasets").attr("disabled", "disabled");	
			if (data.length > 0){

				$(".showDanger").hide()
				$(".showInfo").show()
				$(".showSearch").show()

				createJSTrees(data);

			}else{
				
				$(".showDanger").removeClass("hidden");					
				$(".showDanger").show()
				$(".showInfo").hide()
				$(".showSearch").hide()

			}		
		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem connecting to the server",
			  type: "error",
			  timer: 2500,
			  showConfirmButton: false
			});
		}	
	});

}

//Create tree from js object
function createJSTrees(jsonData) {
	for(var i = 0; i < jsonData.length; i++){

		//create library supported key names (text,parent)
	    jsonData[i].text = jsonData[i]['name'];
	    jsonData[i].parent = jsonData[i]['parent_collection_ids'];

	    //remove old keys
	    delete jsonData[i].name;
	    delete jsonData[i].parent_collection_ids;

	    //Remove special characters from the values
	    if (jsonData[i].root_flag == "true"){
	    	jsonData[i].parent = "#";

	   	}else{
	   		var str = "";

	    	str = jsonData[i].parent.replace(/[List()]+/gi, '');
	    	jsonData[i].parent = str; 
	   	}

	   	//For new root collections where the json requires a root parent to have a value of #
	   	if (jsonData[i].parent == ""){
	   		jsonData[i].parent = "#";
	   	}

	}

	//jstree initialization and settings
	$('#collections').jstree({ 

		"core" : {
            "check_callback" : true,
        	"data" : jsonData,
			"multiple" : false,
			"themes" : {
			  "variant" : "large", 
			  "stripes" : true
			},
			"search": {
	          "case_insensitive": true,
              "show_only_matches" : true
	        },

		},		
		"checkbox" : {
		    "keep_selected_style" : false,
			"three_state" : false
		 },
		"contextmenu":{         
		    "items": function($node) {
		        var tree = $("#collections").jstree(true);
		        return {
		            "Create": {
		                "separator_before": false,
		                "separator_after": false,
		                "label": "Create New ",
						"icon" : "glyphicon glyphicon-plus",	                
		                "action": function (obj) { 
		                    $node = tree.create_node($node);
		                    tree.edit($node);
		                }
		            }
		        };
		    }
		},
		"plugins" : [
			"checkbox", 
			"contextmenu", 
			"massload", 
			"search", 
			"sort", 
			// "state", 
			"types", 
			"unique", 
			"wholerow", 
			"changed", 
			"conditionalselect"
		],

	});

}    

//Get datasets
function getDatasets(collectionID, datasetID) {

	// var url = clowderURL+'collections/' + collectionID + '/getDatasets';	
	$('#datasets').empty();

	$.ajax({
		url: clowderURL+'collections/' + collectionID + '/getDatasets',
		dataType: "json",
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data) {
			data = $(data).sort(sortJsonDatasetName);

			$.each(data, function(key, val) {
				$("#datasets").append($("<option class="+collectionID+"></option>").val(val.id).html(val.name));
			}); 

			$("#datasets").val(datasetID);
			setDatasetID = datasetID;
			var newUrl = clowderURL+"uploadToDataset/"+setDatasetID+"";
			uploadObj.update({url:newUrl});	    

			var len = $('#datasets option').length;

			$("#collections").removeClass( "focusedInput" );					
			// $("#collapse4").collapse('hide');

			if (len > 0){
				//OPTIONAL
				$('#datasets').removeAttr('disabled');

				// $('#datasets').first().focus();
				$('#datasets').addClass( "focusedInput" );	

				}else{
				//OPTIONAL
			   	$('#datasets').attr("disabled", "disabled");	
				$('#datasets').css({'background':''});
			}

		}, 
		error: function(xhr, status, error) {
		}	
	});

} 

//TEMPLATES
function getTemplates() {
	$.ajax({

		url: baseURL+"t2c2/templates/listExperimentTemplates",
		type:"GET", 
		dataType: "json",		
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
			showTemplates(data); 
		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem returning custom templates",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}	
	})

}

function getPublicTemplates() {
	$.ajax({

		url: baseURL+"t2c2/templates/getPublic",
		type:"GET", 
		dataType: "json",		
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
			showGlobalTemplates(data); 
		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem returning custom templates",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}	
	})

}

function getTemplate(id){
	$.ajax({
		url: baseURL+"t2c2/templates/getExperimentTemplateById/"+id+"",
		type:"GET", 
		dataType: "json",
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
			createBoxes(data); 
			// $(".tagData").hide(); 

		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem returning global templates",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}	
	})	 
}

//Load Previous Datasets
function getPreviousDatasets(){
	$.ajax({
		url: baseURL+"t2c2/getKeyValuesForLastDatasets",
		type:"GET", 
		dataType: "json",
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
			// console.log(data);
			showPreviousDatasets(data); 
		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem returning previous datasets",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}	
	})	 
}

function getPreviousDataset(id){
	$.ajax({
		url: baseURL+"t2c2/getKeyValuesForDatasetId/"+id+"",
		type:"GET", 
		dataType: "json",
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
			createBoxesForPreviousDataset(data); 
		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem returning custom templates",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}	
	})	 
}

//Load user templates
function showTemplates(data) {
	$.each(data, function(key, val) {
		$(".templates").append($("<option class='placeholder'></option>").val(val.id).html(val.name));
	}); 
	
	$(".templates").focus(); 	
}

//Load user templates
function showGlobalTemplates(templatesData) {
	$.each(templatesData, function(key, val) {
		$(".globalTemplates").append($("<option class='placeholder'></option>").val(val.id).html(val.name));
	}); 

	$(".globalTemplates").focus(); 	
}

function showTagTemplates(data){

	$('<option>').val('').text('--Select One--').appendTo('.tagTemplates');

	$.each(data, function(key, val) {
		$(".tagTemplates").append($("<option class='placeholder'></option>").val(val.template_id).html(val.name));
	}); 
	
	$(".tagTemplates").focus(); 	
}

function getAllTags(){

	var url = baseURL+"t2c2/templates/allTags";
	$.ajax({
		url: url,
		type:"GET", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){

			//Format the object by removing whitespace, duplicates, and capitalize characters. 
			var showUserTags = data.join(","); 
			var allCapsTags = showUserTags.toUpperCase(); 
			var trimTags = $.map(allCapsTags.split(","), $.trim);
			var uniqueTags = jQuery.unique(trimTags);	
			$(".templateSearch").autocomplete({
				source: uniqueTags,
				select: function (event, ui) {
					$(".tagTemplates").empty(); 
					$(".tagData").show(); 

					 var selectedObj = ui.item;  
					 getByTagId(selectedObj.value);
				}, 
				change: function( event, ui ) {

				}				
			}); 
		}

	}); 
}

function getByTagId(tagId){
	var url = baseURL+"t2c2/getIdNameFromTag/"+tagId+"";
	$.ajax({
		url: url,
		type:"GET", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
			$(".tagData").show(); 
			$(".otherOptions").hide(); 
			showTagTemplates(data);		
		}

	}); 
}

function showPreviousDatasets(data) {
	$('<option>').val('').text('--Select One--').appendTo('.prevTemplates');

	$.each(data, function(key, val) {
		$(".prevTemplates").append($("<option class='placeholder'></option>").val(val.dataset_id).html(val.dataset_name));
	}); 
	
	$(".prevTemplates").focus(); 	
}

function createBoxes(data){
    $(".templateData").empty();
  	$(".btnDataset").show();
	$(".btnAdd").show();
  	$("#btnTemplate").show();
  	$(".otherOptions").show();

  	//Get current tab and use name to determine what the label will say based on it's tab
  	var menuName = $('.nav-tabs .active > a').attr("href");

	var txt = ""; 
	if (menuName == "#custMenu"){
		txt = 1; 
	}else{
		txt = 0; 
	}

	$.each(data.terms, function(key, val) {
        var div = $("<div />");
        div.html(createDiv(val.key, val.default_value, txt));
        $(menuName + ' ' + ".templateData").append(div);
	}); 

}

function createBoxesForPreviousDataset(data){
    $(".templateData").empty();
  	$(".btnDataset").show();
	$(".btnAdd").show();
  	$("#btnTemplate").show();
  	$(".otherOptions").show();

	$.each(data.terms, function(i, val) {
		var div = $("<div />");
		div.html(createDiv(val.key, val.default_value, 1));
		$("#prevMenu .templateData").append(div);
	}); 

}

function clearTemplate(){
	$(".templateData").empty();
	$(".metaDataSettings").empty();
	$(".otherOptions").hide();
	$(".btnDataset").hide();
	$("#btnTemplate").hide();
	$(".templates").focus(); 
	$(".templates").val("");
	$(".prevTemplates").val("");
	$(".globalTemplates").val("");
	$(".templateSearch").val(""); 
	$(".tagTemplates").val(""); 
	$(".tagData").hide(); 
}

//Run when the clear template button is clicked
$(".clearTemplate").click(function(e){
    e.preventDefault();
    e.stopPropagation();
    clearTemplate(); 
});

//When advanced or create tabs are selected, clear and then get user templates
$(".custMenu, .createMenu, .prevMenu").click(function(){
	$(".btnDataset").hide();
	$(".otherOptions").hide();
	$(".showTemplates").show(); 
	$(".showGlobalTemplates").show(); 

	$(".templates").empty(); 
	$(".globalTemplates").empty(); 
	$(".prevTemplates").empty(); 	
	$(".tagTemplates").empty(); 
	$("#btnTemplate").hide();
	$('<option>').val('').text('--Select One--').appendTo('.templates');
	$('<option>').val('').text('--Select One--').appendTo('.globalTemplates');
	$(".tagData").hide(); 

	$(".metaDataSettings").empty(); 	
	$(".templateData").empty(); 

	getTemplates();
	getPublicTemplates(); 
	getPreviousDatasets(); 	

});

//Run when basic tab is selected
$(".clearMenu").click(function(){
	$(".btnDataset").show();
	$("#btnTemplate").hide();

});

//Handle template load when new menu item is selected
$(".templates").change(function(){
	var id = $(this).val(); 

	if (id != ''){
		getTemplate(id);
	}
});

$(".globalTemplates").change(function(){
	var id = $(this).val(); 

	if (id != ''){
		getTemplate(id);
	}
});

$(".prevTemplates").change(function(){
	var id = $(this).val(); 

	if (id != ''){
		getPreviousDataset(id);
	}
});

$(".tagTemplates").change(function(){
	var id = $(this).val(); 

	if (id != ''){
		getTemplate(id);
	}
});

$(".clearMenu").click(function(){
	$(".btnDataset").show();
	$("#btnTemplate").hide();

});

//Create a new template
$("#btnTemplate").on('click', function(e) {

	if ($("#formGetDatasets").valid()){
		postTemplate(e); 
	}

}); 

//Posts new template
function postTemplate(e) { 
    e.preventDefault();
    e.stopPropagation();

	var templateTerms = buildTemplate(); 
   	var tab = $('.tab-content');
   	var active = tab.find('.tab-pane.active');
	var templateName = active.find('.datasetName').val();
	var tagName = $('.tagName').val().toUpperCase(); 
	var shareTemplate = $('#checkShareTemplate').is(":checked");
	$.ajax({
		url: baseURL+"t2c2/templates/createExperimentTemplateFromJson?isPublic="+shareTemplate+"",
		type:"POST", 
		data: JSON.stringify({ name: templateName, terms: templateTerms, tags: tagName}),
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
			swal({
			  title: "Success", 
			  text: "A new template was created",
			  type: "success",
			  timer: 1500,
			  showConfirmButton: false
			});

			 // clear all the inputs in the new dataset field tabs
			$(".templateData").empty();
			$(".metaDataSettings").empty();
			$(".templates").empty(); 	
			$(".globalTemplates").empty(); 	
			$("#btnTemplate").hide();
			$(".datasetName").val(''); 
			$(".tagName").val(''); 
			$('#checkShareTemplate').prop('checked', false); 
			$('<option>').val('').text('--Select One--').appendTo('.templates');
			$('<option>').val('').text('--Select One--').appendTo('.globalTemplates');

			$("#otherOptions").hide();
			getTemplates();			
			getPublicTemplates(); 
		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem creating this template",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}	
	})
}

//Create NEW ROOT collection
function postCollections() {
	var collectionName = $('#collectionName').val();
	var collectionDescription = $('#collectionDescription').val();

	$.ajax({
		url: clowderURL+"collections",
		type:"POST", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		data: JSON.stringify({ name: collectionName, description: collectionDescription}),
		success: function(data){
			swal({
			  title: "Success", 
			  text: "A new collection was created",
			  type: "success",
			  timer: 1500,
			  showConfirmButton: false
			});

			$("#collectionName").val('');
			$("#collectionDescription").val('');
			$("#collections").empty();
 			$("#datasets").empty(); 
			$("#formGetDatasets").show(); 
			$('#collapse2').collapse('hide');
			$('#collapse1').collapse('show');

 			var newCollectionID = data.id

 			//This is going to be deprecated soon 6/16
			postRootCollection(data.id, true);

			//recreate tree	

			//Can these collection events be moved to a class/method? 
 			$("#collections").jstree("destroy");
			getCollections(); 

			$("#collections").on("loaded.jstree", function(e, data){
				$("#collections").jstree(true).check_node("#"+newCollectionID+"");

			});

			$("#collections").on("rename_node.jstree", function (e, data) {
			 	var numRootNodes = $('#collections').jstree(true)._model.data['#'].children.length;	
				//if there is more then one root collection
				if (numRootNodes > 1){

				 	var currentNodeId = $("#collections").jstree("get_selected");

					var selectedText = data.node.text;
					postNestedCollection(currentNodeId, selectedText); 
					$('#collections').jstree("deselect_all");
					$('#collections').jstree(true).check_node(data.node.id);	

				}
			});

			$("#collections").on("select_node.jstree", function(e, data){
				 
					var str = data.node.id;  
					var res = str.match(/J/gi);
				 	
				 	//Prevents loading dataset for sub-collections that have no dataset yet
				 	if (res != "j"){
					 	getDatasets(data.node.id, ''); 
				 	}
					$("#fileSubmit").hide(); 
					$("#formGetDatasets").removeClass("hidden");					
					$("#formGetDatasets").show(); 
				 	$(".validCollection").hide();
			});

			$("#collections").on("deselect_node.jstree", function(e, data){
				$("#datasets").attr("disabled", "disabled");	
				$("#datasets").empty(); 
				$("#fileSubmit").hide(); 
				$("#formGetDatasets").hide(); 
			});

		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem creating the collection",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}	
	})
} 

//Deprecating route soon. No longer necessary in api
//Set collection to root
function postRootCollection(collectionID, rootFlag) {	

	$.ajax({
		url: clowderURL+"collections/"+collectionID+"/rootFlag/"+rootFlag+"",
		type:"POST", 
		beforeSend: function(xhr){
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
		}, 
		error: function(xhr, status, error) {
		}	
	})
} 

//Create NEW nested collection
function postNestedCollection(collectionID, collectionName) {
	var collectionID = collectionID.toString(); 
	var nestedCollectionName = collectionName
	var nestedCollectionDescription = ""; //Add an optional label to jstree on create for a collection description

	 $.ajax({
		url: clowderURL+"collections/newCollectionWithParent",
		type:"POST", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		data: JSON.stringify({ name: nestedCollectionName, description: nestedCollectionDescription, parentId: collectionID }),
		
		success: function(data){

			swal({
			  title: "Success", 
			  text: "A new sub collection was created",
			  type: "success",
			  timer: 1500,
			  showConfirmButton: false
			});

			//recreate tree	
 			$("#collections").jstree("destroy");
			getCollections(); 
 			var newCollectionID = data.id

			$("#collections").on("loaded.jstree", function(e, data){
				$("#collections").jstree(true).check_node("#"+newCollectionID+"");
			});

			$("#collections").on("rename_node.jstree", function (e, data) {
			    var currentNodeId = $("#collections").jstree("get_selected");
				var selectedText = data.node.text;
				postNestedCollection(currentNodeId, selectedText); 
				$('#collections').jstree("deselect_all");
				$('#collections').jstree(true).check_node(data.node.id);

			});

			$("#collections").on("select_node.jstree", function(e, data){
				 	
					var str = data.node.id;  
					var res = str.match(/J/gi);
				 	
				 	//Prevents loading dataset for sub-collections that have no dataset yet
				 	if (res != "j"){
					 	getDatasets(data.node.id, ''); 
				 	}				 	
				 	$(".validCollection").hide();
					$("#fileSubmit").hide(); 
					$("#formGetDatasets").show(); 

			});

			$("#collections").on("deselect_node.jstree", function(e, data){
				$("#datasets").attr("disabled", "disabled");	
				$("#datasets").empty(); 
				$("#fileSubmit").hide(); 
				$("#formGetDatasets").hide(); 
			});			

			// postNestedCollectionToCollection(collectionID, data.id);

		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem creating the sub collection",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}		
	})
} 

//Create NEW dataset and associate it with a collection
function postNestedCollectionToCollection(collectionID, nestedCollectionID) {
	var url = clowderURL+"collections/"+collectionID+"/addSubCollection/"+nestedCollectionID+"";

	$.ajax({
		url: url,
		type:"POST", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
    		xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));

		}, 
		data: JSON.stringify({ coll_id: collectionID, sub_coll_id: nestedCollectionID}),
		success: function(data){
		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem adding this collection to the parent",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}
	
	})
} 

//Create NEW dataset
function postDatasets() {
   	var tab = $('.tab-content');
   	var active = tab.find('.tab-pane.active');
	var datasetName = active.find('.datasetName').val();
	var menuName = $('.nav-tabs .active > a').attr("href");

	var datasetDescription = buildStr(menuName); 
    var currentNodeId = jQuery("#collections").jstree("get_selected");

	$.ajax({
		url:clowderURL+"datasets/createempty",
		type:"POST", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		data: JSON.stringify({ name: datasetName, description: datasetDescription, authorId: author}),
		success: function(data){
			swal({
			  title: "Success", 
			  text: "A new dataset was created",
			  type: "success",
			  timer: 1500,
			  showConfirmButton: false
			});

			 $('#collapse4').collapse('hide');
			 $('#collapse3').collapse('show');
			 //clear all the inputs in the new dataset field tabs
			 $('#datasets').empty();
			 // $('#datasetName').val('');
			 $('#datasetDescription').val('');
		     $(".templateData").empty();
		     $(".metaDataSettings").empty();	
			 $("#fileSubmit").removeClass("hidden");					
		     $("#fileSubmit").show("slow"); 
		     $("#otherOptions").hide(); 
			 $('.datasetName').val('');
			 
		     var currentNodeId = $("#collections").jstree("get_selected");
			 $('.nav-tabs a:first').tab('show')
			 postDatasetToCollection(currentNodeId, data.id);
			 // getDatasets(currentNodeId, data.id);	

		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem creating the dataset",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}			
	})
} 

//Create NEW dataset and associate it with a collection
function postDatasetToCollection(collectionID, datasetID) {

	var url = clowderURL+"collections/"+collectionID+"/datasets/"+datasetID+"";
	$.ajax({
		url: url,
		type:"POST", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		data: JSON.stringify({ coll_id: collectionID, ds_id: datasetID}),
		success: function(data){
			swal({
			  title: "Success", 
			  text: "A new dataset was created",
			  type: "success",
			  timer: 1500,
			  showConfirmButton: false
			});

			getDatasets(collectionID, datasetID);	

		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem adding the dataset to the collection",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}
	
	})
} 

function addFileDescription(id, comments){

	var url = baseURL+"t2c2/files/"+id+"/updateDescription";
	$.ajax({
		url: url,
		type:"PUT", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		data: JSON.stringify({ description: comments}),
		success: function(data){

		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem adding the comments to the file",
			  type: "error",
			  timer: 1500,
			  showConfirmButton: false
			});
		}
	
	})

}

//load fileupload plugin
$(function(){
	    var fileUploadURL = clowderURL+"uploadToDataset/"+setDatasetID+"";
		var settings = {
			url:fileUploadURL,
		    autoSubmit:false,
		    showPreview:false,
		    previewHeight: "100px",
		    previewWidth: "100px",    
		    dragDrop:true,
		    fileName: "File",
		    allowedTypes:"*",	
		    returnType:"json",
		    showDelete:false,
		    dragdropWidth: "650px",
			maxFileCount: 110, 	
			showProgress: true, 
			extraHTML:function()
			{
			    	var html = "<div><b>File Comments:</b><br /><textarea class='form-control fileComments'></textarea> <br/>";
					// html += "<b>Success?</b>:<br /><select name='experimentSuccess' class='form-control'><option value=''>--Select One</option><option value='success'>Success</option><option value='failure'>Failure</option></select>";
					html += "</div><br />";
					return html;    		
			},			
			onSuccess:function(files,data,xhr,pd){
				swal({
				  title: "Success", 
				  text: "Your files were uploaded",
				  type: "success",
				  timer: 1500,
				  showConfirmButton: false
				});			

				hideDivs();
				$('#collections').jstree("deselect_all");

				$.each(fileDict, function(key, value){
					if (key == files){
						addFileDescription(data.id, value);
					} 
				});

				counter--; 

			    uploadObj.reset();
			    $("#datasets").empty(); 				

			}, 
			onError: function(files,status,errMsg,pd){
				swal({
				  title: "Error", 
				  text: "Your files were not uploaded",
				  type: "error",
				  timer: 1500,
				  showConfirmButton: false
				});				
			},		
			onSelect:function(files)
			{
			    return true; //to allow file submission.
			},
			beforeSend: function() 
			{
			 
			},
		    deleteCallback: function(data,pd) {
			    for(var i=0;i<data.length;i++) {
			        $.post("delete.php",{op:"delete",name:data[i]},
			        function(resp, textStatus, jqXHR) {
			            //Show Message  
			            $("#status").append("<div>File Deleted</div>");      
			        });
			     }      
			    pd.statusbar.hide(); 
			}
		}

	  uploadObj = $("#mulitplefileuploader").uploadFile(settings);

});

//Validate the entire form and submit collection/dataset/file
$("#btnSubmit").on('click', function() {
	$("#datasets").removeAttr('disabled');
	$(".datasetName").addClass("required");

	$("#formGetDatasets").valid();

	//work around for jstree validation 
	var numSelections = $("#collections").jstree("get_selected");

	if (numSelections.length == 0){
		$("#formGetCollections").valid();
		$(".validCollection").show();
	}

	//if we have files then turn off file requirement validation
	numFiles = $('.ajax-file-upload-statusbar').length;	 
	if (numFiles == 0){
		$("#formUpload").valid();
	}

	if ($("#formGetDatasets").valid()){

		//was a dataset selected or created? 
		//This has to be done first before a fileload, since we need the datasetid
		if (setDatasetID != '' && setDatasetID != null){
			$(".alert").hide(); 
			comments = $(".fileComments");
            filenames = $(".ajax-file-upload-filename"); 
            fileDict = {}; 
            for (i = 0; i < numFiles; i++){
            	var key = $(filenames[i]).text();
            	var val = $(comments[i]).val();
            	// var replaced = key.substring(key.indexOf(".") + 1); 
            	fileDict[key.trimLeft()] = val; 
            }

			counter = numFiles - 1;
	    	uploadObj.startUpload();
		}else{
			$("#lblDatasetCheck").text("You must select or create a dataset before uploading a file.")
		}
		// $("#datasets").attr("disabled", "disabled");	
		// $("#datasets").empty(); 
	 }

});	

//Removes previos error messages when a new tab is selected
$(".custMenu, .createMenu, .clearMenu, .prevMenu").on('click', function() {
	var validator = $("#formGetDatasets").validate();
	validator.resetForm();
	$("label.error").hide();
    $(".error").removeClass("error");	
}); 

$(".btnDataset").on('click', function() {
	// $(".datasetName").addClass("required");
	// $("#datasets").removeAttr('disabled');
	// $('.datasetName').attr('required', true)
	var jsTreeValid = false; 

	// work around for jstree validation 
	var numSelections = $("#collections").jstree("get_selected");

	if (numSelections.length == 0){
		$(".validCollection").show();
		jstreeValid = false; 
	}else{
		jstreeValid = true; 
	}

	if ($("#formGetDatasets").valid() && jstreeValid == true){
		postDatasets(); 
	}
});	

//Validate collections 
$("#formGetCollections").validate({
    submitHandler: function() {
		postCollections(); 
    }
});

//Build string of metadata from dynamic textboxes
function buildStr(menuName) {
		var keys = $.map($(menuName + ' ' + '.metaDataKey'), function (el) { return el.value; });
		var values = $.map($(menuName + ' ' + '.metaDataVal'), function (el) {return el.value;}); 
		var arrayCombined = []; 
		$.each(keys, function (idx, val) {

			//only allow full key/value pairings to be inserted
			if (val != '' && values[idx] != ''){
		    	arrayCombined.push(val + " : " + values[idx]);
			}
		});
		return(arrayCombined.join("\n"));
}

function buildTemplate() {
		var metaDataKeys = $.map($('#createMenu .metaDataKey'), function (el) { return el.value; });
		var metaDataVals = $.map($('#createMenu .metaDataVal'), function (el) {return el.value;}); 
		var arr = []; 

		$.each(metaDataKeys, function (idx, keyName) {
			if (keyName != ''){
				var objCombined = {}; 
				objCombined['key'] = keyName; 
				objCombined['default_value'] = metaDataVals[idx]; 
				arr.push(objCombined);
			}
		});
		return(arr);
}

//Auto complete dataset field
$(function() {

	var availableTags = [
		"Device Characterization",
		"Diffusion",
		"Ellipsometry",
		"Lithography",
		"Metallization",
		"Optical Microscopy",
		"Oxidation",
		"Plasma Etching",
		"Profilometry",
		"SEM",
		"SiO2 Mask Deposition",
		"SIMS",
		"SiNx Deposition",
		"SiNx Removal",
		"SPA"
	];

	$(".datasetName").autocomplete({
		source: availableTags
	});

	getAllTags(); 
	$(".tagData").hide(); 

});

//Auto create and remove textboxes for custom dataset settings
$(function () {
    $(".btnAdd").on('click', function () {
		var metaDataTags = [
			"Power",
			"Element",
			"Current", 
			"Pressure", 
			"Time", 
			"Temperature", 
			"Depth", 
			"Lateral Depth", 
			"Disorder Depth", 
			"Tool", 
			"Sample", 
			"Spin", 
			"RF", 
			"ICP",
			"SFP",
			"EBR", 
			"Expose", 
			"RIE", 
			"PostExp Bake",
			"Spin", 
			"PreExp Bake"
		];

        var div = $("<div />");
        div.html(createDiv(" "));

		//Future: check and see if any classes with this value exist already before making another input
        $(".metaDataSettings").append(div);
		$(".metaDataKey").first().focus(); 
		$(".existingDS").show(); 
		$(".btnDataset").show();
		$("#btnTemplate").show();

        //Call autocomplete on dynamically created textbox after it's created
		$(".metaDataKey").autocomplete({ 
			source:metaDataTags
 		});
 	});       

    $("body").on("click", ".remove", function () {
        $(this).closest(".top-buffer").remove();
    });

	$("body").keypress(function(e){
	    if(e.which == 13){
	        $(".metaDataVal").blur(); 
	    }
	});    
});

//Search Plugin
$(".search-input").keyup(function() {
	var searchString = $(this).val();
	$('#collections').jstree('search', searchString);
});

//Prevent collection search from submitting the form
$('.search-input').keydown(function (e) {
	if (e.keyCode == 13) {
		e.preventDefault();
	}
});

//Create dynmiac textbox
function createDiv(keyName,val, txt) {
		var valKeyName = jQuery.trim(keyName);
		var valStr = jQuery.trim(val);
		var txtToWrite = "";  
		if (txt == 1){
			txtToWrite = "Value: ";
		}else{
			txtToWrite = "Default Value: (optional)";
		}

	    return '<div class="row top-buffer"><div class="col-xs-5"><b>' + "<label for='name'>Name: " + '</label></b></span>' +
    		'<input class="metaDataKey form-control" id="name" type="text" value=' + valKeyName.replace(/ /g,"&nbsp;") +'></div>' + 

    		// '<div class="col-xs-2" style="margin-left:-15px;"><b>' + "<label for='val'>Unit: " + '</label></b>' +
    		// '<input class="metaDataVal form-control" type="text" id="val"></div>'  + 

    		'<div class="col-xs-5" style="margin-left:-15px;"><b>' + "<label for='val'>"+txtToWrite + '</label></b>' +
    		'<input class="metaDataVal form-control" type="text" id="val" value=' + valStr.replace(/ /g,"&nbsp;") +'></div>' + 

    		'<div class="col-xs-1" style="margin-left:-15px;"><b>' + "<label for='val'>&nbsp;" + '</label></b>' +
    		'<input type="button" value="Remove" class="remove btn btn-danger"></div></div>' 

}





