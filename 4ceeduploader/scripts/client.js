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

	//disable ds and file divs
	$(".username").text(fullname);
	$(".username").css('text-transform', 'capitalize');

	//load collection
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

//Set focus of textbox depending on what accordion is being shown
$("#accordion1").on("shown.bs.collapse", function () {
	$("#collectionName").focus(); 
});

$("#accordion2").on("shown.bs.collapse", function () {
	$("#datasetName").focus(); 
});

$(".newDS").on('click', function() { 
	$("#fileSubmit").hide(); 
});

$(".existingDS").on('click', function() { 
	//if there is a value for a selection then show the file panel
	if ($("#datasets").val() != "" && $("#datasets").val() != null){
		$("#fileSubmit").show(); 
	}
});

$(".dsNewPanel").on('click', function() { 
	$(".collapse3").hide(); 
	$(".collapse4").show(); 
});

$(".dsPanel").on('click', function() { 
	$(".collapse4").hide(); 
	$(".collapse3").show(); 
});

function getCurrentSelectedCollection(){
    var arr = $("#collections").jstree("get_selected");
    return arr;
}

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

function setCurrentParentID(data, selectedText){
	var currentParentId = data; 
	postNestedCollection(currentParentId, selectedText); 
}

function findYoungestChild(selectedText){

    var arr = $("#collections").jstree("get_selected");
    arr.pop(); 
	$.ajax({
		url: baseURL+"t2c2/findYoungestChild",
		type:"POST", 
		dataType: "json",
		data: JSON.stringify({ ids: arr}),
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data) {
			setCurrentParentID(data, selectedText); 
		}
	});
}

//Get collections
function getCollections(newCollectionID) {
	$.ajax({
		url: clowderURL+"collections/allCollections",
		type:"GET", 		
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

				createJSTrees(data, newCollectionID);

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
function createJSTrees(jsonData, newCollectionID) {
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
		"checkbox": {
            "keep_selected_style": false, 
            "three_state": false

		}, 
		"plugins" : [
			"checkbox",
			"contextmenu", 
			"massload", 
			"search", 
			"sort", 
			"types", 
			"unique", 
			"wholerow", 
			"changed", 
			"conditionalselect"
		],

	});

	$("#collections").on("loaded.jstree", function(e, data){
		$("#collections").jstree(true).check_node("#"+newCollectionID+"");

	});

	$("#collections").on("rename_node.jstree", function (e, data) {
			$('#collections').jstree(true).check_node(data.node.id);	
			var selectedText = data.node.text;  
			findYoungestChild(selectedText); 
	});

	$("#collections").on("select_node.jstree", function(e, data){
		 
			var str = data.node.id;  
			var res = str.match(/J/gi);
		 	//Prevents loading dataset for sub-collections that have no dataset yet
		 	if (res != "j"){
			 	getDatasets(data.node.id, ''); 
		 	}
			$("#fileSubmit").hide(); 

			//not in other code
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

	$("#collections").on("changed.jstree", function(e, data){
		$("#fileSubmit").hide("slow"); 
	});	

}    

//Get datasets
function getDatasets(collectionID, datasetID) {
	$('#datasets').empty();

	$.ajax({
		url: clowderURL+'collections/' + collectionID + '/getDatasets',
		type:"GET", 		
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

			if (len > 0){
				//OPTIONAL
				$('#datasets').removeAttr('disabled');
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
	var numberOfDatasetsToShows = 10; 
	$.ajax({

		url: baseURL + "t2c2/templates/lastTemplate", // + numberOfDatasetsToShows + "",
		type:"GET", 
		dataType: "json",
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){
			showPreviousDatasets(data); 
		}, 
		error: function(xhr, status, error) {
		}	
	})	 
}

function getPreviousDataset(id){
	$.ajax({

		url: baseURL + "t2c2/datasets/getDatasetAndTemplate/" + id + "",
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
			  text: "There was a problem returning previous datasets",
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

function showPreviousDatasets(data) {
	$('<option>').val('').text('--Select One--').appendTo('.prevTemplates');
	$.each(data, function(key, val) {
		$(".prevTemplates").append($("<option class='placeholder'></option>").val(val.attached_dataset).html(val.name));
	}); 
	
	$(".prevTemplates").focus(); 	
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
			// $(".otherOptions").hide(); 
			if (data.length){
				showTagTemplates(data);	
			}else{

			}
		}

	}); 
}

function createBoxes(data){
    $(".templateData").empty();
  	$(".btnDataset").show();
	$(".btnAdd").show();
  	$("#btnTemplate").show();
  	$(".otherOptions").show();
  	var menuName = $('.nav-tabs .active > a').attr("href");
  	//Get current tab and use name to determine what the label will say based on it's tab
	$.each(data.terms, function(key, val) {
        var div = $("<div />");
        div.html(createDiv(val.key, val.default_value, val.units, val.data_type, val.required));
        $(menuName + ' ' + ".templateData").append(div);
	}); 

	disableRequiredInput(); 

}

function createBoxesForPreviousDataset(data){

    $(".templateData").empty();
  	$(".btnDataset").show();
	$(".btnAdd").show();
  	$("#btnTemplate").show();
  	$(".prevOptions").show();
  	
	$.each(data.template.terms, function(i, val) {
		var div = $("<div />");
        div.html(createDiv(val.key, val.default_value, val.units, val.data_type, val.required));
		$("#prevMenu .templateData").append(div);
	}); 

	disableRequiredInput(); 


}

function clearTemplate(){
	$(".templateData").empty();
	$(".metaDataSettings").empty();
	$(".prevOptions").hide();
	$(".btnDataset").hide();
	$("#btnTemplate").hide();
	$(".templates").focus(); 
	$(".templates").val("");
	$(".prevTemplates").val("");
	$(".globalTemplates").val("");
	$(".templateSearch").val(""); 
	$(".tagTemplates").val(""); 
	$(".tagData").hide(); 
	counter1.reset();

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
	$(".prevOptions").hide();
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

	$(".tagTemplates").val([]);
	$(".tagData").hide(); 
	$(".globalTemplates").val([]);
	$(".templateSearch").val('');

	if (id != ''){
		getTemplate(id);
	}
});

$(".globalTemplates").change(function(){
	var id = $(this).val(); 

	$(".templates").val([]);
	$(".tagTemplates").val([]);
	$(".tagData").hide(); 
	$(".templateSearch").val('');
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

	$(".templates").val([]);
	$(".globalTemplates").val([]);

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

	datasetRequireAll(); 
	datasetRequiredFields(); 

	if ($("#formGetDatasets").valid()){
		postTemplate(true, ''); 
	}

}); 

//Posts new template
function postTemplate(templateType, datasetID){
	var menuName = $('.nav-tabs .active > a').attr("href");
	var templateTerms = buildTemplate(menuName); 
	var tagName = $('.tagName').val().toUpperCase(); 
	var shareTemplate = $('#checkShareTemplate').is(":checked");
    var datasetName = $("" + menuName + " .datasetName").val(); 
    var templateType = templateType.toString(); 
	$.ajax({
		url: baseURL+"t2c2/templates/createExperimentTemplateFromJson?isPublic="+shareTemplate+"",
		type:"POST", 
		data: JSON.stringify({ name: datasetName, terms: templateTerms, tags: tagName, master: templateType}),
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		success: function(data){


			if (templateType === "false"){

				swal({
				  title: "Success", 
				  text: "A new dataset was created",
				  type: "success",
				  timer: 1500,
				  showConfirmButton: false
				});


				addTemplateToDataset(datasetID, data.id);
			}else{
				swal({
				  title: "Success", 
				  text: "A new template was created",
				  type: "success",
				  timer: 1500,
				  showConfirmButton: false
				});
			 // clear all the inputs in the new dataset field tabs
			}
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
function postRootCollection() {
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

			//recreate tree	
 			$("#collections").jstree("destroy");
			getCollections(newCollectionID); 

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


//Create NEW nested collection
function postNestedCollection(parentId, nestedCollectionName) {
	var nestedCollectionDescription = ""; //Add an optional label to jstree on create for a collection description

	 $.ajax({
		url: clowderURL+"collections/newCollectionWithParent",
		type:"POST", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		data: JSON.stringify({ name: nestedCollectionName, description: nestedCollectionDescription, parentId: parentId }),
		
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
 			var newCollectionID = data.id
			getCollections(newCollectionID); 

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

//Create NEW dataset
function postDatasets() {

	var menuName = $('.nav-tabs .active > a').attr("href");
	var datasetDescription = $("" + menuName + " .datasetDescription").val(); 
    var datasetName = $("" + menuName + " .datasetName").val(); 
	var currentNodeId = getCurrentSelectedCollection();     
	$.ajax({
		url:clowderURL+"datasets/createempty",
		type:"POST", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		data: JSON.stringify({ name: datasetName, description: datasetDescription, authorId: author, collection: currentNodeId}),
		success: function(data){

			 if (menuName = "#basicMenu"){
				 postTemplate(false, data.id);	
				 getDatasets(currentNodeId, data.id); 
				 $('#collapse4').collapse('hide');
				 $('#collapse3').collapse('show');
				 $('#datasets').empty();
				 $('.datasetDescription').val('');
			     $(".templateData").empty();
			     $(".metaDataSettings").empty();	
				 $("#fileSubmit").removeClass("hidden");					
			     $("#fileSubmit").show("slow"); 
			     $(".prevOptions").hide(); 
				 $('.datasetName').val('');			 
				 $('.nav-tabs a:first').tab('show')

			 }else{	

				 var selectedMenu; 
				 var templateLength = ($(menuName + " .templates option").length);
				 var globalTemplateLength = ($(menuName + " .globalTemplates option").length);
				 var tagTemplateLength = ($(menuName + " .tagTemplates option").length);
				 if ($(templateLength > 1)){
				 	selectedMenu = " .templates";
				 }else if ($(globalTemplateLength > 1)){
				 	selectedMenu = " .globalTemplates";
				 }else if ($(tagTemplateLength > 1)){
				 	selectedMenu = " .tagTemplates";
				 }else{
				 	selectedMenu = " .templates";
				 }
				 addTemplateToDataset(data.id, $("" + selectedMenu + "").val());

				 getDatasets(currentNodeId, data.id); 

				 $('#collapse4').collapse('hide');
				 $('#collapse3').collapse('show');
				 $('#datasets').empty();
				 $('.datasetDescription').val('');
			     $(".templateData").empty();
			     $(".metaDataSettings").empty();	
				 $("#fileSubmit").removeClass("hidden");					
			     $("#fileSubmit").show("slow"); 
			     $(".prevOptions").hide(); 
				 $('.datasetName').val('');			 
				 $('.nav-tabs a:first').tab('show')


				}
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

function addTemplateToDataset(datasetid, templateID){
	var url = baseURL+ "t2c2/templates/" + templateID + "/attachToDataset/" + datasetid + ""; 
	$.ajax({
		url: url,
		type:"PUT", 
		beforeSend: function(xhr){
			xhr.setRequestHeader("Content-Type", "application/json"); 
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		}, 
		data: JSON.stringify({ template_id: templateID, dataset_id: datasetid}),
		success: function(data){

		}, 
		error: function(xhr, status, error) {
			swal({
			  title: "Error", 
			  text: "There was a problem creating this dataset",
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
            	fileDict[key.trimLeft()] = val; 
            }

			counter = numFiles - 1;
	    	uploadObj.startUpload();
		}else{
			$("#lblDatasetCheck").text("You must select or create a dataset before uploading a file.")
		}
	 }

});	

//Removes previos error messages when a new tab is selected
$(".custMenu, .createMenu, .clearMenu, .prevMenu").on('click', function() {
	var validator = $("#formGetDatasets").validate();
	validator.resetForm();
	$("label.error").hide();
    $(".error").removeClass("error");	
	counter1.reset();

}); 

function disableRequiredInput(){

	 var menuName = $('.nav-tabs .active > a').attr("href");
	 if (menuName != "#createMenu"){

		$.each($('.requireField'), function(idx){

			var currentId = (this.id);
			var counter = currentId.match(/\d+/); 

			if ($(this).val() == "true") {
				$("#btnRemove" + counter).attr("disabled", true);
			}

			$("#requireField" + counter).attr("disabled", true);

		}); 
	 }
}

$("#formGetDatasets").validate();

$(".btnDataset").on('click', function(e) {

  	var menuName = $('.nav-tabs .active > a').attr("href");
	var jsTreeValid = false; 

	// work around for jstree validation 
	var numSelections = $("#collections").jstree("get_selected");

	if (numSelections.length == 0){
		$(".validCollection").show();
		jstreeValid = false; 
	}else{
		jstreeValid = true; 
	}

	datasetRequireAll(); 
	datasetRequiredFields(); 

	if ($("#formGetDatasets").valid() && jstreeValid == true){
		postDatasets(e); 
	}
});	

//If row is required
function datasetRequireAll(){

	$.each($('.requireField'), function(idx){

		var currentId = (this.id);
		var counter = currentId.match(/\d+/); 

		if ($(this).val() == "true") {
			$("#metaDataKey" + counter).rules('add', {
				required: true, 
			    maxlength: 50
			}); 
			$("#metaDataUnit" + counter).rules('add', {
				required: true, 
			    maxlength: 50
			}); 
			$("#metaDataType" + counter).rules('add', {
				required: true, 
			    maxlength: 50
			}); 
			$("#metaDataVal" + counter).rules('add', {
				required: true, 
			    maxlength: 50
			}); 

		}else{

			$("#metaDataKey" + counter).rules("remove", "required"); 
			$("#metaDataUnit" + counter).rules("remove", "required"); 
			$("#metaDataType" + counter).rules("remove", "required"); 
			$("#metaDataVal" + counter).rules("remove", "required"); 

		}

	}); 
}

//If a value has been added but dependent fields aren't filled out (key, unit, type)
function datasetRequiredFields(){

		$.each($('.metaDataVal'), function(idx) {

			var currentId = (this.id);
			var counter = currentId.match(/\d+/); 
			var currentElementValue = $(this).val(); 

			if ($.trim(currentElementValue).length > 0) {

				$("#metaDataKey" + counter).rules('add', {
					required: true, 
				    maxlength: 50
				}); 

				$("#metaDataUnit" + counter).each(function () {
				    $(this).rules('add', {
				        required: true, 
				        maxlength: 50
				    });
				});

				$("#metaDataType" + counter).each(function () {
				    $(this).rules('add', {
				        required: true
				    });
				});	

				var type = $("#metaDataType" + counter + " option:selected").val(); 

				switch(type){
					case 'number':
						$(this).rules('add', {
							number: true, 
		 					maxlength: 20					
						}); 
					    $(this).rules('remove',"equals");
       					break;

					case 'boolean':
						$(this).rules('add', {
							equals: ["true", "false"]
						}); 
					    $(this).rules('remove',"number");
        				break;

					case 'string':
						$(this).rules('add', {
							maxlength: 50
						}); 
					    $(this).rules('remove',"number");
					    $(this).rules('remove',"equals");
       					break;

				}

			}
	});

}

//Validate collections 
$("#formGetCollections").validate({
    submitHandler: function() {
		postRootCollection(); 
    }
});

function buildTemplate(idName) {
    var metaDataKeys = $.map($(idName + ' .metaDataKey'), function (el) { return el.value; });
    var metaDataVals = $.map($(idName + ' .metaDataVal'), function (el) {return el.value;});
    var metaDataUnits = $.map($(idName + ' .metaDataUnit'), function (el) {return el.value;});
    var metaDataTypes = $.map($(idName + ' .metaDataType'), function (el) {return el.value;});
    var requireField = $.map($(idName + ' .requireField'), function (el) {return el.value;});

    var arr = [];

    $.each(metaDataKeys, function (idx, keyName) {
        if (keyName != ''){
            var objCombined = {};
            objCombined['key'] = keyName;
            objCombined['units'] = metaDataUnits[idx];;
            objCombined['data_type'] = metaDataTypes[idx];;
            objCombined['default_value'] = metaDataVals[idx];
            objCombined['required'] = requireField[idx];

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
  		var menuName = $('.nav-tabs .active > a').attr("href");

        div.html(createDiv(" "));
		// $("#prevMenu .templateData").append(div);


		//Future: check and see if any classes with this value exist already before making another input
        $(menuName + " .metaDataSettings").append(div);
		$(".metaDataKey").first().focus(); 
		$(".existingDS").show(); 
		$(".btnDataset").show();
		$("#btnTemplate").show();
		disableRequiredInput(); 
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

function counter() {
   var count = 0;

   this.reset = function() {
       count = 0;
       return count;
   };

   this.add = function() {
       return ++count;
   };
}

var counter1 = new counter();

//Create dynamic textbox
function createDiv(keyName, val, units, dataType, requireField) {
    var valKeyName = $.trim(keyName);
    var valStr = $.trim(val);
    var valUnits = $.trim(units);
    var valType = $.trim(dataType);
    var requireField = $.trim(requireField);

    if (requireField == ""){
    	requireField = "false";
    }
  	var menuName = $('.nav-tabs .active > a').attr("href");

  	//format text 
    var txtToWrite = "";

    if (menuName == "#createMenu"){
    	txtToWrite = "Optional Value:";
    }else{
    	txtToWrite = "Value: "
    }

	var i = counter1.add();    
    var txtString = dataType == "string" ? "<option value='string' selected>String</option>" : "<option value='string'>String</option>"; 
    var txtNumber = dataType == "number" ? "<option value='number' selected>Number</option>" : "<option value='number'>Number</option>"; 
    var txtBoolean = dataType == "boolean" ? "<option value='boolean' selected>Boolean</option>" : "<option value='boolean'>Boolean</option>"; 

    var txtTrue = requireField == "true" ? "<option value='true' selected>Yes</option>" : "<option value='true'>Yes</option>"; 
    var txtFalse = requireField == "false" ? "<option value='false' selected>No</option>" : "<option value='false'>No</option>"; 

    return '<div class="row top-buffer"><div class="col-xs-3"><b>' + "<label for='name'>Name: " + '</b></label>' +
        '<input class="metaDataKey form-control" name="metaDataKey' + i + '" id="metaDataKey' + i + '" type="text" value=' + valKeyName.replace(/ /g,"&nbsp;") +'></div>' +

        '<div class="col-xs-2"><b>' + "<label for='name'>Unit Type: " + '</label></b>' +
        '<input class="metaDataUnit form-control" name="metaDataUnit' + i + '" id="metaDataUnit' + i + '" type="text" value=' + valUnits.replace(/ /g,"&nbsp;") +'></div>' +

        '<div class="col-xs-2" style=""><b>' + "<label for='val'>Data Type: " + '</label></b>' +
        '<select class="metaDataType form-control" name="metaDataType' + i + '" id="metaDataType' + i + '" >' +
        '' + txtString + '' + 
        '' + txtNumber + '' + 
        '' + txtBoolean + '' + 
        '</select></div>' +

        '<div class="col-xs-2" style="margin-left:-15px;"><b>' + "<label for='val'>"+ txtToWrite + '</b></label>' +
        '<input class="metaDataVal form-control" name="metaDataVal' + i + '" id="metaDataVal' + i + '" type="text" value=' + valStr.replace(/ /g,"&nbsp;") +'></div>' +

        '<div class="col-xs-2" style="margin-left:-15px;"><b>' + "<label for='val'>Required: " + '</label></b>' +
        '<select class="requireField form-control" name="requireField' + i + '" id="requireField' + i + '" >' +
        '' + txtTrue + '' + 
        '' + txtFalse + '' + 
        '</select></div>' +

        '<div class="col-xs-1" style="margin-left:-15px;"><b>' + "<label for='val'>&nbsp;" + '</label></b>' +
        '<input type="button" value="Remove" class="remove btn btn-danger btnRemove" name="btnRemove' + i + '" id="btnRemove' + i + '"></div></div>'
        
}

$.validator.addMethod("equals", function(value, element, string) {
    return $.inArray(value, string) !== -1;
}, $.validator.format("Please enter {0} or {1}"));




