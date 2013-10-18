
/* =======================================================================
 * nysReports.js v1.1.5
 * https://github.com/neurosnap/jQuery-nysReports
 * Dependencies:  jQuery, 
 *                DataTables
 * Optional:      JSAPI (Google's API for Visualization),
 *                Select2, 
 *                JqueryUI Datepicker,
 * =======================================================================
 * Copyright 2013 Nysus Solutions, LLC.
 *
 *  This file is part of nysReports.
 * 
 *  nysReports is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  nysReports is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with nysReports.  If not, see <http://www.gnu.org/licenses/>.
 *
 * ======================================================================= */
var nysReport = (function($) {

  $.fn.nysReports = function(options) {

    var that = this;

    this.settings = $.extend(true, {
      "views": {
        "filters": ".filters",
        "grid": ".grid",
        "notify": ".notify"
      },
      "buttons": {
        "run_report": ".run_report",
        "clear_filters": ".clear_filters"
      },
      "filters": {
        "options": {
          "cols_per_row": 3
        }
      }
    }, options);

    if ($(this.settings.views.notify).length == 0) {

      $(this).prepend('<div class="notify"></div>');
      this.settings.views.notify = ".notify";

    }

    this.data = {};

    //used to hold dtbl object
    this.dtbl_obj = null;
    //used for datatables to tell if expanded view is open or closed
    this.anOpen = [];

    //default location for nysReports
    //this.init = null;

    init(that);

    return this;

  };

  function init(that) {

    $(that).find(that.settings.views.filters).html("filters");
    $(that).find(that.settings.views.chart).html("chart");
    $(that).find(that.settings.views.grid).html("grid");

    filterView(that);
    listen(that);

    if (that.settings.hasOwnProperty("selectContent"))
      getSelectContent(that);
    else {
      
      if (that.settings.hasOwnProperty("reportContent")) {

        if (that.settings.reportContent.hasOwnProperty("options") 
          && that.settings.reportContent.options.hasOwnProperty("start_onload")) {

            if (that.settings.reportContent.options.start_onload)
              getReportContent(that);

        } else {

          getReportContent(that);

        }

      } else {

        error(that, "settings.reportContent missing, cannot load report content");

      }

    }

  };

  function error(that, msg) {

    $(that.settings.views.notify).append('<strong style="color: red;">' + msg + '</strong><br />');

  }

  function getSelectContent(that) {

    $.ajax({
      "url": that.settings.selectContent.url,
      "type": "POST",
      "dataType": "json",
      "data": that.settings.selectContent.data,
      "success": function(res) {

        for (var i = 0; i < that.settings.filters.fields.length; i++) {

          var field = that.settings.filters.fields[i];

          if (field.hasOwnProperty("selectOptions") && field.selectOptions.hasOwnProperty("json_key"))
            $('#' + field.id).html(jsonToSelect(res[field.selectOptions.json_key]));

        }

        if (that.settings.reportContent.hasOwnProperty("options") 
          && that.settings.reportContent.options.hasOwnProperty("start_onload")) {

            //Should we load the main grid content 
            if (that.settings.reportContent.options.start_onload)
              getReportContent(that);

        } else {

          getReportContent(that);

        }

      }
    });

  };

  function getReportContent(that) {

    if (that.settings.hasOwnProperty("reportContent")) {

      var filter_data = getFilters(that);

      $.extend(true, filter_data, that.settings.reportContent.data);

      $.ajax({
        "url": that.settings.reportContent.url,
        "type": "POST",
        "dataType": "json",
        "cache": false,
        "data": filter_data,
        "beforeSend": function() {
        },
        "success": function(ret) {

          if (that.settings.reportContent.hasOwnProperty("mData")) {

            that.data.report = that.settings.reportContent.mData.response(ret);

            gridView(that, that.data.report);

          } else {

            that.data.report = ret;

            gridView(that, that.data.report);

          }

          if (that.settings.hasOwnProperty('chartContent'))
            chartView(that, that.data.report);
          else
            $(that).find(that.settings.views.chart).hide();

        }
      });

    } else {
      error(that, "settings.reportContent missing, cannot load report");
    }

  };

  function getDrilldownContent(that, oT, row) {

    var data = getRowData(that, oT, row);
    var filter_data = getFilters(that);

    $.extend(true, data, filter_data);

    //clear row tables
    $("td.details.row" + row.rowIndex).html("");

    //closure variable
    //only blocking in javascript is via functional blocking,
    //therefore I pass the index var to anon function(i) which then
    //returns the proper index var and consequently data for the ajax call below

    for (var i = 0; i < that.settings.drilldownContent.length; i++) {

      data = $.extend(true, data, that.settings.drilldownContent[i].data);

      (function(i) {

        $.ajax({
          "url": that.settings.drilldownContent[i].url,
          "type": "POST",
          "dataType": "json",
          "data": data,
          "success": function(ret) {

            var ajax = that.settings.drilldownContent[i];

            if (ajax.hasOwnProperty("success")) {

              ajax.success(data, ret, $("td.details.row" + row.rowIndex));

            } else {

              if (ret !== null && ret.length > 0) {

                if (ajax.hasOwnProperty("options")) {

                  if (ajax.options.hasOwnProperty("loadChart")) {

                    var content = '<div class="row-fluid">' +
                            '<div class="span6" style="float: left !important;">' +
                              '<div class="box chart">' +
                                '<div class="title"><h4>' + ajax.options.title + '</h4></div>' +
                                '<div class="content"><table id="' + ajax.id + '" class="' + ((ajax.options.tbl_class) ? ajax.options.tbl_class : '') + '"></table></div>' +
                              '</div>' +
                            '</div>' +
                            '<div class="span6" style="float: right !important;">' + 
                              '<div class="box chart">' +
                                '<div class="title"><h4>' + ajax.options.loadChart.title + '</h4></div>' +
                                '<div class="content" id="' + ajax.options.loadChart.id + 
                                '" style="height: 250px; width: 400px;"></div>' +
                              '</div>' +
                            '</div>'
                            '</div>';

                  } else {

                    var content = '<div class="row-fluid">' +
                            '<div class="span12" style="float: left !important;">' +
                              '<div class="box chart">' +
                                '<div class="title"><h4>' + ajax.options.title + '</h4></div>' +
                                '<div class="content"><table id="' + ajax.id + '" class="' + ((ajax.options.tbl_class) ? ajax.options.tbl_class : '') + '"></table></div>' +
                              '</div>' +
                            '</div>' +
                            '</div>';

                  }

                } else {

                  var content = '<div class="row-fluid">' +
                            '<div class="span12" style="float: left !important;">' +
                              '<div class="box chart">' +
                                '<div class="title"><h4>Drilldown</h4></div>' +
                                '<div class="content"><table id="' + ajax.id + '" class="' + ((ajax.options.tbl_class) ? ajax.options.tbl_class : '') + '"></table></div>' +
                              '</div>' +
                            '</div>' +
                            '</div>';

                }

                $("td.details.row" + row.rowIndex).append(content);

                var fin = jsonToDataTables(that, ret);

                if (ajax.hasOwnProperty("options") && ajax.options.hasOwnProperty("loadChart")) {
                  chartView(that, ret, false, ajax.options.loadChart);
                }

                var dt_obj = {
                  "aaData": fin.rows,
                  "aoColumns": fin.columns,
                  "bAutoWidth": false,
                  "bDestroy": true,
                  "sDom": 'T<"clear">lfrtip'
                };

                if (ajax.hasOwnProperty("options") && ajax.options.hasOwnProperty("datatable"))
                  $.extend(true, dt_obj, ajax.options.datatable);

                //reportContent have any options?
                if (that.settings.reportContent.hasOwnProperty("options")) {

                  //tabletools plugin?
                  if (that.settings.reportContent.options.hasOwnProperty("tabletools")) {

                    dt_obj.oTableTools = {
                            "sSwfPath": that.settings.reportContent.options.tabletools.swf_dir + "/copy_csv_xls_pdf.swf"
                        };

                  }

                }

                ajax.dt_obj = $(that).find("#" + ajax.id).dataTable(dt_obj);

                $("#" + ajax.id).find('.dataTables_length').remove();

              } else {

                var content = '<div class="row-fluid">' +
                          '<div class="span12" style="float: left !important;">' +
                            '<div class="box chart">' +
                              '<div class="title"><h4>' + ajax.options.title + '</h4></div>' +
                              '<div class="content">No data to display</div>' +
                            '</div>' +
                          '</div>' +
                          '</div>';

                $("td.details.row" + row.rowIndex).append(content);

              }

            }

          }
        });

      })(i);

    }

  };

  function listen(that) {
    
    //run report
    $(that).on('click', that.settings.buttons.run_report, function(e) {

      e.preventDefault();
      getReportContent(that);

    });

    $(that).on('click', that.settings.buttons.clear_filters, function(e) {

      e.preventDefault();
      getFilters(that, true);

    });

    $(that).on('click', that.settings.views.grid + ' td.expanded_view', function(e) {

      e.preventDefault();

      //local var that holds the datatables object
      var oT = that.dtbl_obj;
      //table row of the td clicked
      var row = this.parentNode;
      //checks for a value "row" in an array "anOpen"
        var i = $.inArray(row, that.anOpen);

        //inArray returns -1 if no match found
        if (i === -1) {

          $(this).html('<a href="#" onclick="return false;">Collapse</a>');
        oT.fnOpen(row, getDrilldownContent(that, oT, row), 'details row' + row.rowIndex);
            that.anOpen.push(row);

        } else {

          $(this).html('<a href="#" onclick="return false;">' + 
                      ((that.settings.drilldownContent.hasOwnProperty("title")) ? that.settings.drilldownContent.title : 'Expand') + 
                      '</a>');

          oT.fnClose(row);
          that.anOpen.splice(i, 1);

        }

    });

    $(that).on("click", that.settings.views.grid + " .launch_view", function(e) {

      e.preventDefault();

      if (that.settings.hasOwnProperty("launchContent")) {

        if (that.settings.launchContent.hasOwnProperty("onLaunch")) {

          that.settings.launchContent.onLaunch($(that).attr("launch_ID"), getFilters(that));

        } else {

          error(that, "missing onLaunch(launch_ID, filters) function in settings.launchView");
        
        }

      }

    });

    /*
    that.on("click", "#print_chart", function(e) {

      e.preventDefault();

      $("#sidebar").hide();
      $("#nys_content").hide();
      $("#print").show();

      that.settings.loadChartView.chartObj.containerId = "printerFriendly";
      google.visualization.drawChart(that.settings.loadChartView.chartObj);

    });

    that.on("click", "#print_close", function(e) {

      e.preventDefault();

      $("#sidebar").show();
      $("#nys_content").show();
      $("#print").hide();

    });

    that.on("click", "#print_print", function(e) {

      window.print();
      
    });
    */

  };

  function filterView(that) {
    
    if (that.settings.hasOwnProperty("filters")) {

      var content = '<div class="row-fluid"><div class="span12">';

      //dynamic row/column creation

      var col_count = that.settings.filters.options.cols_per_row || that.settings.filters.cols_per_row;
      var count = 0;
      var tmp_span = Math.ceil((12 / col_count) * 10) / 10;
      var span = getSpans(that, tmp_span);

      for (var i = 0; i < that.settings.filters.fields.length; i++) {

        var field = that.settings.filters.fields[i];

        if (count == col_count) {

          content = content + '</div></div><div class="row-fluid"><div class="span12">';

          count = 0;

        }

        if (field.input == 'text') {

          content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.title +
                    ': </label>' +
                    '<div class="span' + span.input + '">' +
                      '<input type="text" name="' + field.id + '" id="' + field.id + '" value="' + 
                      ((field.hasOwnProperty("options") && field.options.default) ? field.options.default : "") + 
                      '" style="width: 90% !important;">' +
                    '</div>';
        } else if (field.input == 'datepicker') {
          //date input

          content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.title +
                    ': </label>' +
                    '<div class="span' + span.input + '">' +
                      '<input type="text" name="' + field.id + '" id="' + field.id + '" value="' + 
                      ((field.hasOwnProperty("options") && field.options.default) ? field.options.default : getDate()) +
                      '" style="width: 90% !important;">' +
                    '</div>';

        //select dropdown input
        } else if (field.input == 'select2' || field.input == 'select') {

          //if (typeof $.prototype.select2 === 'function')

          //if selectOptions.data array is detected then the select dropdown is generated instead of AJAX
          if (field.hasOwnProperty("selectOptions") 
            && field.selectOptions.hasOwnProperty("data") 
            && Array.isArray(field.selectOptions.data)) {

            content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.title +
                      '</label>' +
                        ' <div class="span' + span.input + '">' +
                          '<select name="' + field.id + '" id="' + field.id +
                          '" class="nostyle" style="width: 100%;" placeholder="Select Option" ' + 
                          ((field.selectOptions.hasOwnProperty("multiple")
                            && field.selectOptions.multiple) ? 'multiple="multiple"' : '') + '>' +
                            '<option></option>';

            for (var z = 0; z < field.selectOptions.data.length; z++) {

              var op = field.selectOptions.data[z];

              content = content + '<option value="' + op.value + '">' + op.text + '</option>';

            }

            content = content + '</select></div>';

          //special group_by select
          } else if (field.id == 'group_by' && field.hasOwnProperty("group") && Array.isArray(field.group)) {

            content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.title +
                      '</label>' +
                        ' <div class="span' + span.input + '">' +
                          '<select name="' + field.id + '" id="' + field.id +
                          '" class="nostyle" style="width: 100%;" placeholder="Group" ' +
                           ((field.hasOwnProperty("selectOptions") 
                            && field.selectOptions.hasOwnProperty("multiple")
                            && field.selectOptions.multiple) ? 'multiple="multiple"' : '') + '>';

            for (var j = 0; j < field.group.length; j++)
              content = content + '<option value="' + field.group[j].value + '">' + field.group[j].text + '</option>';

            content = content + '</select></div>';

          } else {

            content = content + '<label class="form-label span' + span.label + '" for="' + field.id + '">' + field.title +
                      ': </label>' +
                      '<div class="span' + span.input + '">' +
                        '<select name="' + field.id + '" id="' + field.id +
                        '" class="nostyle" style="width: 100%;" placeholder="Choose a filter" ' +
                           ((field.hasOwnProperty("selectOptions") 
                            && field.selectOptions.hasOwnProperty("multiple")
                            && field.selectOptions.multiple) ? 'multiple="multiple"' : '') + '>' +
                        ' <option></option>' +
                        ' <option value="1">Error: Could not load select data</option>' +
                        '</select>' +
                      '</div>';

          }

        }

        count++;

      }

      $(that).find(that.settings.views.filters).html(content);

      //activates any special input plugins, formats, etc.
      for (var i = 0; i < that.settings.filters.fields.length; i++) {

        var field = that.settings.filters.fields[i];

        switch (field.input) {

          case "select":
          break;

          case "select2":

            if (typeof $.prototype.select2 === 'function' && field.input == 'select2')
              $('#' + field.id).select2();
            else
              error(that, "Select2 plugin not detected, cannot load [" + field.title + "] as select2");

          break;

          case "datepicker":

            if (typeof $.prototype.datepicker === 'function')
              $('#' + field.id).datepicker();
            else
              error(that, "jQuery UI Datepicker plugin not detected, cannot load [" + field.title + "] as datepicker");

          break;

        }

      }

    } else {

      error(that, "settings.filterView missing, cannot load filters");

    }

  };

  function gridView(that, data) {

    //Data found for main query?
    if (data.length > 0) {

      if (that.settings.hasOwnProperty("drilldownContent"))
        var fin = jsonToDataTables(that, data, true);
      else if (that.settings.hasOwnProperty("launchContent"))
        var fin = jsonToDataTables(that, data, false, true);
      else
        var fin = jsonToDataTables(that, data);

      //remove table which helps datatables reinitialize without folly
      if (that.dtbl_obj != null) {

        that.dtbl_obj.fnDestroy();

        if ($(that).find(that.settings.views.grid).length > 0) {

          var parent = $(that).find(that.settings.views.grid);

          parent.html('<table class="' + ((that.settings.reportContent.hasOwnProperty("options") 
                          && that.settings.reportContent.options.tbl_class) ? that.settings.reportContent.options.tbl_class : '') + 
                '"></table>');

          that.dtbl_obj = null;

        }

      } else {

        if ($(that).find(that.settings.views.grid).length > 0) {

          var parent = $(that).find(that.settings.views.grid);

          parent.html('<table class="' + ((that.settings.reportContent.hasOwnProperty("options") 
                          && that.settings.reportContent.options.tbl_class) ? that.settings.reportContent.options.tbl_class : '') + 
                '"></table>');

          that.dtbl_obj = null;

        }

      }

      //datatables object
      var dt_obj = {
        "bDestroy": true,
            "bScrollCollapse": true,
        "aaData": fin.rows,
        "aoColumns": fin.columns
      };

      //check for tabletools extension for exporting to excel, printing, etc.
      if (that.settings.reportContent.hasOwnProperty("options") 
        && that.settings.reportContent.options.hasOwnProperty("tabletools")) {

        dt_obj.sDom = 'T<"clear">lfrtip';

        dt_obj.oTableTools = {
                "sSwfPath": that.settings.reportContent.options.tabletools.swf_dir + "/copy_csv_xls_pdf.swf"
            };

        }

        if (that.settings.reportContent.hasOwnProperty("options")
          && that.settings.reportContent.options.hasOwnProperty("datatable"))
            $.extend(true, dt_obj, that.settings.reportContent.options.datatable);

      //initialize datatables and set a settings variable to hold the object
      that.dtbl_obj = $(that).find(that.settings.views.grid).find("table").dataTable(dt_obj);

    //No data found for main query
    } else {

      //destroy any current datatables
      if (that.dtbl_obj != null)
        that.dtbl_obj.fnDestroy();

      //re-build datatables container
      if ($(that).find(that.settings.views.grid).length > 0) {

        var parent = $(that).find(that.settings.views.grid);

        parent.html('<table class="' + ((that.settings.reportContent.hasOwnProperty("options") 
                          && that.settings.reportContent.options.tbl_class) ? that.settings.reportContent.options.tbl_class : '') + 
                '"></table>');

        that.dtbl_obj = null;

        $(that)
          .find(that.settings.views.grid)
          .find("table")
          .html('<tr><th></th></tr><tr><td>No data found with the current filters.</td></tr>');

      }

    }

  };

  function chartView(that, data, extra_chart_view, drilldown_chart_view) {

    if (!foundGoogleJSAPI()) {

      error(that, "JSAPI not found, could not load chart.");

      return;

    }

    var view = null;
    var view_id = null;

    $('#div_charts').css('display', 'block');

    if (typeof extra_chart_view === 'undefined')
      extra_chart_view = false;

    if (typeof drilldown_chart_view === "undefined")
      drilldown_chart_view = false;

    if (extra_chart_view) {

      view = extra_chart_view.options;
      view_id = extra_chart_view.id;
    
    } else if (drilldown_chart_view) {
      
      view = drilldown_chart_view;
      view_id = drilldown_chart_view.id;
    
    } else {
    
      view = that.settings.chartContent;
      view_id = that.settings.chartContent.id;
    
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

        //override group by if it's a drilldown chart
        if (col.type == "group_by" && drilldown_chart_view)
          col.type = "string";

        //check for special group_by feature
        if (col.type == "group_by" && !drilldown_chart_view) {

          //loop for filters to search for corresponding group array in filters object
          for (var f = 0; f < this.settings.filters.fields.length; f++) {

            var filter = this.settings.filters.fields[f];

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

      //chart.addColumn("string", "Line");
      //chart.addRow([0,30]);

      //Adjusting the chart type depending on number of rows
      //detected
      var chart_type = view.type;

      if (view.type == "LineChart" && data.length == 1)
        chart_type = "ColumnChart";

      //google visualization object
      var chartObj = {
        "dataTable": chart,
        "containerId": view_id,
        "chartType": chart_type,
        "options": {
          "title": ((typeof title !== null) ? title : view.title),
          //"height": 400,
          "axisFontSize": 10,
          "hAxis": {
            "title": capFirst(x),
            "allowContainerBoundaryTextCufoff": true
            /*"viewWindowMode": "explicit",
            "viewWindow": {
              "min": 0,
              "max": data[data.length - 1].ID + 1
            }*/
          },
          "vAxis": {
            "title": capFirst(y)
          }
        }
      };

      $.extend(true, chartObj.options, that.settings.chartContent.options);

      google.visualization.drawChart(chartObj);

      if (!drilldown_chart_view)
        that.settings.chartContent.chartObj = chartObj;

    } else {

      $("#" + view_id).html('No data found with the current filters.');

    }

  };

  function getFilters(that, clear) {

    var obj = {};

    for (var i = 0; i < that.settings.filters.fields.length; i++) {

      var field = that.settings.filters.fields[i];

      if (clear) {

        if ($('#' + field.id).hasClass("hasDatepicker"))
          $('#' + field.id).val(getDate());
        else {

          if (typeof $.fn.select2 === "function")
            $('#' + field.id).select2('data', null);
          else
            $('#' + field.id).val("");
        }

      } else {

        if ($('#' + field.id).val() != "" && $('#' + field.id).val() != null) {
          
          if ((field.input == "select" || field.input == "select2") && !field.selectOptions.multiple) {

            //convert any select options into arrays to make my life easier on the backend
            if (!$.isArray($('#' + field.id).val()))
              obj[field.id] = [ $('#' + field.id).val() ];

          } else {
            obj[field.id] = $('#' + field.id).val();
          }

        }

      }

    }

    if (!clear)
      return obj;

  };

  function getRowData(that, oT, row) {

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

    if (obj.hasOwnProperty(""))
      delete obj[""];

    return obj;

  };

  function getSpans(that, col_span) {

    var fin = {};
    var label_offset = 1;

    if (isOdd(col_span)) {

      var span = Math.ceil(col_span * 10) / 10;
      fin.label = span - label_offset - 1;
      fin.input = span + label_offset + 1;

    } else {

      fin.label = col_span / 2 - label_offset;
      fin.input = col_span / 2 + label_offset;

    }

    return fin;

  };

  function getDate() {

    var d = new Date();

    return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();

  };

  function jsonToDataTables(that, data, expand, launch) {

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

        for (var prop in obj) {

          var options = { "sTitle": prop }

          if (that.settings.hasOwnProperty("reportContent")
            && that.settings.reportContent.hasOwnProperty("options"))
              $.extend(true, options, that.settings.reportContent.options.col_options || {});
          
          if (that.settings.reportContent.hasOwnProperty("options") 
            && that.settings.reportContent.options.hasOwnProperty("col_override")) {
              ret.columns.push(that.settings.reportContent.options.col_override({ "key": prop, "value": obj[prop] }));
          } else if (that.settings.hasOwnProperty("drilldownContent")
                && that.settings.drilldownContent.hasOwnProperty("options") 
                && that.settings.drilldownContent.options.hasOwnProperty("col_override")) {
              ret.columns.push(that.settings.drilldownContent.options.col_override({ "key": prop, "value": obj[prop] }));
          } else {
            ret.columns.push(options);
          }

        }

        first = false;

      }

      if (expand) {

        row_agg = '<a href="#" onclick="return false;" mod_ID="' + data[i].ID + '">' + 
                  ((that.settings.drilldownContent.hasOwnProperty("title")) ? that.settings.drilldownContent.title : 'Expand') + 
                  '</a>,';

      } else if (launch) {
        row_agg = '<a href="#" launch_ID="' + data[i].ID + '" class="launch_view">Launch</a>,';
      } else {
        row_agg = '';
      }

      for (var prop in obj) {

        if (obj[prop] != null)
          row_agg = row_agg + obj[prop].toString().replace(/,/g, '') + ',';
        else
          row_agg += ",";
        
      }

      row_agg = row_agg.slice(0, -1);
      ret.rows.push(row_agg.split(","));

    }

    return ret;

  };

  function jsonToSelect(data) {

    if (typeof data !== "undefined" && data.length > 0) {

      var content = '<option value=""> - Choose - </option>';

      for (var i = 0; i < data.length; i++) {
        content = content + '<option value="' + data[i].value + '">' + data[i].text + '</option>';
      }

      return content;

    }

  };

  function isOdd(num) {

    return num % 2;

  };

  function capFirst(string) {

     return string.charAt(0).toUpperCase() + string.slice(1);

  };

 });

//Gotta check for google JSAPI before we load the plugin
//or else all the content gets wiped
function foundGoogleJSAPI() {

  var scripts = document.getElementsByTagName('script');

  for (var i = 0; i < scripts.length; i++) {

    var src = scripts[i].src;

    if (typeof src != 'undefined' && src.indexOf("jsapi") != -1)
      return true;

  }

  return false;

}

if (foundGoogleJSAPI())
  google.load("visualization", "1.0", { 'packages': ["corechart"], 'callback': nysReport(jQuery) });
else
  nysReport(jQuery);