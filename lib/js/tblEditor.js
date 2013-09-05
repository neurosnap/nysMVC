/* =======================================================================
 * tblEditor.js v1.1.0
 * https://github.com/nysus/tblEditor
 * Dependencies:  jQuery, DataTables, Bootstrap
 * =======================================================================
 * Copyright 2013 Nysus Solutions, Inc.
 *
 *  This file is part of tblEditor.
 * 
 *  tblEditor is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  tblEditor is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with tblEditor.  If not, see <http://www.gnu.org/licenses/>.
 *
 * ======================================================================= */

function tblEditor(options) {

	var init_dir = null;

	//get base directory of tblEditor
	$('script').each(function() {

		var src = $(this).attr('src');

		if (typeof src !== 'undefined' && src.indexOf("tblEditor.js") != -1)
			init_dir = src.substr(0, src.indexOf("tblEditor.js") - 1);

	});

	//var for datatables initialization
	this.dt = null;

	//class scope random number for certain element IDs
	this.rand = Math.floor(Math.random()*1000);

	//Ignore Columns
	this.ignore_cols = [];

	//ct datatable var
	this.anOpen = [];

	//necessary for proper sorting in datatables with input boxes
	this.data_sort = [];

	//plupload object
	this.uploaders = {};

	//special options stored for each column from JSON in description field of SQL column
	this.field_special = [];

	//All AJAX data
	this.data = {

		"table_fields": null,
		"table_data": null,
		"related_ids": [],
		//Various foreign key data needed for complete functionality
		"fk": {
			"data": [], //"fk_data": [],
			"relationships": null, //"relationships": null,
			"references": null, //"ref": null,
			"keys": null //"table_foreign_keys": null,
		}

	};

	//all options that can be set before this.init(); gets hit
	this.settings = {

		//debug mode
		"debug": false,
		//database table name
		"table": null,
		//table description
		"desc": null,
		//div container that holds the table
		"container": "body",
		//processing page
		"url": init_dir + "/tblEditor.asp",
		//base url
		"base_dir": init_dir,
		"field_validation": [],
		//password protect column
		"pass_protect_col": [],
		//max of 3 FK relationships
		"fk_override": [],
		"plupload": {
			//company ID used for image uploading
			"company_ID": "1337",
			//product name used for image uploading
			"product_name": "tblEditor",
			//image directory for file uploads
			"img_dir": "/nysus/scheduling/uploads",
			//plupload directory
			"plupload_dir": "/nysus/scheduling/tblEditor/plupload",
			//"resize": {}
		},
		"style": {
			//max input length
			"max_inp_length": 130,
			//min input length
			"min_inp_length": 25
		},
		//Setting cross reference variables, necessary for cross referencing two tables
		"xref": {
			"enabled": false,
			"rows": null,
			"row_filter": null,
			"cols": null,
			"col_filter": null
		},
		//Set hard-coded values for the table query, i.e. filter by SITE_ID using these variables
		"hc": {
			"enabled": false,
			"field": null,
			"operator": null,
			"value": null,
			"position": null
		},
		//foreign key filter field and clause data
		"fk_filter": [],
		//fk extra field hard-coded into the foreign key data
		"fk_special": [],
		//ct = cascade table -- allows for nested tblEditors, with all its functionality
		"ct": { 
			"enabled": false, 
			"table": null, 
			"ref_col": null, 
			"ret_col": null, 
			"options": null 
		},
		"read_only": [],
		"allow_delete": true,
		"textarea": [],
		"add_records": true,
		"onLoad": function() {},
		"datatable": {}

	};

	//merge default data with user defined options object
	$.extend(true, this.settings, options);

	if (typeof options !== 'undefined') {
		this.init();
	}

}

//Object setters

tblEditor.prototype.setDebug = function(boo) {
	if (boo)
		this.settings.debug = true;
	else
		this.settings.debug = false;
};

tblEditor.prototype.setMaxInpLength = function(num) {
	this.settings.style.max_inp_length = num;
};

tblEditor.prototype.setMinInpLength = function(num) {
	this.settings.style.min_inp_length = num;
};

tblEditor.prototype.setBaseDirectory = function(dir) {
	this.settings.base_dir = dir;
};

tblEditor.prototype.setURL = function(url) {
	this.settings.url = url;

	if (this.settings.debug)
		debug.log('url: ' + this.settings.url);
};

tblEditor.prototype.setTable = function(tbl_name) {
	this.settings.table = tbl_name;

	if (this.settings.debug)
		debug.log('Table Set: ' + this.settings.table);
};

tblEditor.prototype.setDesc = function(tbl_desc) {
	this.settings.desc = tbl_desc;

	if (this.settings.debug)
		debug.log('Table Description Set: ' + this.settings.desc);
};

tblEditor.prototype.setContainer = function(div) {
	this.settings.container = div;

	if (this.settings.debug)
		debug.log('DIV Container Set: ' + this.settings.container);
};

tblEditor.prototype.setProductName = function(prod_name) {
	this.settings.plupload.product_name = prod_name;

	if (this.settings.debug)
		debug.log('Product Name: ' + this.settings.plupload.product_name);
};

tblEditor.prototype.setImageDirectory = function(dir) {
	this.settings.plupload.img_dir = dir;
};

tblEditor.prototype.setPluploadDirectory = function(dir) {
	this.settings.plupload.plupload_dir = dir;
};

tblEditor.prototype.setHC = function(field, operator, value, position) {
	this.settings.hc.enabled = true;
	this.settings.hc.field = field;
	this.settings.hc.operator = operator;
	this.settings.hc.value = value;

	if (typeof position === 'undefined')
		this.settings.hc.position = 0;
	else
		this.settings.hc.position = position;

	if (this.settings.debug) {
		debug.log('HC Field Set: ' + this.settings.hc.field);
		debug.log('HC Operator Set: ' + this.settings.hc.operator);
		debug.log('HC Value Set: ' + this.settings.hc.value);
		debug.log('HC Position Set: ' + this.settings.hc.position);
	}
};

tblEditor.prototype.setCascadeTable = function(table, ref_col, ret_col) {

	if (table != null && ref_col != null) {
		this.settings.ct.enabled = true;
		this.settings.ct.table = table;
		this.settings.ct.ref_col = ref_col;
		this.settings.ct.ret_col = ret_col;
	}

};

tblEditor.prototype.setFKFilter = function(ftable, ffield, fclause) {
	this.settings.fk_filter.push({ 
		"field": ffield, 
		"clause": fclause, 
		"table": ftable 
	});
};

tblEditor.prototype.setFKSpecial = function(fcol, ffield, fvalue) {

	if (fcol != null && ffield != null) {

		this.settings.fk_special.push({ "col": fcol, "text": ffield, "value": fvalue });

	} else {
		alert('Foreign Key special field does not have all required paramenters to continue');
	}

};

//Functionality

tblEditor.prototype.ignoreColumns = function(arr) {
	this.ignore_cols = arr;

	if (this.settings.debug) {
		debug.log('Ignored Colums Set:');
		for (x in arr) {
			debug.log((x + 1) + ': ' + arr[x]);
		}
	}
};

tblEditor.prototype.setXref = function(rows, row_filter, cols, col_filter) {
	this.settings.xref.enabled = true;
	this.settings.xref.rows = rows;
	this.settings.xref.row_filter = row_filter;
	this.settings.xref.cols = cols;
	this.settings.xref.col_filter = col_filter;

	if (this.settings.debug) {
		debug.log('Xref Rows Set: ' + this.settings.xref.rows);
		debug.log('Xref Row Filter Set: ' + this.settings.xref.row_filter);
		debug.log('Xref Cols Set: ' + this.settings.xref.cols);
		debug.log('Xref Col Filter Set: ' + this.settings.xref.col_filter);
	}
};

tblEditor.prototype.overrideDelete = function() {

	if (!this.settings.allow_delete)
		return true;
	else
		return false;

}

tblEditor.prototype.allowDelete = function(row_ID) {


	if (this.data.fk.relationships != null && this.data.related_ids != null) {
		for (var i = 0; i < this.data.fk.relationships.length; i++) {
			if (this.data.fk.relationships[i].delete_referential_action == 0) {
				for (var j = 0; j < this.data.related_ids.length; j++) {
					if (this.data.related_ids[j].table_name == this.data.fk.relationships[i].fk_table) {
						for (var x = 0; x < this.data.related_ids[j].fk_data_count.length; x++) {
							if (this.data.related_ids[j].fk_data_count[x].ref_ID == row_ID && this.data.related_ids[j].fk_data_count[x].data_count > 0)
								return false;
						}
					}
				}
			} 
		}
	}

	return true;

};

//kick-starts the data requests and table display
tblEditor.prototype.init = function() {

	if (this.settings.debug) {
		debug.log('settings: ' + JSON.stringify(this.settings));
		debug.log('data: ' + JSON.stringify(this.data));
	}

	if (this.settings.xref.enabled) {

		var data = {
			"action": "get_table_xref",
			"table_name": this.settings.table,
			"xref_rows":  this.settings.xref.rows,
			"row_filter": this.settings.xref.row_filter,
			"xref_cols": this.settings.xref.cols,
			"col_filter": this.settings.xref.col_filter
		};

		var obj = this;

		$.ajax({

			"url": obj.url,
			"type": 'POST',
			"dataType": 'json',
			"data": data,
			"success": function(res) {

				//sets some globals
				obj.data.table_fields = res;

				obj.buildXrefTable();

			}

		});

	} else {

		var obj = this;

		var data = {
			"action": "get_table_info",
			"table_name": this.settings.table
		};

		if (this.settings.hc.enabled) {
			data.hard_coded_field = this.settings.hc.field;
			data.hard_coded_operator = this.settings.hc.operator;
			data.hard_coded_value = this.settings.hc.value;
		}

		if (this.settings.fk_filter.length > 0) {

			//build an array for all the foreign key filters
			data.fk_filtered_table = [];
			data.fk_filtered_field = [];
			data.fk_filtered_clause = [];

			for (var i = 0; i < this.settings.fk_filter.length; i++) {

				//add all the currently stored foreign key filters
				data.fk_filtered_table.push(this.settings.fk_filter[i].table);
				data.fk_filtered_field.push(this.settings.fk_filter[i].field);
				data.fk_filtered_clause.push(this.settings.fk_filter[i].clause);

			}

		}	

		if (this.settings.hasOwnProperty("fk_override") && this.settings.fk_override.length > 0) {


			for (var i = 0; i < this.settings.fk_override.length; i++) {

				var fk_override = this.settings.fk_override[i];

				if (i == 0) {

					data.fk_override_tbl_first = fk_override.ref_tbl;
					data.fk_override_refcol_first = fk_override.ref_col;
					data.fk_override_col_first = fk_override.col;
					data.fk_override_desc_first = fk_override.desc;

				} else if (i == 1) {

					data.fk_override_tbl_second = fk_override.ref_tbl;
					data.fk_override_refcol_second = fk_override.ref_col;
					data.fk_override_col_second = fk_override.col;
					data.fk_override_desc_second = fk_override.desc;

				} else if (i == 2) {

					data.fk_override_tbl_third = fk_override.ref_tbl;
					data.fk_override_refcol_third = fk_override.ref_col;
					data.fk_override_col_third = fk_override.col;
					data.fk_override_desc_third = fk_override.desc;

				}

			}

		}

		if (this.settings.debug)
			debug.log('before ajax');

		//AJAX call that grabs all necessary table schema data and the values
		$.ajax({
			"url": obj.settings.url,
			"type": 'POST',
			"dataType": 'json',
			"data": data,
			"beforeSend": function() {
				$(obj.settings.container).html('<div style="text-align: center;"><img src="https://d1dah60mzcyfe0.cloudfront.net/theme_supr/images/loader.gif" /></div>');
			},
			"success": function(res) {

				//sets some globals
				obj.data.table_fields = res.fields;
				obj.data.table_data = res.table_data;
				obj.data.related_ids = res.related_IDs;

				obj.data.fk.keys = res.foreign_key_data;
				obj.data.fk.relationships = res.foreign_key_relationships;
				obj.data.fk.references = res.foreign_key_ref;

				var d = null;

				for (var i = 0; i < obj.data.fk.keys.length; i++) {
	
					d = obj.data.fk.keys[i];

					obj.data.fk.data.push({ "field": d.COLUMN_NAME, "data": d.REF_DATA });

				}

				if (obj.settings.debug)
					debug.log('about to build table');

				obj.buildTable();

			}

		});

	}

}

tblEditor.prototype.buildTable = function() {

	var obj = this;

	obj.updateFieldSpecial();

	var content = '';

	if (obj.settings.desc != null)
		content = '<div id="' + obj.settings.table + '_desc">' + obj.settings.desc + '</div>';

	//table that will be converted into datatables
	content = content + '<table width="100%" class="tbleditor" id="' + obj.settings.table + '_dtbl_' + obj.rand + '"><thead><tr>';

	if (obj.settings.ct.enabled)
		content = content + '<th></th>';

	for (var i = 0; i < obj.data.table_fields.length; i++) {
		if ( !obj.isColumnIgnored(obj.data.table_fields[i]) || !obj.isNullable(obj.data.table_fields[i].COLUMN_NAME) ) {

			content = content +
					  '<th>' +
					  obj.data.table_fields[i].COLUMN_NAME.replace('_ID','')
					  						   .replace(/_/ig, ' ')
					  						   .replace(/ /ig, '<br />')
					  						   .toUpperCase() +
					  '</th>';

		}
	}

	if (!obj.overrideDelete()) {
		content = content + '<th>ACTIONS</th>';
	}

	content = content + '</tr></thead><tbody>';

	for (var i = 0; i < obj.data.table_data.length; i++) {
		var data_row = obj.data.table_data[i];

		content = content + '<tr id="tr~-' + obj.settings.table + '~-' + data_row.ID + '">';

		if (obj.settings.ct.enabled)			
			content = content + '<td><a href="#" onclick="return false;" ref_ID="' + data_row.ID + '" class="ct_' + obj.settings.table + '"><img src="' + obj.settings.base_dir + 
					  '/assets/images/magnifier--plus.png" style="max-width: none !important;"></a></td>';

		for (var j = 0; j < obj.data.table_fields.length; j++) {
			var data_row_fields = obj.data.table_fields[j];

			var get = obj.getCellContents(data_row_fields,
								data_row[data_row_fields.COLUMN_NAME],
						        obj.data.fk.keys,
						        data_row.ID,
						        true);

        	if ( !obj.isColumnIgnored(data_row_fields) || !obj.isNullable(data_row_fields.COLUMN_NAME) ) {
				content = content + '<td nowrap id="td_' + data_row_fields.COLUMN_NAME +
								    '_' + data_row.ID + '">' + get + '</td>';
			}

		}

		if (!obj.overrideDelete()) {

			if (obj.data.fk.relationships == null || obj.allowDelete(data_row.ID)) {
				content = content + '<td id="td_delete_' + data_row.ID + '" table_name="' + obj.settings.table +
						  '" row_ID="' + data_row.ID + '">' +
						  '<a href="#" class="delete__' + obj.settings.table +
						  '" onclick="return false;"><img src="' + obj.settings.base_dir + 
						  '/assets/images/bin--exclamation.png"> Delete!</a></td>';
			} else {
				content = content + '<td></td>';
			}

		}

		content = content + '</tr>';
	}

	if (obj.settings.debug)
		debug.log('Table is built');

	content = content + '</tbody></table>';
	$(obj.settings.container).html(content);

	if (obj.settings.debug)
		debug.log('before datatable sorting');

	//get data types for fields
	var col_sorting = [];

	//for Cascade Table column
	if (obj.settings.ct.enabled)
		col_sorting.push(null);

	var fk_flag = false;
	for (var i = 0; i < obj.data.table_fields.length; i++) {

		if (!obj.isColumnIgnored(obj.data.table_fields[i]) || !obj.isNullable(obj.data.table_fields[i].COLUMN_NAME)) {

			fk_flag = false;

			for (var j = 0; j < obj.data.fk.data.length; j++) {

				if (obj.data.table_fields[i].COLUMN_NAME == obj.data.fk.data[j].field && !obj.readOnly(obj.data.table_fields[i].COLUMN_NAME)) {

					col_sorting.push({ 
						"sSortDataType": "dom-select", 
						"sType": "string" 
					});

					fk_flag = true;
					break;

				}

			}

			if (fk_flag == false) {

				if ((obj.data.table_fields[i].DATA_TYPE == 'varchar' 
					|| obj.data.table_fields[i].DATA_TYPE == 'int'
					|| obj.data.table_fields[i].DATA_TYPE == 'smallint'
					|| obj.data.table_fields[i].DATA_TYPE == 'datetime')
					&& obj.data.table_fields[i].IS_IDENTITY != 1 
					&& !obj.readOnly(obj.data.table_fields[i].COLUMN_NAME)) {

						var ta = false;

						for (var z = 0; z < obj.settings.textarea.length; z++) {

							if (obj.data.table_fields[i].COLUMN_NAME == obj.settings.textarea[z].col) {
								ta = true;
								break;
							}

						}

						if (ta) {
							col_sorting.push({ 
								"sSortDataType": "dom-textarea", 
								"sType": "string" 
							});
						} else if (obj.data.table_fields[i].DATA_TYPE == 'varchar' || obj.data.table_fields[i].DATA_TYPE == 'datetime') {
							col_sorting.push({ 
								"sSortDataType": "dom-text", 
								"sType": "string" 
							});
						} else {
							col_sorting.push({ 
								"sSortDataType": "dom-text", 
								"sType": "numeric" 
							});
						}

				} else { 
					col_sorting.push(null); 
				}

			}

		}

	}

	//for ACTIONS column
	if (!obj.overrideDelete())
		col_sorting.push(null);

	obj.data_sort = {
		"aoColumns": col_sorting,
		"sPaginationType": "bootstrap",
	};

	if (obj.settings.hasOwnProperty("datatable") 
		&& obj.settings.datatable.hasOwnProperty("enabled") 
		&& obj.settings.datatable.enabled) {
			$.extend(true, obj.data_sort, obj.settings.datatable.options);
	}

	if (obj.settings.debug)
		debug.log('before viewTbl()');

	obj.viewTbl();

	if (obj.settings.hasOwnProperty("onLoad")) {
		obj.settings.onLoad();
	}

};

tblEditor.prototype.buildXrefTable = function() {

	var obj = this;
	var content = '';

	if (obj.settings.desc != null)
		content = '<div id="' + obj.settings.table + '_desc">' + obj.settings.desc + '</div>';

	content = content + '<table class="tbleditor" width="100%" id="' + obj.settings.table + '_dtbl_' + obj.rand + '"><thead><tr>';

	var col_sorting = [];
	var count = 0;
	for (f in obj.data.table_fields[0]) {

		if (f != 'row_ID') {

			content = content + '<th> ' + ((count != 0) ? '<input type="checkbox" value="0" id="xref_header__' + f.toLowerCase().replace(/ /ig, '___') + '" class="xref_all_cols_' + obj.settings.table + '">' : '') + ' ' + f.replace(/_/ig, ' ').toUpperCase() + '</th>';

			if (typeof f === 'string') {
				col_sorting.push(null);
			} else {
				col_sorting.push({ "sSortDataType": "dom-checkbox" });
			}

			count++;
		}

	}

	content = content + '</tr></thead><tbody>';

	var tmp_row_ID = null;
	for (var i = 0; i < obj.data.table_fields.length; i++) {

		content = content + '<tr>';
		for (key in obj.data.table_fields[i]) {

			if (key == 'row_ID')
				tmp_row_ID = obj.data.table_fields[i][key];

		}

		var last_row = null;

		for (f in obj.data.table_fields[i]) {
			if (f != 'row_ID') {
				if (obj.data.table_fields[i][f] == true || obj.data.table_fields[i][f] == false) {
					content = content + '<td><input class="xref__' + obj.settings.table + '" id="' + tmp_row_ID + '~-' + f.replace(/ /ig, '___') + '~-' + last_row.toLowerCase().replace(/ /ig, '-_') + '" type="checkbox" value="1" ' +
					((obj.data.table_fields[i][f]) ? 'checked' : '') + ' onclick="return false;"></td>';
				} else {
					content = content + '<td><input type="checkbox" value="0" id="xref_rows__' + obj.data.table_fields[i][f].toLowerCase().replace(/ /ig, '~~~') + '" class="xref_all_rows__' + obj.settings.table + '"> ' + obj.data.table_fields[i][f]  + '</td>';
					last_row = obj.data.table_fields[i][f];
				}

			}
		}
		content = content + '</tr>';

	}

	content = content + '</tbody></table>';

	$(obj.container).html(content);

	obj.data_sort = {
		"aoColumns": col_sorting,
		"sPaginationType": "bootstrap"
	};

	if (obj.settings.hasOwnProperty("datatable") 
		&& obj.settings.datatable.hasOwnProperty("enabled") 
		&& obj.settings.datatable.enabled) {
			$.extend(true, obj.data_sort, obj.settings.datatable.options);
	}

	if (obj.settings.debug)
		debug.log('col_sorting: ' + col_sorting);

	obj.viewTbl();

};

//loads datatable and special buttons
tblEditor.prototype.viewTbl = function() {

	this.dt = $('#' + this.settings.table + '_dtbl_' + this.rand).dataTable(this.data_sort);

	if (this.settings.debug) {
		debug.log('tbl: ' + this.settings.table);
		debug.log(this.data_sort);
	}

	this.loadButtons();
	this.listenEdit();
};

//buttons for data modification
tblEditor.prototype.loadButtons = function() {

	var id = this.settings.container.replace("#", "");
	var obj = this;

	var content = '';

	if (!this.settings.xref.enabled && this.settings.add_records)
		content = content + '<a href="#" onclick="return false;" id="' + id + 
							'_new_row"><img src="' + this.settings.base_dir + '/assets/images/plus-button.png"> Add Record</a>  ';

	content = content + '<a href="#" onclick="return false;" class="refresh_me_' + obj.settings.table + 
						'"><img src="' + this.settings.base_dir + '/assets/images/arrow-circle-double.png"> Refresh</a>';

	$(this.settings.container).prepend(content);
	$(this.settings.container + '_new_row').click(function() {
		obj.addRow();
	});

};

//reloads the data
tblEditor.prototype.refresh = function() {

	this.fk_data = [];
	$(this.container).empty();
	this.init();

};

//Checks to see if the column is ignored within the column schema
tblEditor.prototype.isColumnIgnored = function(field) {

	try {

		var field_options = jQuery.parseJSON(field.FIELD_DESC);

		if (field_options == null)
			field_options = {};

		if (field_options.ignored)
			return true;
		else
			return false;

	} catch (e) {

		return false;

	}

};

//Checks the column name scheme in the database to check if the column is allowed to be null
tblEditor.prototype.isNullable = function(column_name) {

	var fields = this.data.table_fields;

	for (var i = 0; i < fields.length; i++) {

		if (fields[i].COLUMN_NAME == column_name) {
			if (fields[i].IS_NULLABLE == "YES" || fields[i].COLUMN_DEFAULT !== null) {
				return true;
			}
		}

	}

	return false;

};

tblEditor.prototype.updateFieldSpecial = function() {

	for (var i = 0; i < this.data.table_fields.length; i++) {

		var field = this.data.table_fields[i];
		var field_desc = field.FIELD_DESC;

		try {

			var options = jQuery.parseJSON(field_desc);
			//special field options?
			if (typeof options.field_special === 'string') {
				//cascade style, which creates a second dropdown with related data,
				//based upon the first selection
				if (options.field_special == 'cascade') {
					//check for column name and cascade type
					if (!this.hasFieldSpecial('cascade', field.COLUMN_NAME))
						this.field_special.push({ "type": 'cascade', "field": field.COLUMN_NAME });
				}
			}

		} catch (e) {

			//not valid json object

		}

	}

	if (this.settings.debug)
		debug.log('NEW field special: ' + JSON.stringify(this.field_special));

};

tblEditor.prototype.hasFieldSpecial = function(type, field_name) {
	
	var has_special = false;

	if (typeof this.field_special !== 'undefined') {
		for (var d = 0; d < this.field_special.length; d++) {
			if (this.field_special[d].field == field_name)
				if (this.field_special[d].type == type)
					has_special = true;
		}
	}

	if (has_special)
		return true;
	 else
		return false;

};

tblEditor.prototype.readOnly = function(col_name) {

	if (this.settings.read_only.length > 0) {

		for (var i = 0; i < this.settings.read_only.length; i++)
			if (col_name == this.settings.read_only[i].col)
				return true;

	} else {

		//no read only columns found
		return false;

	}

	return false;

}

tblEditor.prototype.textAreaCol = function(col_name) {

	if (this.settings.textarea.length > 0) {

		for (var i = 0; i < this.settings.textarea.length; i++)
			if (col_name == this.settings.textarea[i].col)
				return true;

	} else {

		//no read only columns found
		return false;

	}

	return false;

}

//table name, field (object defining field), val (current value, if editing),
//keys (foreign key info), row_ID (ID of parent record), is_edit (boolean)
tblEditor.prototype.getCellContents = function(field, val, keys, row_ID, is_edit) {
	
	//check to see if the column is a primary key
	if (field['IS_IDENTITY'] == 0) {

		var element_ID = 'inp~-' + this.settings.table + '~-' + row_ID + '~-' + field['COLUMN_NAME'] + '~-' + field['DATA_TYPE'];
		var obj = this;

		if (!obj.readOnly(field.COLUMN_NAME)) {

			if (!obj.isColumnIgnored(field) || !obj.isNullable(field.COLUMN_NAME)) {

				try {

					var options = jQuery.parseJSON(field.FIELD_DESC);
					var content = '';

					if (options.field_type != null) {
						switch (options.field_type) {
							case "select":

								var f_text = options.field_texts.split(", ");

								if (typeof options.field_values === 'string')
									var f_val = options.field_values.split(", ");
								else
									f_val = f_text;

								if (f_val.length == f_text.length) {
									//find largest string length and make that default
									var inp_length = f_text[0].length;
									var tmp = null;
									for (var j = 0; j < f_text.length; j++) {
										tmp = f_text[j].length;
										if (inp_length < f_text[j].length)
											inp_length = tmp;
									}

									content = '<select style="width: ' + inp_length*8 + 'px;" class="' + 
											  ((!obj.hasFieldSpecial('cascade', field.COLUMN_NAME))? ' c_' + row_ID : '') + 
											  ((is_edit || obj.hasFieldSpecial('cascade', field.COLUMN_NAME))? ' sel_editable_' + 
											  obj.settings.table:'') + '" id="' + element_ID + '">';

									for (var i = 0; i < f_val.length; i++) {

										if (!obj.hasFieldSpecial('cascade', field.COLUMN_NAME)) {

											if (val != null && val == f_val[i]) {
												content = content + '<option selected="selected" value="' + f_val[i] + '">' + f_text[i] + '</option>';
											} else {
												content = content + '<option value="' + f_val[i] + '">' + f_text[i] + '</option>';
											}

										} else {

											var v_s = f_val[i].split('~~');

											if (val != null) {
												var vv_s = val.split('~~');
												var no_val = false;
											} else {
												if (i == 0)
													var vv_s = v_s;
												else
													var vv_s = '';

												var no_val = true;
											}

											if (v_s[0] == vv_s[0]) {

												content = content + '<option selected="selected" value="' + f_val[i] + '">' + f_text[i] + '</option>';

												var n_content = null;
												var val_split = f_val[i].split("~~");
												var filter_name = null;

												if (typeof val_split[2] !== 'undefined') {
													filter_name = val_split[2];
												} else {
													filter_name = '';
													site_ID = '';
												}

												var d = {
													"action": 'get_table_cascade',
													"table": val_split[0],
													"text_col": val_split[1],
													"filter_name": filter_name,
													"filter_value": site_ID
												};

												$.ajax({
													"url": obj.settings.url,
													"type": 'POST',
													"dataType": 'json',
													"data": d,
													"async": false,
													"success": function(res) {

														var sel_id = 'cascade__' + row_ID + '__' + field.COLUMN_NAME;

														if ($('#' + sel_id).length > 0)
															$('#' + sel_id).remove();

														if (!no_val) {
															n_content = ' <select class="c_' + row_ID + ' cascaded_sel field_cascade__' + obj.settings.table + '" id="' + sel_id + '"';
														} else {
															n_content = ' <select class="c_' + row_ID + '" id="' + sel_id + '"';
														}

														n_content = n_content + '>';

														//var s_val = val.split("~~");
														for (var z = 0; z < res.length; z++) {
															if (vv_s[1] == res[z].ID)
																n_content = n_content + '<option selected="selected" value="' + d.table + '~~' + res[z].ID + '">' + res[z].desc + '</option>';
															else
																n_content = n_content + '<option value="' + d.table + '~~' + res[z].ID + '">' + res[z].desc + '</option>';
														}
														n_content = n_content + '</select>';
													}
												});

											} else {
												content = content + '<option value="' + f_val[i] + '">' + f_text[i] + '</option>';
											}

										}
									}

									content = content + '</select>';

									if (obj.hasFieldSpecial('cascade', field.COLUMN_NAME) && n_content != 'undefined' && n_content != null)
										return content + ' ' + n_content;
									else
										return content;

								} else {
									return 'Error: f_val, f_type length mismatch!';
								}

								break;

							case "radio":
								break;

							case "checkbox":
								break;

							case "textarea":
								break;

							case "input":
								val = (val == null) ? '' : val;

								if (val != '')
									var inp_length = val.toString().length * 8;
								else
									var inp_length = obj.settings.style.min_inp_length;

								if (inp_length > obj.settings.style.max_inp_length)
									inp_length = obj.settings.style.max_inp_length;

								if (inp_length < obj.settings.style.min_inp_length)
									inp_length = obj.settings.style.min_inp_length;

								if (typeof options.field_popover === 'boolean' && options.field_popover_text && options.field_popover)
									var popover = true;
								else
									var popover = false;

								var pass_protect = obj.passProtect(field.COLUMN_NAME);

								return '<input class="c_' + row_ID + ((is_edit)? ' inp_editable_' + obj.settings.table : '') +
									   ((popover)? ' popover_' + obj.settings.table : '') +
									   '" id="' + element_ID + '"  style="width: ' + inp_length + 
									   'px;" type="' + ((pass_protect) ? 'password' : 'text') + '" value="' + val +
									   '" ' + ((popover && typeof options.field_popover_title === 'string')? 'data-original-title="' + options.field_popover_title : '') + '" ' + ((popover)? 'data-content="' + options.field_popover_text : '') + '">';
								break;
						}
					}
				} catch (e) {

					//if (obj.settings.debug)
					//	debug.log('field_type not valid JSON: ' + e.message);

				}

				switch (field['DATA_TYPE']) {
					case 'varchar':
					case 'float':

						switch (field['FIELD_DESC']) {
							case 'IMAGE_FIELD':
								if (is_edit) {

									var img = '';

									if (val) {
										img = '<a target="_blank" href="' + obj.settings.plupload.img_dir + '/' + row_ID + '~~' + val +
											  '"><img alt="' + val + '" src="' + obj.settings.plupload.img_dir + '/' + row_ID + '~~' + val + '" height="50" style="height:50px;"></a>';
									}

									return   '	 <a href="#" ID="a_imgpop_' + obj.settings.table + '" data="' + row_ID + '__' + element_ID + '__' + val + '">UPLOAD IMAGE</a>' +
											 '	<div id="mini_' + row_ID + '">' + img + '</div>';

								} else {
									return '(Save first)<input type="hidden" id="' + element_ID + '" value="">';
								}
								break;
							case 'CUSTOM':
								var f_name = this.settings.table + '__' + field['COLUMN_NAME'];
								return window[f_name](this.settings.table, field, val, keys, row_ID, is_edit);
								break;
							default:
								if (val == null)
									val = '';

								if (val != '')
									var inp_length = val.toString().length * 8;
								else
									var inp_length = obj.settings.style.min_inp_length;

								if (field['DATA_TYPE'] == 'float')
									inp_length = obj.settings.style.min_inp_length;
								else if (field['DATA_TYPE'] == 'varchar')
									inp_length = val.toString().length * 8;

								if (inp_length > obj.settings.style.max_inp_length)
									inp_length = obj.settings.style.max_inp_length;

								if (inp_length < obj.settings.style.min_inp_length)
									inp_length = obj.settings.style.min_inp_length;

								var pass_protect = obj.passProtect(field.COLUMN_NAME);

								//debug.log('default: ' + inp_length);
								if (obj.textAreaCol(field.COLUMN_NAME))
									return '<textarea class="c_' + row_ID + ((is_edit)? ' inp_editable_' + obj.settings.table : '') + '" id="' + element_ID + '" type="text">' + val + '</textarea>';
								else
									return '<input class="c_' + row_ID + ((is_edit)? ' inp_editable_' + obj.settings.table : '') + '" id="' + element_ID + '" type="' + ((pass_protect) ? 'password' : 'text') + '" style="width: ' + inp_length + 'px;" value="' + val + '">';
								break;
						}
					break;
					case 'bit':
						return '<input class="c_' + row_ID + ((is_edit)? ' inp_editable_radio_' + obj.settings.table : '') + 
							   '" id="' + element_ID + '~-1" type="radio" name="inp_' + row_ID + '_' + field['COLUMN_NAME'] + 
							   '" value="true" ' + ((val) ? 'checked' : '') + '>Yes&nbsp;&nbsp;' +
							   '<input class="c_' + row_ID + ((is_edit)? ' inp_editable_radio_' + obj.settings.table : '') + 
							   '" id="' + element_ID + '~-0" type="radio" name="inp_' + row_ID + '_' + field['COLUMN_NAME'] + 
							   '" value="false" ' + ((!val) ? 'checked' : '') + '>No';
					break;
					case 'int':
					case 'smallint':
						//see if this is a foreign key
						for (var i = 0; i < keys.length; i++) {
							var k = keys[i];

							if (k['COLUMN_NAME'] == field['COLUMN_NAME']) {

								var select = '<select class="c_' + row_ID + ((is_edit)? ' sel_editable_' + 
											 obj.settings.table : '') + '" type="select" id="inp~-' + this.settings.table + 
											'~-' + row_ID + '~-' + field.COLUMN_NAME + '">';

								//FK special field addition
								if (obj.settings.fk_special.length > 0) {

									for (var z = 0; z < obj.settings.fk_special.length; z++) {

										if (obj.settings.fk_special[z].col == field['COLUMN_NAME']) {
											select = select + '<option value="' + obj.settings.fk_special[z].value + '"> - ' + 
											obj.settings.fk_special[z].text + ' - </option>';
										}

									}

								}

								for (var j = 0; j < k.REF_DATA.length; j++) {

									var fk = k.REF_DATA[j];

									if (fk.value == val) {
										select = select + '<option value="' + fk.value +
														  '" selected="selected">' + fk.text + '</option>';
									} else {
										select = select + '<option value="' + fk.value + '">' + fk.text + '</option>';
									}

								}

								select = select + '</select>';

								return select;

							}
						}

						val = (val == null) ? '' : val;

						if (val != '') {
							var inp_length = val.toString().length * 8;
						} else {
							var inp_length = obj.settings.style.min_inp_length;
						}

						if (inp_length > obj.settings.style.max_inp_length)
								inp_length = obj.settings.style.max_inp_length;

						if (inp_length < obj.settings.style.min_inp_length)
							inp_length = obj.settings.style.min_inp_length;

						return '<input class="c_' + row_ID + ((is_edit) ? ' inp_editable_' + obj.settings.table : '') + 
							   '" id="' + element_ID + '"  style="width: ' + inp_length + 'px;" type="text" value="' + val + '">';
					break;
					case "datetime":
					case "date":

						val = (val == null) ? '' : val;

						if (val != '') {
							var inp_length = val.toString().length * 8;
						} else {
							var inp_length = obj.settings.style.min_inp_length;
						}

						if (inp_length > obj.settings.style.max_inp_length)
								inp_length = obj.settings.style.max_inp_length;

						if (inp_length < obj.settings.style.min_inp_length)
							inp_length = obj.settings.style.min_inp_length;

						return '<input class="c_' + row_ID + ((is_edit) ? ' inp_editable_' + obj.settings.table : '') + 
								   ' datePick" id="' + element_ID + '"  style="width: ' + inp_length + 'px;" type="text" value="' + val + '" readonly="true">';

					break;

				}
			}

		} else {

			for (var i = 0; i < keys.length; i++) {

				var k = keys[i];

				if (k['COLUMN_NAME'] == field['COLUMN_NAME']) {

					for (var j = 0; j < k.REF_DATA.length; j++) {

						var fk = k.REF_DATA[j];

						if (fk.value == val) {

							return fk.text;

						}

					}

				}

			}
			//read only
			return val;

		}

	} else {

		if (is_edit) { return val; }
			else { return -1; }

	}

};

tblEditor.prototype.passProtect = function(col) {

	var obj = this;

	if (obj.settings.hasOwnProperty("pass_protect_col") && obj.settings.pass_protect_col.length > 0) {

		for (var i = 0; i < obj.settings.pass_protect_col.length; i++) {

			if (obj.settings.pass_protect_col[i].col == col) {
				return true;
			}

		}

	}

	return false;

}

//Event handlers for the page
var timer = null;

tblEditor.prototype.listenEdit = function() {
	var obj = this;

	//clear event handlers
	$(obj.settings.container).off();
	$("body").off('click', '.delete_row__' + obj.settings.table);

	$(obj.settings.container).on('keyup', '.inp_editable_' + obj.settings.table, function() {
		if (timer) {
			clearTimeout(timer);
		}
		var me = this;
		timer = setTimeout(function() {obj.saveField(me)}, 600);
	});

	$(obj.settings.container).on('click', '.inp_editable_radio_' + obj.settings.table, function() {
		var me = this;
		obj.saveField(me);
	});

	$(obj.settings.container).on('change', '.sel_editable_' + obj.settings.table, function() {
		if (timer) {
			clearTimeout(timer);
		}
		var me = this;
		timer = setTimeout(function() {obj.saveField(me)}, 600);
	});

	//xref select/deselect all for a column
	$(obj.settings.container).on('click', '.xref_all_cols_' + obj.settings.table, function() {

		var c_el = this;
		var store_rows = [];
		var id = $(this).attr('id').split('__');
		var o_id = id[1];
		var is_checked = $(c_el).is(':checked');

		var data = {
			"action": 'update_col_xref_all',
			"table": obj.settings.table,
			"col": o_id,
			"col_table": obj.settings.xref.cols,
			"row_table": obj.settings.xref.rows,
			"site_ID": site_ID,
			"value": ((is_checked) ? '1' : '0')
		};

		$.ajax({
			"url": obj.url,
			"type": 'POST',
			"dataType": 'json',
			"data": data,
			"success": function(res) {

				//obj.refresh();
				$('.xref__' + obj.settings.table).each(function() {

					var s_id = $(this).attr('id').split('~-');

					if (s_id[1].toLowerCase() == data.col && data.value == 1)
						$(this).attr('checked', 'checked');
					else if (s_id[1].toLowerCase() == data.col && data.value == 0)
						$(this).removeAttr('checked');

				});

			}
		});

	});

	//xref select/deselect all for a row
	$(obj.settings.container).on('click', '.xref_all_rows__' + obj.settings.table, function() {
		var c_el = this;
		var store_rows = [];
		var id = $(this).attr('id').split('__');
		var o_id = id[1];
		var is_checked = $(c_el).is(':checked');

		var data = {
			"action": 'update_row_xref_all',
			"table": obj.settings.table,
			"row": o_id,
			"col_table": obj.settings.xref.cols,
			"row_table": obj.settings.xref.rows,
			"site_ID": site_ID,
			"value": ((is_checked) ? '1' : '0')
		};

		if (obj.settings.debug)
			debug.log(data);

		$.ajax({
			"url": obj.settings.url,
			"type": 'POST',
			"dataType": 'json',
			"data": data,
			"success": function(res) {
				$('.xref__' + obj.settings.table).each(function() {

					var s_id = $(this).attr('id').split('~-');

					if (s_id[2] == data.row && data.value == 1)
						$(this).attr('checked', 'checked');
					else if (s_id[2] == data.row && data.value == 0)
						$(this).removeAttr('checked');

				});
			}
		});
	});

	//refresh button has been clicked
	$(obj.settings.container).on('click', '.refresh_me_' + obj.settings.table, function() {
		obj.refresh();
	});

	//xref checkbox has been clicked
	$(obj.settings.container).on('click', '.xref__' + obj.settings.table, function() {
		obj.xrefSave(this);
	});

	//save button has been clicked
	$(obj.settings.container).on('click', '.save__' + obj.settings.table, function() {
		obj.addRowSave(this, $(this).attr('rand'));
	});

	//delete button has been clicked
	$(obj.settings.container).on('click', '.delete__' + obj.settings.table, function() {
		obj.confirmDeleteRow(this.parentElement);
	});

	//remove row has been clicked
	$("body").on('click', '.delete_row__' + obj.settings.table, function() {

		if (obj.settings.debug)
			debug.log('Delete row handler activated!');

		if ($(this).attr('row_id') != "false")
			obj.deleteRow(this, $(this).attr('row_id'));
		else
			obj.deleteRow(this, false);

	});

	//confirm delete has been clicked
	$(obj.settings.container).on('click', '.confirm_delete__' + obj.settings.table, function() {
		obj.confirmDeleteRow(this.parentElement);
	});

	//double select dropdown for one column, aka "cascade" field_type has been clicked
	$(obj.settings.container).on('change', '.field_cascade__' + obj.settings.table, function() {
		obj.fieldCascadeSave(this);
	});

	//class="ct_' + obj.table + '" sel_val="inp~-' + this.table + '~-' + row_ID + '~-' + field.COLUMN_NAME + '"
	$(obj.settings.container).on('click', '.ct_' + obj.settings.table, function() {
		var tmp_tr = document.getElementById('tr~-' + obj.settings.table + '~-' + $(this).attr("ref_ID"));
		obj.showCT($(this).attr("ref_ID"), tmp_tr, this);
	});

	$('.popover_' + obj.settings.table)
		.attr('data-placement', 'top')
		.popover({ 
			"manual": "trigger",
			"template": '<div class="popover" style="width: 300px !important;"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
		});

	//popover for special field types has been clicked
	$(obj.settings.container).on('click', '.popover_' + obj.settings.table, function() {
		$(this).popover('show');
	});

	$(obj.settings.container).on('blur', '.popover_' + obj.settings.table, function() {
		$(this).popover('hide');
	});

	$(obj.settings.container).on('click', '#a_imgpop_' + obj.settings.table, function() {
		var id = $(this).attr('data');
		var split = id.split("__");
		var row_ID = split[0];
		var element_ID = split[1];
		var val = split[2];

		obj.imgUpload(row_ID, element_ID, val);
	});

};

//Saves a field that is editable
tblEditor.prototype.saveField = function(obj) {
	var mobj = this;
	var split = $(obj).attr('id').split('~-');
	//cascade special field option for select drop down menus
	//cascade will generate a second select box, which contains all the data for the first selection
	//the data will be stored in the database with the name of the table and the ID of the selection
	//i.e. defect_defects~~23
	var val_split = $(obj).val().split("~~");

	if (mobj.debug) {
		debug.log('split: ' + JSON.stringify(split));
		debug.log('val_split: ' + JSON.stringify(val_split));
	}

	if (mobj.hasFieldSpecial('cascade', split[3])) {

		if (typeof val_split[2] !== 'undefined') {
			filter_name = val_split[2]
		} else {
			filter_name = '';
			site_ID = '';
		}

		var d = {
			"action": 'get_table_cascade',
			"table": val_split[0],
			"text_col": val_split[1],
			"filter_name": filter_name,
			"filter_value": site_ID
		};

		$.ajax({
			"url": mobj.settings.url,
			"type": 'POST',
			"dataType": 'json',
			"data": d,
			"success": function(res) {

				$('.cascaded_sel').each(function() {
					var new_sel = $(this).attr('id').split('__');

					if (split[2] == new_sel[1] && split[3] == new_sel[2])
						$(this).remove();
				});

				var sel_id = 'cascade__' + split[2] + '__' + split[3];

				if ($('#' + sel_id).length > 0)
					$('#' + sel_id).remove();

				if (split[2].indexOf("NEW") != -1) {
					var content = ' <select class="c_' + split[2] + ' cascaded_sel" id="' + sel_id + '">';
				} else {
					var content = ' <select class="c_' + split[2] + ' cascaded_sel field_cascade__' + mobj.settings.table + '" id="' + sel_id + '">';
				}

				for (var i = 0; i < res.length; i++) {
					content = content + '<option value="' + d.table + '~~' + res[i].ID + '">' + res[i].desc + '</option>';
				}
				content = content + '</select>';

				$(obj).after(content);
			}
		});

	} else {

		var pos = $(obj).position();
		var ob_width = $(obj).css('width').substring(0, $(obj).css('width').length - 2);
		var left = pos.left + parseInt(ob_width) + 5;
		var content = '<span class="inp_saving" style="position: absolute; top: ' + (pos.top) + 'px; left: ' + left + 'px; background-color: green; font-size: 11px; color: #fff; padding: 3px;">Saving ...</span>';

		$(obj).after(content);

		setTimeout(function() {
			$('.inp_saving').hide();
		}, 4000);

		//var new_value = $(obj).val().replace(/[^\w\s]/gi, '');
		var new_value = $(obj).val();

		//TODO add field validation
		var valid = mobj.fieldValidation(split[3], new_value);

		if (valid.isValid) {

			var data = {
				"action": 'save_field',
				"table_name": mobj.settings.table,
				"row_ID": split[2],
				"field_name": split[3],
				"new_value": new_value
			};

			$.ajax({
				"url": mobj.settings.url,
				"type": 'POST',
				"dataType": 'json',
				"data": data,
				"success": function(res) {
					if (res.success == 1) {
						setTimeout(function() {
							$('.inp_saving').css('background-color', 'green').html('Saved!').show();

							setTimeout(function() {
								$('.inp_saving').remove();
							}, 1000);

						}, 500);
					} else {
						setTimeout(function() {
							$('.inp_saving').css('background-color', 'red').html('Error!').show();

							setTimeout(function() {
								$('.inp_saving').remove();
							}, 1000);

						}, 500);
					}
				}
			});

		} else {

			$('.inp_saving').css('background-color', 'red').html('Error: ' + valid.msg).show();

		}

	}
};

tblEditor.prototype.fieldValidation = function(col, new_val) {

	for (var j = 0; j < this.data.table_fields.length; j++) {

		var field = this.data.table_fields[j];

		if (field.COLUMN_NAME == col) {

			switch (field.DATA_TYPE) {

				case "int":
				case "smallint":

					var num_val = parseInt(new_val);

					if (isNaN(num_val)) {
						return {
							"isValid": false,
							"msg": "Value is not a number",
							"col": col
						};
					}
				break;

				case "text":
				case "varchar":
					if (typeof new_val !== "string") {
						return {
							"isValid": false,
							"msg": "Value is not a string",
							"col": col
						};
					}
				break;

				case "datetime":
				case "date":
					if (typeof new_val !== "string") {
						return {
							"isValid": false,
							"msg": "Value is not a string",
							"col": col
						};
					}
				break;

			}

			//special field validation in settings
			if (this.settings.field_validation.length > 0) {

				for (var i = 0; i < this.settings.field_validation.length; i++) {

					var validation = this.settings.field_validation[i];

					if (validation.col == col) {

						//detect for range
						if (validation.hasOwnProperty("min")) {

							var num_val = parseInt(new_val);

							if (!isNaN(num_val)) {

								if (num_val < validation.min) {
									return {
										"isValid": false,
										"msg": "Value is less than the minimum requirement: " + validation.min,
										"col": col
									};
								}

							}

						}

						if (validation.hasOwnProperty("max")) {

							var num_val = parseInt(new_val);

							if (!isNaN(num_val)) {

								if (num_val > validation.max) {
									return {
										"isValid": false,
										"msg": "Value is greater than the minimum requirement: " + validation.max,
										"col": col
									};
								}

							}

						}

					}

				}

			}

			return {
				"isValid": true
			};

		}

	}

}

tblEditor.prototype.fieldCascadeSave = function(obj) {
	var mobj = this;
	var pos = $(obj).position();
	var ob_width = $(obj).css('width').substring(0, $(obj).css('width').length - 2);
	var left = pos.left + parseInt(ob_width) + 5;
	var content = '<span id="inp_saving" style="position: absolute; top: ' + (pos.top) + 'px; left: ' + left + 'px; background-color: green; font-size: 11px; color: #fff; padding: 3px;">Saving ...</span>';
	//cascade__colname__row_ID
	//   0         1       2
	var split = $(obj).attr('id').split("__");

	$(obj).after(content);

	setTimeout(function() {
		$('#inp_saving').hide();
	}, 1000);

	var data = {
		"action": 'save_field',
		"table_name": mobj.settings.table,
		"row_ID": split[1],
		"field_name": split[2],
		"new_value": $(obj).val()
	};

	$.ajax({
		"url": mobj.settings.url,
		"type": 'POST',
		"dataType": 'json',
		"data": data,
		"success": function(res) {
			if (res.success == 1) {
				setTimeout(function() {
					$('#inp_saving').html('Saved!').show();

					setTimeout(function() {
						$('#inp_saving').remove();
					}, 1000);

				}, 500);
			} else {
				setTimeout(function() {
					$('#inp_saving').css('background-color', 'red').html('Error!').show();

					setTimeout(function() {
						$('#inp_saving').remove();
					}, 1000);

				}, 500);
			}
		}
	});

};

//Adds a new row to datatable, doesn't save until user clicks "save"
tblEditor.prototype.addRow = function() {
	var content = [];
	//random number for id and class of new row
	var rand = Math.floor(Math.random() * 1000).toString();
	//current fields in the table, excluding ID and ignored columns
	var fields = this.data.table_fields;
	var obj = this;

	if (this.settings.ct.enabled)
		content.push('');

	for (var i = 0; i < fields.length; i++) {
		if (!this.isColumnIgnored(fields[i]) || !this.isNullable(fields[i].COLUMN_NAME)) {
			var val = this.getCellContents(fields[i], null, this.data.fk.keys, 'NEW' + rand, false);
			content.push(val);
		}
	}

	content.push('<div style="width: 100%;"><a href="#" class="save__' + this.settings.table + '" rand="' + rand + 
				 '" onclick="return false;"><img src="' + this.settings.base_dir + '/assets/images/tick-button.png"> Save!</a></div>');

	//add row into datatables
	this.dt.fnAddData(content, true);

	$(".c_NEW" + rand).on("blur", function() {

		var split_inp = $(this).attr('id').split('~-');
		var col = split_inp[3];

		var valid = obj.fieldValidation(col, $(this).val());

		if (!valid.isValid) {

			var pos = $(this).position();
			var ob_width = $(this).css('width').substring(0, $(this).css('width').length - 2);
			var left = pos.left + parseInt(ob_width) + 5;
			var content = '<span class="inp_saving" style="position: absolute; top: ' + (pos.top) + 'px; left: ' + left + 
							'px; background-color: red; font-size: 11px; color: #fff; padding: 3px;">' + valid.msg + '</span>';

			$('.inp_saving').hide();
			$(this).after(content);

			setTimeout(function() {
				$('.inp_saving').hide();
			}, 4000);

		}

	});

	if (this.settings.hasOwnProperty("onLoad"))
		this.settings.onLoad(false);

};

//Saves the newly added data to the database
tblEditor.prototype.addRowSave = function(a_obj, class_ID) {
	//instance reference
	var obj = this;
	//class id for newly entered row data
	var c_id = '.c_NEW' + class_ID;
	//ignore columns detected and sent to processor
	var insert_cols = '';
	//value of newly entered row data
	var val = [];
	//splitting input ID to get column name
	var split_inp = null;
	//column name
	var col = null;
	var field_options = null;
	//validation flag
	var valid = true;
	//accumulated errors
	var errors = [];

	if (this.settings.hc.field) {
		insert_cols += this.settings.hc.field + '--';
		val.push(this.settings.hc.value);
	}

	//checks for any ignore columns set for the data
	for (var i = 0; i < this.data.table_fields.length; i++) {

		var tbl_field = this.data.table_fields[i]

		if (!obj.isColumnIgnored(tbl_field) || !obj.isNullable(tbl_field.COLUMN_NAME)) {
			if (tbl_field.IS_IDENTITY == 0 && tbl_field.FIELD_DESC != 'IMAGE_FIELD') {
				insert_cols = insert_cols + tbl_field.COLUMN_NAME + '--';
			}
		} else {
			if (obj.settings.debug)
				debug.log((typeof tbl_field.COLUMN_NAME) + ': ' + tbl_field.COLUMN_NAME)
		}

	}

	insert_cols = insert_cols.substring(0, insert_cols.length - 2);
	//grabs the input data for new row
	$(c_id).each(function(el) {

		for (var i = 0; i < obj.data.table_fields.length; i++) {

			if (obj.hasFieldSpecial('cascade', obj.data.table_fields[i].COLUMN_NAME)) {
				split_inp = $(this).attr('id').split('__');
				col = split_inp[2];
			} else {
				split_inp = $(this).attr('id').split('~-');
				col = split_inp[3];
			}

			if (obj.data.table_fields[i].COLUMN_NAME == col) {
				if (!obj.isColumnIgnored(obj.data.table_fields[i]) || !obj.isNullable(obj.data.table_fields[i].COLUMN_NAME)) {
					//radio button needs more love
					if ($(this).attr('type') == 'radio') {
						if ($(this).is(':checked'))
							val.push($(this).val());
					} else {

						//validation check
						valid = obj.fieldValidation(col, $(this).val());

						//add to errors array
						if (!valid.isValid)
							errors.push(valid);

						val.push($(this).val());
					}
				}
			}

		}
	});

	//debug.log(errors);

	if (errors.length == 0) {
	
		var data = {
			"action": 'save_new_row',
			"table_name": this.settings.table,
			"cols": insert_cols,
			"rand": class_ID,
			"hard_coded_field": this.settings.hc.field,
			"hard_coded_operator": this.settings.hc.operator,
			"hard_coded_value": this.settings.hc.value,
			"new_values": val.join('__')
		};

		data[this.settings.hc.field] = this.settings.hc.value;

		$.ajax({
			"url": obj.settings.url,
			"type": 'POST',
			"dataType": 'json',
			"data": data,
			"success": function(res) {
				if (res.success)
					$(a_obj).parent().html('(SAVED)');
				else 
					$(a_obj).parent().html('(ERROR)');
			},
			"error": function(response, status, error) {
				if (obj.settings.debug)
					debug.log('Res: ' + JSON.stringify(response) + '\nError: ' + JSON.stringify(error));
			}
		});

	} else {

		//$(a_obj).parent().html('(ERROR)');

		//load errors
		$(c_id).each(function(el) {

			for (var i = 0; i < errors.length; i++) {

				var split_inp = $(this).attr('id').split('~-');
				var col = split_inp[3];

				if (col == errors[i].col) {

					var pos = $(this).position();
					var ob_width = $(this).css('width').substring(0, $(this).css('width').length - 2);
					var left = pos.left + parseInt(ob_width) + 5;
					var content = '<span class="inp_saving" style="position: absolute; top: ' + (pos.top) + 'px; left: ' + left + 
									'px; background-color: red; font-size: 11px; color: #fff; padding: 3px;">' + errors[i].msg + '</span>';

					$('.inp_saving').hide();
					$(this).after(content);

					setTimeout(function() {
						$('.inp_saving').hide();
					}, 10000);

					return;

				}

			}

		});

	}

};

tblEditor.prototype.createModal = function(title, content, save_class, attr, attr_val) {

	var obj = this;
	var ignore_attr = true;

	if (attr != null) {
		ignore_attr = false;
	}

	if ($('#myModal').length == 0) {

		var content = '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' + 
						  '<div class="modal-header">' + 
						  '  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>' + 
						  '  <h3 id="myModalLabel">' + title + '</h3>' + 
						  '</div>' + 
						  '<div class="modal-body">' + 
						  '  <p>' + content + '</p>' + 
						  '</div>' + 
						  '<div class="modal-footer">' + 
						  '  <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>';

		if (save_class != null) {
			content = content +  '  <button ' + ((ignore_attr) ? '' : attr + '="' + attr_val + '"') + ' class="btn btn-primary ' + 
					  save_class + '__' + obj.settings.table + '">Save changes</button>';
		}

		content = content + '</div></div>';

		$("body").append(content);

	} else {

		var content = '<div class="modal-header">' + 
						  '  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>' + 
						  '  <h3 id="myModalLabel">' + title + '</h3>' + 
						  '</div>' + 
						  '<div class="modal-body">' + 
						  '  <p>' + content + '</p>' + 
						  '</div>' + 
						  '<div class="modal-footer">' + 
						  '  <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>';

		if (save_class != null) {
			content = content +  '  <button ' + ((ignore_attr) ? '' : attr + '="' + attr_val + '"') + ' class="btn btn-primary ' + 
					  save_class + '__' + obj.settings.table + '">Save changes</button>';
		}

		content = content + '</div>';

		$('#myModal').html(content);
	}

};

tblEditor.prototype.getRelationshipDelete = function(table) {

	for (var i = 0; i < this.data.fk.relationships.length; i++) {
		if (this.data.fk.relationships[i].fk_table == table) {
			return this.data.fk.relationships[i].delete_referential_action_desc;
		}
	}

	return "NO_ACTION";

};

//Confirmation to delete the row
tblEditor.prototype.confirmDeleteRow = function(parent_obj) {

	var title = 'Caution!';
	var content = 'Are you sure you want to delete this record?';
	var save = 'delete_row';
	var save_ids = [];
	var count = 0;

	if (typeof this.data.related_ids !== 'undefined' && this.data.related_ids.length > 0) {

		for (var i = 0; i < this.data.related_ids.length; i++) {

				var related_id = this.data.related_ids[i];
				var delete_option = this.getRelationshipDelete(related_id.table_name);
				var re = '';

				switch (delete_option) {

					case "SET_DEFAULT":
						re = 'set to default values';
						break;

					case "SET_NULL":
						re = 'set to null values';
						break;

					case "CASCADE":
						re = 'deleted';
						break;

					case "NO_ACTION":
						re = 'ERROR';
						break;

				}

				if (re != 'ERROR') {

					content = content + '<br />The following data will be <strong>' + re + '</strong> from <strong>' + 
										related_id.table_name + '</strong>:<br /><ul>';
					
					for (var j = 0; j < related_id.fk_data_count.length; j++) {

						if (related_id.fk_data_count[j].ref_ID == $(parent_obj).attr('row_id')) {

							content = content + '<li> <strong># of records:</strong> ' + related_id.fk_data_count[j].data_count + '</li>';
							count = count + related_id.fk_data_count[j].data_count;

						}

					}

					content = content + '</ul><br />';

				}

		}

		content = content + '<br />------<br /><br /> <strong>Total associated records affected by deleting this record:</strong> ' + count;

	}

	this.createModal(title, content, save, 'row_ID', $(parent_obj).attr('row_id'));
	$('#myModal').modal({ "backdrop": true });

};

//Delte the row and remove it from datatables
tblEditor.prototype.deleteRow = function(a_obj, row_ID) {

	var obj = this;

	var data = {
		"action": 'delete_row',
		"table_name": this.settings.table,
		"row_ID": row_ID
	};

	if (row_ID != false || row_ID == 0) {
		$.ajax({
			"url": obj.settings.url,
			"type": 'POST',
			"dataType": 'json',
			"data": data,
			"success": function(res) {

				var dt = $('#' + obj.settings.table + '_dtbl_' + obj.rand).dataTable();
				dt.fnDeleteRow( dt.fnGetPosition( document.getElementById('tr~-' + obj.settings.table + '~-' + row_ID) ) );
				$('#myModal').modal('hide');

			}
		});
	} 
};

//Xref Save
tblEditor.prototype.xrefSave = function(obj) {
	var mobj = this;
	var split = $(obj).attr('id').split('~-');
	var pos = $(obj).position();
	var ob_width = $(obj).css('width').substring(0, $(obj).css('width').length - 2);
	var left = pos.left + parseInt(ob_width) + 5;
	var content = '<span id="inp_saving" style="position: absolute; top: ' + pos.top + 'px; left: ' + left + 'px; background-color: green; font-size: 11px; color: #fff; padding: 3px;">Saving ...</span>';

	$(obj).after(content);

	setTimeout(function() {
		$('#inp_saving').hide();
	}, 1000);

	var data = {
		"action": "update_xref",
		"table_name": mobj.settings.table,
		"row_ID": split[0],
		"field_desc": split[1],
		"new_value": $(obj).is(':checked'),
		"xref_rows": mobj.settings.xref.rows,
		"xref_cols": mobj.settings.xref.cols
	};

	$.ajax({
		"url": mobj.settings.url,
		"type": 'POST',
		"dataType": 'json',
		"data": data,
		"success": function(res) {
			if (res.success == 1) {
				if (data.new_value)
					$(obj).attr('checked', true);
				else
					$(obj).attr('checked', false);

				setTimeout(function() {
					$('#inp_saving').html('Saved!').show();

					setTimeout(function() {
						$('#inp_saving').remove();
					}, 1000);

				}, 500);
			} else {
				setTimeout(function() {
					$('#inp_saving').css('background-color', 'red').html('Error!').show();

					setTimeout(function() {
						$('#inp_saving').remove();
					}, 1000);

				}, 500);
			}
		}
	});
};

tblEditor.prototype.showCT = function(ref_ID, parent, el) {

	var nTr = parent;
	var i = $.inArray(nTr, this.anOpen);
	var obj = this;
	var content = '';
	var rand = Math.floor(Math.random()*1000);

	if ( i === -1 ) {

		content = content + '<div id="ct_table_' + rand + '" style="margin: 5px; padding: 5px;">';
		content = content + '</div>';
		
		$('img', el).attr('src', obj.settings.base_dir + '/assets/images/magnifier--minus.png');
		obj.dt.fnOpen(nTr, content, 'details');
		obj.anOpen.push(nTr);

		var new_tbl = {
			"table": obj.settings.ct.table,
			"container": '#ct_table_' + rand,
			/*"plupload": {
				"company_ID": obj.settings.plupload.company_ID,
				"product_name": obj.settings.plupload.product_name,
				"plupload_dir": obj.settings.plupload.plupload_dir,
			},*/
			"hc": {
				"enabled": true,
				"field": obj.settings.ct.ref_col,
				"operator": '=',
				"value": ref_ID
			}
		};

		if (obj.settings.ct.hasOwnProperty("options")) {
			$.extend(true, new_tbl, obj.settings.ct.options);
		}

		var ct_tbl = new tblEditor(new_tbl);

		//ct_tbl.init();

		setTimeout(function() {
			$('div#ct_table_' + rand).find( $('.dataTables_length') ).hide();
			$('div#ct_table_' + rand).find( $('.dataTables_filter') ).hide();

		}, 500);

	} else {

		$('img', el).attr('src', obj.settings.base_dir + '/assets/images/magnifier--plus.png');
		this.dt.fnClose(nTr);
		this.anOpen.splice(i, 1);

	}

};

tblEditor.prototype.imgUpload = function(row_ID, element_ID, val) {
	var obj = this;

	if (val != null && val != "null") {

		var img = '<a target="_blank" href="' + obj.settings.plupload.img_dir + 
				  '/' + row_ID + '~~' + val +
			  	  '"><img alt="' + val + '" src="' + obj.settings.plupload.img_dir + 
			  	  '/' + row_ID + '~~' + val + '" height="50" style="height:50px;"></a>';
	
	} else {
		var img = 'No image currently uploaded';
	}

	var content =    '<div id="div_upload_cont_' + row_ID + '" style="text-align: left;">' +
					 '	 <div><a href="#" ID="a_' + row_ID + '" class="btn btn-primary">Browse Images</a></div><br />' +
					 '	 <div id="' + element_ID + '" style="width: 40%;">' + img + '</div>' + 
					 '</div>';

	this.createModal('Upload Image!', content);

	$('#myModal').modal({ "backdrop": true });

	obj.setupUploadImage(element_ID);

};

//Picture upload functionality
tblEditor.prototype.setupUploadImage = function(element_ID) {

	var id_arr = element_ID.split('~-');
	var row_ID = parseInt(id_arr[2]);
	var obj = this;

	this.uploaders['row' + row_ID] = new plupload.Uploader({
		"runtimes" : 'html5,flash,silverlight',
		"browse_button" : 'a_' + element_ID,
		"container": 'div_upload_cont_' + row_ID,
		"max_file_size" : '5mb',
		"url" : obj.settings.plupload.plupload_dir + '/upload.php',
		"flash_swf_url" : obj.settings.plupload.plupload_dir + '/js/plupload.flash.swf',
		"silverlight_xap_url" : obj.settings.plupload.plupload_dir + '/js/plupload.silverlight.xap',
		"multipart" : true,
		"multipart_params": { 
			"field_ID": id_arr[2], 
			"file_id": id_arr[2]
		},
		"filters" : [{ 
			"title": "Image Files (.jpg, .gif, .png)", 
			"extensions": "jpg,gif,png"
		}],
		"row_ID" : row_ID,
		"full_el_id" : element_ID,
		"uploaded" : false
	});

	if (obj.settings.plupload.hasOwnProperty("resize"))
		this.uploaders['row' + row_ID].resize = obj.settings.plupload.resize;

	this.uploaders['row' + row_ID].bind('FilesAdded', function(up, files) {
		for (var i = 0; i < files.length; i++) {
			if (files[i].id) {

				$(document.getElementById(up.settings.browse_button)).hide();
				$(document.getElementById(up.settings.full_el_id)).html('uploading...');
				$('#' + element_ID).html('uploading ...');
				//$('#myModal').modal('hide');

				setTimeout(function() {
					up.start();
				}, 100);

			}
		}
	});

	this.uploaders['row' + row_ID].bind('Error', function(up, err) {
		alert('MAJOR ERROR UPLOADING FILE: ' + err.message);
	});

	this.uploaders['row' + row_ID].bind('UploadComplete', function(up, files) {
		var id_arr = up.settings.full_el_id.split('~-');
		if (files.length > 0) {
			var msg = '<a target="_blank" href="' + obj.settings.plupload.img_dir + '/' + id_arr[2] + '~~' + files[0].name +
					  '"><img src="' + obj.settings.plupload.img_dir + '/' + id_arr[2] + '~~' + files[0].name + '" height="50" style="height:50px;" ></a>';

			$(document.getElementById(up.settings.full_el_id)).html(msg);
			$('#mini_' + row_ID).html(msg);

			document.getElementById(up.settings.full_el_id).value = files[0].name;
			obj.saveField(document.getElementById(up.settings.full_el_id));
			$(document.getElementById(up.settings.browse_button)).show();
			up.removeFile(files[0]);
		} else {
			$(document.getElementById(up.settings.full_el_id)).html();
			$(document.getElementById(up.settings.browse_button)).show();
		}
	});

	this.uploaders['row' + row_ID].bind('UploadProgress', function(up, file) {
		var msg = '<div>' + file.percent + '%</div><div class="progress progress-striped active">' + 
				  '<div class="bar bar-success" style="width: ' + file.percent + '%;"></div></div>';

		$(document.getElementById(up.settings.full_el_id)).html(msg);
	});

	this.uploaders['row' + row_ID].init();
};


//Necessary sorting functions for datatables with input boxes
$.fn.dataTableExt.afnSortData['dom-text'] = function (oSettings, iColumn) {
	var aData = [];
	$('td:eq('+iColumn+') input', oSettings.oApi._fnGetTrNodes(oSettings)).each(function() {
		aData.push(this.value);
	});
	return aData;
};

//Necessary sorting functions for datatables with input boxes
$.fn.dataTableExt.afnSortData['dom-textarea'] = function (oSettings, iColumn) {
	var aData = [];
	$('td:eq('+iColumn+') textarea', oSettings.oApi._fnGetTrNodes(oSettings)).each(function() {
		aData.push(this.value);
	});
	return aData;
};

//Necessary sorting functions for datatables with input select boxes
$.fn.dataTableExt.afnSortData['dom-select'] = function (oSettings, iColumn) {
	var aData = [];
	$('td:eq('+iColumn+') select', oSettings.oApi._fnGetTrNodes(oSettings)).each(function() {
		aData.push( $(this).val() );
	});
	return aData;
};

//Necessary sorting functions for datatables with input checkboxes
$.fn.dataTableExt.afnSortData['dom-checkbox'] = function  ( oSettings, iColumn ) {
	var aData = [];
	$( 'td:eq('+iColumn+') input', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
		aData.push( this.checked==true ? "1" : "0" );
	} );
	return aData;
};

$.extend($.fn.dataTableExt.oStdClasses, {
    "sSortAsc": "header headerSortDown",
    "sSortDesc": "header headerSortUp",
    "sSortable": "header"
});


/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings ) {
	return {
		"iStart":         oSettings._iDisplayStart,
		"iEnd":           oSettings.fnDisplayEnd(),
		"iLength":        oSettings._iDisplayLength,
		"iTotal":         oSettings.fnRecordsTotal(),
		"iFilteredTotal": oSettings.fnRecordsDisplay(),
		"iPage":          Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
		"iTotalPages":    Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
	};
};

/* Bootstrap style pagination control */
$.extend( $.fn.dataTableExt.oPagination, {
	"bootstrap": {
		"fnInit": function( oSettings, nPaging, fnDraw ) {
			var oLang = oSettings.oLanguage.oPaginate;
			var fnClickHandler = function ( e ) {
				e.preventDefault();
				if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
					fnDraw( oSettings );
				}
			};

			$(nPaging).addClass('pagination').append(
				'<ul>'+
					'<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
					'<li class="next disabled"><a href="#">'+oLang.sNext+' &rarr; </a></li>'+
				'</ul>'
			);
			var els = $('a', nPaging);
			$(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
			$(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
		},

		"fnUpdate": function ( oSettings, fnDraw ) {
			var iListLength = 5;
			var oPaging = oSettings.oInstance.fnPagingInfo();
			var an = oSettings.aanFeatures.p;
			var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

			if ( oPaging.iTotalPages < iListLength) {
				iStart = 1;
				iEnd = oPaging.iTotalPages;
			}
			else if ( oPaging.iPage <= iHalf ) {
				iStart = 1;
				iEnd = iListLength;
			} else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
				iStart = oPaging.iTotalPages - iListLength + 1;
				iEnd = oPaging.iTotalPages;
			} else {
				iStart = oPaging.iPage - iHalf + 1;
				iEnd = iStart + iListLength - 1;
			}

			for ( i=0, iLen=an.length ; i<iLen ; i++ ) {
				// Remove the middle elements
				$('li:gt(0)', an[i]).filter(':not(:last)').remove();

				// Add the new list items and their event handlers
				for ( j=iStart ; j<=iEnd ; j++ ) {
					sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
					$('<li '+sClass+'><a href="#">'+j+'</a></li>')
						.insertBefore( $('li:last', an[i])[0] )
						.bind('click', function (e) {
							e.preventDefault();
							oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
							fnDraw( oSettings );
						} );
				}

				// Add / remove disabled classes from the static elements
				if ( oPaging.iPage === 0 ) {
					$('li:first', an[i]).addClass('disabled');
				} else {
					$('li:first', an[i]).removeClass('disabled');
				}

				if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
					$('li:last', an[i]).addClass('disabled');
				} else {
					$('li:last', an[i]).removeClass('disabled');
				}
			}
		}
	}
} );