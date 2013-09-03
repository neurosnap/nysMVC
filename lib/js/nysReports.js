
function nysReport(options) {

	//unit test activation
	//this.tests();

	//reference the nysReports and not an anon function or anything else
	var that = this;

	//global base directory for nysReports
	this.init_dir = null;

	//used for datatables to tell if expanded view is open or closed
	this.anOpen = [];

	//Google Visualization required script flag
	this.found_google_jsapi = false;

	//get base directory of tblEditor
	$('script').each(function() {

		var src = $(this).attr('src');

		if (typeof src != 'undefined' && src.indexOf("nysReports.js") != -1)
			this.init_dir = src.substr(0, src.indexOf("nysReports.js") - 1);

		if (typeof src != 'undefined' && src.indexOf("jsapi") != -1)
			that.found_google_jsapi = true;

	});

	//AJAX data
	this.data = {

	};

	//Settings for instance of object
	this.settings = {
		//process page variable
		"proc_dir": '',
		//datatables object for post-initialization manipulation
		"dtbl_obj": null,
		//columns per row for filter section
		"filter_cols_per_row": 3,
		//Element IDs that connect all the views
		"views": {
			"filter_id": "filter_view",
			"chart_id": "chart_view",
			"grid_id": "grid_view",
			"settings_id": "reportOpts"
		},
		//buttons for the input view
		"buttons": {
			"run_report_id": "run_report",
			"clear_params_id": "clear_params",
			"save_params_id": "save_params"
		},
		"report_settings": {
			"enabled": false
		}
	};

	//merge default data with user defined options object
	$.extend(true, this.settings, options);

	//load google visualization if the script jsapi was found
	if (this.found_google_jsapi) {

		//necessary for google visualization
		//which needs JSAPI
		google.load("visualization", "1", { 'packages': ["corechart"], 'callback': $.proxy(this.init, this) });

	} else {

		this.init();

	}

}

//Round-house kick-start nysReports
nysReport.prototype.init = function() {

	$("#" + this.settings.views.filter_id).html("");
	$("#" + this.settings.views.chart_id).html("");
	$("#" + this.settings.views.grid_id).html("");



	this.loadInputView();
	this.listen();

	if (this.settings.hasOwnProperty("loadSelectContent") && this.settings.loadSelectContent.enabled)
		this.getSelectContent();
	else {
		this.getMainContent();
		this.initExtraChartView();
	}

}

//Gets select content for select2 options
nysReport.prototype.getSelectContent = function() {

	var that = this;

	$.ajax({
		"url": that.settings.loadSelectContent.url,
		"type": "POST",
		"dataType": "json",
		"data": that.settings.loadSelectContent.data,
		"success": function(res) {

			for (var i = 0; i < that.settings.filters.length; i++) {

				var field = that.settings.filters[i];

				if (field.hasOwnProperty("json_key"))
					$('#' + field.id).html(that.jsonToSelect(res[field.json_key]));

			}

			that.getMainContent();
			that.initExtraChartView();

		}
	});

}

//Gets main data via AJAX and loads the main grid and chart views
nysReport.prototype.getMainContent = function() {

	var that = this;
	var filter_data = that.getFilters();

	$.extend(true, filter_data, that.settings.loadMainContent.data);

	$.ajax({
		"url": that.settings.loadMainContent.url,
		"type": "POST",
		"dataType": "json",
		"cache": false,
		"data": filter_data,
		"beforeSend": function() {
		},
		"success": function(ret) {

			if (that.settings.loadMainContent.hasOwnProperty("mData") && that.settings.loadMainContent.mData.enabled) {

				that.data.main_query = that.settings.loadMainContent.mData.response(ret);

				that.loadGridView(that.data.main_query);

			} else {

				that.data.main_query = ret;

				that.loadGridView(ret);

			}

			if (that.settings.hasOwnProperty('loadChartView')) {
				if (that.settings.loadChartView.hasOwnProperty('enabled')) {
					if (that.settings.loadChartView.enabled) {
						that.loadChartView(that.data.main_query);
					} else {
						$("#div_charts").hide();
					}
				} else {
					that.loadChartView(that.data.main_query);
				}
			} else {
				$("#div_charts").hide();
			}
		}
	});

}

//Event handlers
nysReport.prototype.listen = function() {

	var that = this;

	//run report
	$("#content").on('click', '#' + this.settings.buttons.run_report_id, function() {

		that.getMainContent();

	});

	$("#content").on('click', '#' + this.settings.buttons.clear_params_id, function() {

		that.getFilters(true);

	});

	$(document).on('click', '#' + this.settings.views.grid_id + ' td.expanded_view', function() {

		//local var that holds the datatables object
		var oT = that.settings.dtbl_obj;
		//table row of the td clicked
		var row = this.parentNode;
		//checks for a value "row" in an array "anOpen"
	    var i = $.inArray( row, that.anOpen );

	    //inArray returns -1 if no match found
	    if (i === -1) {

	    	$(this).html('<a href="#" onclick="return false;">Collapse</a>');
			oT.fnOpen(row, that.initExpandedView(oT, row), 'details row' + row.rowIndex);
	      	that.anOpen.push( row);

	    } else {

		    $(this).html('<a href="#" onclick="return false;">Expand</a>');
		    oT.fnClose(row);
		    that.anOpen.splice(i, 1);

	    }

	});

}

//Loads all the filters set for the instance of reports
nysReport.prototype.loadInputView = function() {

	var content = '<div class="row-fluid"><div class="span12">';

	//dynamic row/column creation

	var col_count = this.settings.filter_cols_per_row;
	var count = 0;
	var tmp_span = Math.ceil((12 / col_count) * 10) / 10;
	var span = this.getSpans(tmp_span);

	for (var i = 0; i < this.settings.filters.length; i++) {

		var field = this.settings.filters[i];

		if (count == col_count) {

			content = content + '</div></div><div class="row-fluid"><div class="span12">';

			count = 0;

		}

		if (field.input == 'text') {

			content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.label.text +
								': </label>' +
								'<div class="span' + span.input + '">' +
									'<input type="text" name="' + field.id + '" id="' + field.id + '" value="" style="width: 90% !important;">' +
								'</div>';
		} else if (field.input == 'datepicker') {
			//date input

			content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.label.text +
								': </label>' +
								'<div class="span' + span.input + '">' +
									'<input type="text" name="' + field.id + '" id="' + field.id + '" value="' + this.getDate() +
									'" style="width: 90% !important;">' +
								'</div>';

		//select dropdown input
		} else if (field.input == 'select2' || field.input == 'select') {

			//if options array is detected then the select dropdown is generated instead of AJAX
			if (field.hasOwnProperty("options") && Array.isArray(field.options)) {

				content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.label.text +
									'</label>' +
									  '	<div class="span' + span.input + '">' +
									  	'<select name="' + field.id + '" id="' + field.id +
									  	'" class="nostyle" style="width: 100%;" placeholder="Select Option">' +
									  		'<option></option>';

				for (var z = 0; z < field.options.length; z++) {

					var op = field.options[z];

					content = content + '<option value="' + op.value + '">' + op.text + '</option>';

				}

				content = content + '</select></div>';

			//special group_by select
			} else if (field.id == 'group_by' && field.hasOwnProperty("group") && Array.isArray(field.group)) {

				content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.label.text +
									'</label>' +
									  '	<div class="span' + span.input + '">' +
									  	'<select name="' + field.id + '" id="' + field.id +
									  	'" class="nostyle" style="width: 100%;" placeholder="Group" ' +
									  	 ((field.multiple) ? 'multiple="multiple"' : '') + '>';

				for (var j = 0; j < field.group.length; j++)
					content = content + '<option value="' + field.group[j].value + '">' + field.group[j].text + '</option>';

				content = content + '</select></div>';

			} else {

				content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.label.text +
									': </label>' +
									'<div class="span' + span.input + '">' +
										'<select name="' + field.id + '" id="' + field.id +
										'" class="nostyle" style="width: 100%;" placeholder="Choose a filter" ' +
								  	 	((field.multiple) ? 'multiple="multiple"' : '') + '>' +
										'	<option></option>' +
										'	<option value="1">Test</option>' +
										'</select>' +
									'</div>';

			}

		}

		count++;

	}

	$('#' + this.settings.views.filter_id).html(content);

	//activates any special input plugins, formats, etc.
	for (var i = 0; i < this.settings.filters.length; i++) {

		var field = this.settings.filters[i];

		switch (field.input) {

			case "select":
			case "select2":

				if (typeof $.prototype.select2 === 'function' && field.input == 'select2') {

					$('#' + field.id).select2();

				}

			break;

			case "datepicker":

				if (typeof $.prototype.datepicker === 'function')
					$('#' + field.id).datepicker();

			break;

		}

	}

	//check for report settings module
	if (this.settings.hasOwnProperty("report_settings")) {

		if (this.settings.report_settings.enabled) {

			$("#" + this.settings.views.settings_id).html("Report settings enabled, loading settings ...");

		} else {

			$("#" + this.settings.views.settings_id).html("Report settings has not been enabled.");

		}

	}

}

//Loads the grid view datatable
nysReport.prototype.loadGridView = function(data) {

	var that = this;

	//Data found for main query?
	if (data.length > 0) {

		if (this.settings.hasOwnProperty("loadExpandGridView") && this.settings.loadExpandGridView.enabled)
			var fin = this.jsonToDataTables(data, true);
		else if (this.settings.hasOwnProperty("loadLaunchView") && this.settings.loadLaunchView.enabled)
			var fin = this.jsonToDataTables(data, false, true);
		else
			var fin = this.jsonToDataTables(data);

		//remove table which helps datatables reinitialize without folly
		if (this.settings.dtbl_obj != null) {

			this.settings.dtbl_obj.fnDestroy();

			if ($('#' + this.settings.views.grid_id).length > 0) {

				var parent = $('#' + this.settings.views.grid_id).parent();

				parent.html('<table id="' + this.settings.views.grid_id + '" class="display dtbl"></table>');

				this.settings.dtbl_obj = null;

			}

		} else {

			if ($('#' + this.settings.views.grid_id).length > 0) {

				var parent = $('#' + this.settings.views.grid_id).parent();

				parent.html('<table id="' + this.settings.views.grid_id + '" class="display dtbl"></table>');

				this.settings.dtbl_obj = null;

			}

		}

		//datatables object
		var dt_obj = {
			"bDestroy": true,
			//"sScrollX": "100%",
	        //"sScrollXInner": "110%",
	        "bScrollCollapse": true,
			"aaData": fin.rows,
			"aoColumns": fin.columns
		};

		//check for tabletools extension for exporting to excel, printing, etc.
		if (this.settings.loadMainContent.hasOwnProperty("options") &&
			this.settings.loadMainContent.options.hasOwnProperty("tabletools") &&
			this.settings.loadMainContent.options.tabletools.enabled) {

			dt_obj.sDom = 'T<"clear">lfrtip';

			dt_obj.oTableTools = {
	            "sSwfPath": this.settings.loadMainContent.options.tabletools.swf_dir + "/copy_csv_xls_pdf.swf"
	        };

	    }

		//initialize datatables and set a settings variable to hold the object
		this.settings.dtbl_obj = $('#' + this.settings.views.grid_id).dataTable(dt_obj);

		//DIV CLEAR is in wrong place for some weird reason
		$('#' + this.settings.views.grid_id).parent().find('div').each(function() {

			if ($(this).hasClass("clear")) {

				$(this).remove();

				$('#' + that.settings.views.grid_id).before('<div style="clear: both;"></div>');

			}

		});

		//center cells
		//$('#' + this.settings.views.grid_id + ' tr').css('text-align', 'center');

	//No data found for main query
	} else {

		//destroy any current datatables
		if (this.settings.dtbl_obj != null)
			this.settings.dtbl_obj.fnDestroy();

		//re-build datatables container
		if ($('#' + this.settings.views.grid_id).length > 0) {

			var parent = $('#' + this.settings.views.grid_id).parent();

			parent.html('<table id="' + this.settings.views.grid_id + '" class="display dtbl"></table>');

			this.settings.dtbl_obj = null;

			$('#' + this.settings.views.grid_id).html('<tr><th></th></tr><tr><td>No data found with the current filters.</td></tr>');

		}

	}

}

//Expanding datatables for "drilling down" content
nysReport.prototype.initExpandedView = function (oT, row) {

	var that = this;
	var data = this.getRowData(oT, row);
	var filter_data = this.getFilters();

	$.extend(true, data, filter_data);

	//closure variable
	var jx = [];
	//only blocking in javascript is via functional blocking,
	//therefore I pass the index var to createClosure() which then
	//returns the proper index var and consequently data for the ajax call below
	for (var i = 0; i < this.settings.loadExpandGridView.ajax.length; i++)
		jx[i] = this.createClosure(i, this.settings.loadExpandGridView.ajax);

	for (var i = 0; i < this.settings.loadExpandGridView.ajax.length; i++) {

		//closure
		var ajax = jx[i]();

		$.extend(true, data, ajax.data);

		$.ajax({
			"url": ajax.url,
			"type": "POST",
			"dataType": "json",
			"data": data,
			"success": function(ret) {

				if (ret !== null && ret.length > 0) {

					var content = '<div class="row-fluid">' +
									'<div class="span12" style="float: left !important;">' +
										'<div class="box chart">' +
											'<div class="title"><h4>' + ajax.datatable.title + '</h4></div>' +
											'<div class="content"><table id="' + ajax.datatable.el_id + '" class="display dtbl"></table></div>' +
										'</div>' +
									'</div>' +
								  '</div>';

					$("td.details.row" + row.rowIndex).html(content);
					var fin = that.jsonToDataTables(ret);

					//initialize datatables and set a settings variable to hold the object
					if (ajax.hasOwnProperty("datatable") && ajax.datatable.enabled) {

						var dt_obj = {
							"aaData": fin.rows,
							"aoColumns": fin.columns,
							"bAutoWidth": false,
							"bDestroy": true,
							"sDom": 'T<"clear">lfrtip'
						};

						//loadMainContent have any options?
						if (that.settings.loadMainContent.hasOwnProperty("options")) {

							//tabletools plugin?
							if (that.settings.loadMainContent.options.hasOwnProperty("tabletools")) {

								if (that.settings.loadMainContent.options.tabletools.enabled) {

									dt_obj.oTableTools = {
							            "sSwfPath": that.settings.loadMainContent.options.tabletools.swf_dir + "/copy_csv_xls_pdf.swf"
							        };

							    }

							}

						}

						ajax.datatable.obj = $('#' + ajax.datatable.el_id).dataTable(dt_obj);

						$('.dataTables_length').remove();

						//DIV CLEAR is in wrong place for some weird reason
						$('#' + ajax.datatable.el_id).parent().find('div').each(function() {

							if ($(this).hasClass("clear")) {

								$(this).remove();

								$('#' + ajax.datatable.el_id).before('<div style="clear: both;"></div>');


							}

						});

					}

				} else {

					$("td.details.row" + row.rowIndex).html('No data to display');

				}

			}
		});

	}

}

//Basic chart view loader
nysReport.prototype.loadChartView = function(data, extra_chart_view) {

	var view = null;
	var view_id = null;

	$('#div_charts').css('display', 'block');

	if (typeof extra_chart_view === 'undefined') {

		view = this.settings.loadChartView;
		view_id = this.settings.views.chart_id;

	} else {

		view = extra_chart_view.options;
		view_id = extra_chart_view.el_id;

	}

	var col = null;

	var x = '';
	var y = '';
	var filter_got = null;

	if (data != null && data.length > 0 && typeof data != 'undefined') {

		var chart = new google.visualization.DataTable();

		//get columns and x and y
		for (var j = 0; j < view.cols.length; j++) {

			col = view.cols[j];

			//check for special group_by feature
			if (col.type == "group_by") {

				//loop for filters to search for corresponding group array in filters object
				for (var f = 0; f < this.settings.filters.length; f++) {

					var filter = this.settings.filters[f];

					if (filter.hasOwnProperty("group")) {

						if ($("#" + filter.id).val() === null || $("#" + filter.id).val() == "") {

							chart.addColumn("string", col.name);

							if (col.axis == "x")
								x = col.name;
							else
								y = col.name;

						} else {

							chart.addColumn("string", $("#" + filter.id).val());

							filter_got =  $("#" + filter.id).val();

						}

						//need x and y titles
						if (col.hasOwnProperty("axis")) {

							var group_vals = $("#" + filter.id).val();

							if (group_vals != null) {

								for (var z = 0; z < filter.group.length; z++) {

									for (var y = 0; y < group_vals.length; y++) {

										if (filter.group[z].value == group_vals[y]) {

											//TODO: MAKE IT ACCEPT MORE THAN 1 COLUMN!
											switch (col.axis) {

												case "x":
													x = x + filter.group[z].text + ', ';
													break;

												case "y":
													y = y + filter.group[z].text + ', ';

											}

										}

									}

								}

								//remove last ', '
								x = String(x).slice(0, -2);
								y = String(y).slice(0, -2);

							}

						}

					}

				}

			} else {

				chart.addColumn(col.type, col.name);

				//need x and y titles
				if (col.hasOwnProperty("axis")) {

					switch (col.axis) {

						case "x":

							if (col.hasOwnProperty("as"))
								x = col.as;
							else
								x = col.name;

						break;

						case "y":

							if (col.hasOwnProperty("as"))
								y = col.as;
							else
								y = col.name;

						break;

					}

				}

			}

		}

		//get rows
		for (var i = 0; i < data.length; i++) {

			var row = [];

			for (var j = 0; j < view.cols.length; j++) {

				col = view.cols[j];

				if (col.type == "group_by") {

					//group by has values, so break them up and organize the data
					//for google visualization
					if (filter_got) {

						var group_values = [];
						var fin_value = '';

						//omg such a pain in the ass, correlating filter.group with
						//the current values of the group_by input
						for (var f = 0; f < this.settings.filters.length; f++) {

							var filter = this.settings.filters[f];

							if (filter.hasOwnProperty("group")) {

								for (var a = 0; a < filter.group.length; a++) {

									for (var z = 0; z < filter_got.length; z++) {

										if (filter.group[a].value == filter_got[z]) {

											//if "as" property is available, use that as the key
											//instead of the value of the group value
											//this is for when SQL column is different from the actual
											//column name, i.e. SELECT e.the_date as 'date'
											if (filter.group[a].hasOwnProperty("as")) {

												//var rec = String(filter.group[y].as);
												group_values.push(filter.group[a].as);

											} else {

												var rec = String(filter_got[z]);

												group_values.push(rec.substr(rec.indexOf(".") + 1, rec.length));

											}

										}

									}

								}

							}

						}

						for (var b = 0; b < group_values.length; b++) {

							fin_value = fin_value + data[i][group_values[b]] + ', ';

						}

						fin_value = String(fin_value).slice(0, -2);

						row.push(fin_value);

					} else {

						var val = col.name;

						if (!isNaN(data[i][val]))
							row.push(Math.round(data[i][val]));
						else
							row.push(data[i][val]);

					}

				} else {

					if (!isNaN(data[i][col.name]))
						row.push(Math.round(data[i][col.name]));
					else
						row.push(data[i][col.name]);

				}

			}

			chart.addRow(row);

		}

		if (!view.hasOwnProperty("title")) {
			var title = this.capFirst(y) + ' over ' + this.capFirst(x);
		}

		//Adjusting the chart type depending on number of rows
		//detected
		var chart_type = view.type;

		if (view.type == "LineChart" && data.length == 1)
			chart_type = "ColumnChart";

		//console.log("row: " + data.length + " type: " + chart_type);

		//google visualization object
		var chartObj = {
			"dataTable": chart,
			"containerId": view_id,
			"chartType": chart_type,
			"options": {
				"title": ((typeof title !== null) ? title : view.title),
				"hAxis": {
					"title": this.capFirst(x)
					/*"viewWindowMode": "explicit",
					"viewWindow": {
						"min": 0,
						"max": data[data.length - 1].ID + 1
					}*/
				},
				"vAxis": {
					"title": this.capFirst(y)
				}
			}
		};

		google.visualization.drawChart(chartObj);

	} else {

		$('#' + view_id).html('No data found with the current filters.');

	}

}

//Starts the process of getting extra chart data and loading it into the DOM
nysReport.prototype.initExtraChartView = function() {

	var that = this;

	if (this.settings.hasOwnProperty("loadExtraChartView")) {

		var jx = [];

		for (var j = 0; j < this.settings.loadExtraChartView.length; j++) {

			jx[j] = this.createClosure(j, this.settings.loadExtraChartView);

		}

		for (var i = 0; i < this.settings.loadExtraChartView.length; i++) {

			//closure
			var chart = jx[i]();

			if (chart.enabled) {

				var data = this.getFilters();

				$.extend(true, data, chart.ajax.data);

				$.ajax({
					"url": chart.ajax.url,
					"type": "POST",
					"dataType": "json",
					"data": data,
					"success": function(ret) {

						if (ret.success)
							that.loadChartView(ret, chart);
						else
							$('#' + chart.el_id).html(ret.message);

					}
				});

			}

		}

	}

}

nysReport.prototype.reportSettings = function() {

}

//JSON data to datatables compatible arrays
nysReport.prototype.jsonToDataTables = function(data, expand, launch) {

	var ret = {
		"columns": [],
		"rows": []
	};
	var row_agg = '';
	var first = true;

	if (typeof expand === 'undefined')
		expand = false;

	if (typeof launch == 'undefined')
		launch = false;

	if (expand)
		ret.columns.push({ "sTitle": "", "sClass": "expanded_view" });

	if (launch)
		ret.columns.push({ "sTitle": "", "sClass": "launch_view" });

	for (var i = 0; i < data.length; i++) {

		var obj = data[i];

		if (first) {

			for (var prop in obj)
				ret.columns.push({ "sTitle": prop });

			first = false;

		}

		if (expand)
			row_agg = '<a href="#" onclick="return false;" mod_ID="' + data[i].ID + '">Expand</a>,';
		else if (launch)
			row_agg = '<a href="' + base_dir + '/reports/information/BirthCertificate/' + data[i].ID + '" onclick="return false;">Launch</a>,';
		else
			row_agg = '';

		for (var prop in obj)
			row_agg = row_agg + obj[prop] + ',';

		row_agg = row_agg.slice(0, -1);
		ret.rows.push(row_agg.split(","));

	}

	return ret;

}

//JSON Select2 data converted into select options
nysReport.prototype.jsonToSelect = function(data) {

	var content = '<option value=""> - Choose - </option>';

	for (var i = 0; i < data.length; i++) {
		content = content + '<option value="' + data[i].value + '">' + data[i].text + '</option>';
	}

	return content;

}

//Returns an object containing all the values of the filters for the report
nysReport.prototype.getFilters = function(clear) {

	var obj = {};

	for (var i = 0; i < this.settings.filters.length; i++) {

		var field = this.settings.filters[i];

		if (clear) {

			if ($('#' + field.id).hasClass("hasDatepicker"))
				$('#' + field.id).val(this.getDate());
			else
				$('#' + field.id).select2('data', null);

		} else {

			if ($('#' + field.id).val() != "")
				obj[field.id] = $('#' + field.id).val();

		}

	}

	if (!clear)
		return obj;

}

//Gets the row data within datatables as well as the associated column name
nysReport.prototype.getRowData = function(oT, row) {

	var row_data = oT.fnGetData(row);
	var aoCol = oT.fnSettings().aoColumns;
	var obj = {};
	var col = '';

	for (var i = 0; i < aoCol.length; i++) {

		if (i < row_data.length) {

			col = aoCol[i].sTitle.toLowerCase().replace(/ /gi,'_');
			obj[col] = row_data[i];

		} else {

			//should not happen
			alert('aoCol length and row_data length are not matching up.');

		}

	}

	if (this.settings.loadExpandGridView.enabled && obj.hasOwnProperty(""))
		delete obj[""];

	return obj;

}

//Gets current date in the format we like for datepicker
nysReport.prototype.getDate = function() {

	var d = new Date();

	return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();

}

//Calculates span width of labels and input boxes for
//input view
nysReport.prototype.getSpans = function(col_span) {

	var fin = {};
	var label_offset = 1;

	if (this.isOdd(col_span)) {

		var span = Math.ceil(col_span * 10) / 10;
		fin.label = span - label_offset - 1;
		fin.input = span + label_offset + 1;

	} else {

		fin.label = col_span / 2 - label_offset;
		fin.input = col_span / 2 + label_offset;

	}

	return fin;

}

//Looping with a closure is confusing,
//basically this allows the for loop incrementing variable "i" to be carried through the ajax success call.
//Without a proper closure, the "i" variable would always be at its max when the response came back from ajax
//The only real blocking in javascript are through functions
nysReport.prototype.createClosure = function(index, arr) {

	return function() { return arr[index] };

}

//Checks if number is odd.
nysReport.prototype.isOdd = function(num) {

	return num % 2;

}

//Capitalize first letter in string
nysReport.prototype.capFirst = function(string) {

    return string.charAt(0).toUpperCase() + string.slice(1);

}

//unit test setup
nysReport.prototype.unit = function(name, unit_test) {

	if ($("#nysus_unit").length == 0) {

		var content = '<a href="#" id="nysus_unit_link">Unit Tests</a>' +
					  '<div id="nysus_unit">' +
						'<div id="qunit"></div>' +
						'<div id="qunit-fixture"></div>' +
					  '</div>';

		$("#content").append(content);

		$("#nysus_unit").hide();

		$("#content").on("click", "#nysus_unit_link", function(e) {

			$("#nysus_unit").toggle();
			return false;

		});

	}

	//test(name, unit_test);

}

//unit tests
nysReport.prototype.tests = function() {

	var that = this;

	/*this.unit("loadGridView", function() {

	});

	this.unit("loadChartView", function() {

	});*/

	this.unit("createClosure", function() {

		var arr = ["", "one", 2, { "key": "three" }];

		equal(typeof that.createClosure(0, arr), "function", "empty string typeof");

		equal(typeof that.createClosure(1, arr), "function", "string typeof");

		equal(typeof that.createClosure(2, arr), "function", "number typeof");

		equal(typeof that.createClosure(3, arr), "function", "obj key typeof");

	});

	/*this.unit("jsonToSelect", function() {

	});

	this.unit("jsonToDataTables", function() {

	});*/

}