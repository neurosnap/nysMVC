<!--#include file="JSON_2.0.2.asp" -->

<%

 ' =======================================================================
 ' tblEditor.js v1.0.0
 ' https://github.com/nysus/tblEditor
 ' Dependencies:  jQuery, DataTables, Bootstrap
 ' =======================================================================
 ' Copyright 2013 Nysus Solutions, Inc.
 '
 '  This file is part of tblEditor.
 ' 
 '  tblEditor is free software: you can redistribute it and/or modify
 '  it under the terms of the GNU General Public License as published by
 '  the Free Software Foundation, either version 3 of the License, or
 '  (at your option) any later version.
 '
 '  tblEditor is distributed in the hope that it will be useful,
 '  but WITHOUT ANY WARRANTY; without even the implied warranty of
 '  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 '  GNU General Public License for more details.
 '
 '  You should have received a copy of the GNU General Public License
 '  along with tblEditor.  If not, see <http://www.gnu.org/licenses/>.
 '
 ' ======================================================================= *
	
 	Dim oConn, connString, onPPC
	Set oConn = Server.CreateObject("ADODB.Connection")

	connString = "Provider=SQLOLEDB;" & _
				 "Data Source=www.nysus.net;" & _
				 "Initial Catalog=calibration;" & _
				 "User Id=nysususer;Password=nysus2444;"

	oConn.ConnectionString = connString
	oConn.Open connString

	Response.ContentType = "application/json"

	action = Request("action")

	if action = "get_table_info" Then
		Response.Write "{""fields"":"
		strSQL = "SELECT c.COLUMN_NAME, c.DATA_TYPE, c.COLUMN_DEFAULT, c.IS_NULLABLE, c.TABLE_NAME, COLUMNPROPERTY(OBJECT_ID(c.TABLE_NAME),c.COLUMN_NAME,'IsIdentity') as IS_IDENTITY, ISNULL(s.value, '{}') as FIELD_DESC " & _
					"FROM information_schema.columns c " & _
					"	JOIN sys.columns c2 ON OBJECT_ID(c.TABLE_CATALOG + '.' + c.TABLE_SCHEMA + '.' + c.TABLE_NAME) = c2.object_id AND c.COLUMN_NAME = c2.name " & _
					"	LEFT OUTER JOIN sys.extended_properties s ON c2.object_id = s.major_id AND c2.column_id = s.minor_id " & _
					"WHERE c.table_name = '" & Request("table_name") & "' "

		if Len(Request("hard_coded_field")) > 0 Then
			strSQL = strSQL & " AND c.COLUMN_NAME <> '" & Request("hard_coded_field") & "' "
		end if

		strSQL = strSQL & "ORDER BY c.ordinal_position"
		QueryToJSON(oConn, strSQL).Flush

		Response.Write ", ""table_data"":"
		strSQL = "SELECT * FROM " & Request("table_name") & " WHERE 1=1 "

		if Len(Request("hard_coded_field")) > 0 Then
			strSQL = strSQL & " AND " & Request("hard_coded_field") & " " & Request("hard_coded_operator") & " " & Request("hard_coded_value") & " "
		end if

		tableDataSQL = Replace(strSQL, "SELECT *", "SELECT ID")

		strSQL = strSQL & " ORDER BY id ASC"

		QueryToJSON(oConn, strSQL).Flush

		Response.Write ", ""foreign_key_data"":["
		strSQL = "SELECT FK.TABLE_NAME, FK_COLS.COLUMN_NAME, PK.TABLE_NAME as REF_TABLE_NAME, PK_COLS.COLUMN_NAME as REF_COLUMN_NAME, ISNULL(s.value, '{}') as [FIELD_DESC] " & _
					"FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS REF_CONST " & _
					"	INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS FK " & _
					"		ON REF_CONST.CONSTRAINT_CATALOG = FK.CONSTRAINT_CATALOG " & _
					"			AND REF_CONST.CONSTRAINT_SCHEMA = FK.CONSTRAINT_SCHEMA " & _
					"			AND REF_CONST.CONSTRAINT_NAME = FK.CONSTRAINT_NAME " & _
					"			AND FK.CONSTRAINT_TYPE = 'FOREIGN KEY' " & _
					"	INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS PK  " & _
					"		ON REF_CONST.UNIQUE_CONSTRAINT_CATALOG = PK.CONSTRAINT_CATALOG " & _
					"			AND REF_CONST.UNIQUE_CONSTRAINT_SCHEMA = PK.CONSTRAINT_SCHEMA " & _
					"			AND REF_CONST.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME " & _
					"			AND PK.CONSTRAINT_TYPE = 'PRIMARY KEY' " & _
					"	INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE FK_COLS ON REF_CONST.CONSTRAINT_NAME = FK_COLS.CONSTRAINT_NAME " & _
					"	INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE PK_COLS ON PK.CONSTRAINT_NAME = PK_COLS.CONSTRAINT_NAME " & _
					"	LEFT OUTER JOIN sys.columns c2 ON OBJECT_ID(FK.TABLE_CATALOG+'.'+FK.TABLE_SCHEMA+'.'+FK.TABLE_NAME) = c2.object_id AND FK_COLS.COLUMN_NAME = c2.name " & _
					"	LEFT OUTER JOIN sys.extended_properties s ON s.major_id = c2.object_id AND s.minor_id = c2.column_id AND s.name = 'MS_Description' " & _
					"WHERE FK.TABLE_NAME = '" & Request("table_name") & "'"
		Set oRs = oConn.Execute(strSQL)
		While Not oRs.EOF
			Response.Write "{" & _
								"	""REF_TABLE_NAME"":""" & oRs("REF_TABLE_NAME") & """, ""COLUMN_NAME"":""" & _
				oRs("COLUMN_NAME") & """, ""REF_COLUMN_NAME"":""" & oRs("REF_COLUMN_NAME") & """, ""REF_DATA"":"
			desc_column = ""
			'what is description field?
			strSQL = "SELECT c.*, COLUMNPROPERTY(OBJECT_ID(c.TABLE_NAME),c.COLUMN_NAME,'IsIdentity') as IS_IDENTITY, ISNULL(s.value, '{}') as 'FIELD_DESC' " & _
						"FROM information_schema.columns c " & _
						"	JOIN sys.columns c2 ON OBJECT_ID(c.TABLE_CATALOG + '.' + c.TABLE_SCHEMA + '.' + c.TABLE_NAME) = c2.object_id AND c.COLUMN_NAME = c2.name " & _
						"	JOIN sys.extended_properties s ON s.major_id = c2.object_id AND s.minor_id = c2.column_id AND s.name = 'MS_Description' AND s.value = 'IS_DESC_FIELD' " & _
						"WHERE c.TABLE_NAME = '" & oRs("REF_TABLE_NAME") & "' "

			'Response.Write strSQL
			Set oRs2 = oConn.Execute(strSQL)
			if Not oRs2.EOF Then
				desc_column = oRs2("COLUMN_NAME")
			end if
			oRs2.Close

			if desc_column = "" Then
				Response.Write "[]"
			else

				strSQL = "SELECT id as [value], " & desc_column & " as [text] " & _
							"FROM " & oRs("REF_TABLE_NAME") & " "

				'If Len(Request("fk_filtered_table") > 0) Then
				''	For i = 0 to UBound(Request("fk_filtered_table"))
				''		if Len(Request("fk_filtered_field")(i)) > 0 And UCase(oRs("REF_TABLE_NAME")) = UCase(Request("fk_filtered_table")(i)) Then
				''			strSQL = strSQL & " WHERE " & Request("fk_filtered_field")(i) & " " & Request("fk_filtered_clause")(i) & " "
				''		end if
				''	Next
				'End if

				strSQL = strSQL & "ORDER BY id"

				'Response.Write strSQL
				QueryToJSON(oConn, strSQL).Flush

			end if
			Response.Write "}"
			oRs.MoveNext
			if Not oRs.EOF Then
				Response.Write ", "
			end if
		WEnd
		oRs.Close

		Response.Write "], ""foreign_key_relationships"":"
		strSQL = "SELECT " & _
				 "	name, OBJECT_NAME(parent_object_id) 'fk_table', delete_referential_action, delete_referential_action_desc " & _
				 " FROM " & _
				 "   sys.foreign_keys " & _
				 " WHERE " & _
				 "	OBJECT_NAME(referenced_object_id) = '" & Request("table_name") & "'"

		QueryToJSON(oConn, strSQL).Flush

		Response.Write ", ""foreign_key_ref"":"
		strSQL = "SELECT " & _
					"	table_name = FK.TABLE_NAME, " & _
					"	column_name = FK_COLS.COLUMN_NAME, " & _
					"	ref_column_name = PK_COLS.COLUMN_NAME, " & _
					"  table_description = ISNULL(EP.value, '') " & _
					"FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS REF_CONST " & _
					"INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS FK " & _
					"	ON REF_CONST.CONSTRAINT_CATALOG = FK.CONSTRAINT_CATALOG " & _
					"	AND REF_CONST.CONSTRAINT_SCHEMA = FK.CONSTRAINT_SCHEMA " & _
					"	AND REF_CONST.CONSTRAINT_NAME = FK.CONSTRAINT_NAME " & _
					"	AND FK.CONSTRAINT_TYPE = 'FOREIGN KEY' " & _
					"INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS PK ON REF_CONST.UNIQUE_CONSTRAINT_CATALOG = PK.CONSTRAINT_CATALOG " & _
					"	AND REF_CONST.UNIQUE_CONSTRAINT_SCHEMA = PK.CONSTRAINT_SCHEMA " & _
					"	AND REF_CONST.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME " & _
					"	AND PK.CONSTRAINT_TYPE = 'PRIMARY KEY' " & _
					"INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE FK_COLS ON REF_CONST.CONSTRAINT_NAME = FK_COLS.CONSTRAINT_NAME " & _
					"INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE PK_COLS ON PK.CONSTRAINT_NAME = PK_COLS.CONSTRAINT_NAME " & _
					"LEFT OUTER JOIN sys.extended_properties EP ON EP.major_id = OBJECT_ID(FK.TABLE_CATALOG +'.'+FK.TABLE_SCHEMA+'.'+FK.TABLE_NAME) AND EP.minor_id = 0 AND EP.name = 'MS_Description' " & _
					"WHERE PK.TABLE_NAME = '" & Request("table_name") & "'"

		QueryToJSON(oConn, strSQL).Flush

		Response.Write ", ""related_IDs"":["
		Set oRs = oConn.Execute(strSQL)
		While Not oRs.EOF
			Response.Write "{""table_name"":""" & oRs("table_name") & """, ""col_name"":""" & oRs("column_name") & """, ""table_description"":""" & oRs("table_description") & """, ""fk_data_count"":"
			strSQL = "SELECT COUNT(*) as data_count, " & oRs("column_name") & " as 'ref_ID' FROM " & oRs("table_name") & " WHERE " & oRs("column_name") & " IN (" & tableDataSQL & ") GROUP BY " & oRs("column_name") & ""
			QueryToJSON(oConn, strSQL).Flush
			Response.Write "}"
			oRs.MoveNext
			if Not oRs.EOF Then
				Response.Write ", "
			end if
		WEnd
		oRs.Close

		Response.Write "]}"
	end if

	if action = "get_related_ids" Then

		strSQL = "SELECT ID, " & Request("col") & " as 'ref_ID' FROM " & Request("table") & " WHERE " & Request("col") & " IN (" & Request("ids") & ")"
		QueryToJSON(oConn, strSQL).Flush

	end if

	if action = "save_field" Then

		if Request("new_value") = "null" Then

			strSQL = "UPDATE " & Request("table_name") & " SET " & Request("field_name") & _
					 " = NULL WHERE id = '" & Request("row_ID") & "'"
		else
			new_value = Request("new_value")

			strSQL = "UPDATE " & Request("table_name") & " SET " & Request("field_name") & " = '" & _
				  new_value & "' WHERE id = '" & Request("row_ID") & "'"
		end if

		'Response.Write strSQL
		oConn.Execute strSQL
		Response.Write "{""success"":1}"
	end if

	if action = "delete_row" Then
		strSQL = "DELETE FROM " & Request("table_name") & " WHERE id = '" & Request("row_ID") & "'"
		oConn.Execute strSQL
		Response.Write "{""success"":1}"
	end if

	if action = "save_new_row" Then

		id_col = -1
		id_val = ""
		i = 0
		id_found = false

		strSQL = "SET NOCOUNT ON; " & _
					"INSERT INTO " & Request("table_name") & " ("

		cols = Split(Request("cols"), "--")

		For each x in cols
			strSQL = strSQL & x & ","
			If x = "ID" Then
				id_found = true
			End if
		Next

		strSQL = Left(strSQL,Len(strSQL)-1)

		strSQL = strSQL & ") VALUES ("
		val_arr = Split(Request("new_values"), "__")
		For i = 0 to UBound(val_arr)
			if i = id_col Then
				id_val = val_arr(i)
			end if
			if val_arr(i) = "null" Then
				strSQL = strSQL & "NULL"
			else
				strSQL = strSQL & "'" & val_arr(i) & "'"
			end if
			if i < UBound(val_arr) Then
				strSQL = strSQL & ", "
			end if
		Next
		strSQL = strSQL & ")"

		'Response.Write strSQL
		If id_found = true Then
			strSQL = strSQL  & "; SELECT @@IDENTITY as new_ID"
			Set oRs = oConn.Execute(strSQL)
			if Not oRs.EOF Then
				new_ID = oRs("new_ID")
			end if
			oRs.Close
		Else
			oConn.Execute(strSQL)
		End if

		Response.Write " { ""success"": true } "
		'Response.Flush

	end if

	if action = "update_col_xref_all" Then

		'get col table desc field
		strSQL = "SELECT c.name as COLUMN_NAME " & _
					"FROM sys.columns c " & _
					"	LEFT OUTER JOIN sys.extended_properties s ON s.major_id = c.object_id AND s.minor_id = c.column_id AND s.name = 'MS_Description' " & _
					"WHERE c.object_id = OBJECT_ID('dbo." & Request("col_table") & "') AND s.value = 'IS_DESC_FIELD' " & _
					"ORDER BY c.column_id"
		Set oRs = oConn.Execute(strSQL)
		if Not oRs.EOF Then
			col_desc_field = oRs("COLUMN_NAME")
		end if
		oRs.Close

		if Request("table") = "defect_part_defect_xref" Then
			look_ID = "part_ID"
		else
			look_ID = "gate_ID"
		end if

		if Request("value") = "1" Then


			strSQL = "SELECT ID FROM " & Request("col_table") & _
					 " WHERE " & col_desc_field & " = '" & Replace(Request("col"), "-_", " ") & "' AND " & _
					 " site_ID = " & Request("site_ID") & " "

			Set oRs = oConn.Execute(strSQL)
			if Not oRs.EOF Then
				col_ID = oRs("ID")
			end if
			oRs.Close

			strSQL = "DELETE FROM " & Request("table") & " " & _
					 " WHERE " & look_ID & " IN (SELECT ID FROM " & Request("col_table") & " WHERE " & col_desc_field & _
					 " = '" & Replace(Request("col"), "-_", " ") & "' AND site_ID = " & Request("site_ID") & ")"

			oConn.Execute strSQL

			strSQL = "INSERT INTO " & Request("table") & " (" & look_ID & ", defect_ID) " & _
					 " SELECT " & col_ID & ", dd.ID " & _
					 " FROM " & Request("row_table") & " dd"

			oConn.Execute strSQL

		else

			strSQL = "DELETE FROM " & Request("table") & " " & _
					 " WHERE " & look_ID & " IN (SELECT ID FROM " & Request("col_table") & " WHERE " & col_desc_field & _
					 " = '" & Replace(Request("col"), "-_", " ") & "' AND site_ID = " & Request("site_ID") & ")"

			oConn.Execute strSQL

		end if

		'Response.Write strSQL


	end if

	if action = "update_row_xref_all" Then

		'get col table desc field
		strSQL = "SELECT c.name as COLUMN_NAME " & _
					"FROM sys.columns c " & _
					"	LEFT OUTER JOIN sys.extended_properties s ON s.major_id = c.object_id AND s.minor_id = c.column_id AND s.name = 'MS_Description' " & _
					"WHERE c.object_id = OBJECT_ID('dbo." & Request("col_table") & "') AND s.value = 'IS_DESC_FIELD' " & _
					"ORDER BY c.column_id"
		Set oRs = oConn.Execute(strSQL)
		if Not oRs.EOF Then
			col_desc_field = oRs("COLUMN_NAME")
		end if
		oRs.Close

		strSQL = "SELECT c.name as COLUMN_NAME " & _
					"FROM sys.columns c " & _
					"	LEFT OUTER JOIN sys.extended_properties s ON s.major_id = c.object_id AND s.minor_id = c.column_id AND s.name = 'MS_Description' " & _
					"WHERE c.object_id = OBJECT_ID('dbo." & Request("row_table") & "') AND s.value = 'IS_DESC_FIELD' " & _
					"ORDER BY c.column_id"
		Set oRs = oConn.Execute(strSQL)
		if Not oRs.EOF Then
			row_desc_field = oRs("COLUMN_NAME")
		end if
		oRs.Close

		if Request("table") = "defect_part_defect_xref" Then
			look_ID = "part_ID"
		else
			look_ID = "gate_ID"
		end if

		strSQL = "SELECT ID FROM " & Request("row_table") & _
					 " WHERE " & row_desc_field & " = '" & Replace(Request("row"), "~~~", " ") & "' "

		Set oRs = oConn.Execute(strSQL)
		if Not oRs.EOF Then
			row_ID = oRs("ID")
		end if
		oRs.Close

		'Response.Write strSQL

		if Request("value") = "1" Then

			strSQL = "DELETE FROM " & Request("table") & " " & _
					 " WHERE defect_ID = " & row_ID & _
					 " AND " & look_ID & " IN (SELECT ID FROM " & Request("col_table") & " WHERE site_ID " & _
					 " = '" & Request("site_ID") & "')"

			oConn.Execute strSQL

			strSQL = "INSERT INTO " & Request("table") & " (defect_ID, " & look_ID & ") " & _
					 " SELECT " & row_ID & ", dd.ID " & _
					 " FROM " & Request("col_table") & " dd" & _
					 " WHERE site_ID = " & Request("site_ID")

			oConn.Execute strSQL

		else

			strSQL = "DELETE FROM " & Request("table") & " " & _
					 " WHERE defect_ID = " & row_ID & _
					 " AND " & look_ID & " IN (SELECT ID FROM " & Request("col_table") & " WHERE site_ID " & _
					 " = '" & Request("site_ID") & "')"

			oConn.Execute strSQL

		end if


	end if

	if action = "get_table_xref" Then
		'get fk info
		strSQL = "SELECT FK.TABLE_NAME, FK_COLS.COLUMN_NAME, PK.TABLE_NAME as REF_TABLE_NAME, PK_COLS.COLUMN_NAME as REF_COLUMN_NAME " & _
					"FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS REF_CONST " & _
					"	INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS FK " & _
					"		ON REF_CONST.CONSTRAINT_CATALOG = FK.CONSTRAINT_CATALOG " & _
					"			AND REF_CONST.CONSTRAINT_SCHEMA = FK.CONSTRAINT_SCHEMA " & _
					"			AND REF_CONST.CONSTRAINT_NAME = FK.CONSTRAINT_NAME " & _
					"			AND FK.CONSTRAINT_TYPE = 'FOREIGN KEY' " & _
					"	INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS PK  " & _
					"		ON REF_CONST.UNIQUE_CONSTRAINT_CATALOG = PK.CONSTRAINT_CATALOG " & _
					"			AND REF_CONST.UNIQUE_CONSTRAINT_SCHEMA = PK.CONSTRAINT_SCHEMA " & _
					"			AND REF_CONST.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME " & _
					"			AND PK.CONSTRAINT_TYPE = 'PRIMARY KEY' " & _
					"	INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE FK_COLS ON REF_CONST.CONSTRAINT_NAME = FK_COLS.CONSTRAINT_NAME " & _
					"	INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE PK_COLS ON PK.CONSTRAINT_NAME = PK_COLS.CONSTRAINT_NAME " & _
					"WHERE FK.TABLE_NAME = '" & Request("table_name") & "' "
		'Response.Write strSQL
		Set oRs = oConn.Execute(strSQL)
		While Not oRs.EOF
			if oRs("REF_TABLE_NAME") = Request("xref_cols") Then
				col_field = oRs("COLUMN_NAME")
			end if
			if oRs("REF_TABLE_NAME") = Request("xref_rows") Then
				row_field = oRs("COLUMN_NAME")
			end if
			oRs.MoveNext
		WEnd
		oRs.Close


		'get columns
		strSQL = "SELECT c.name as COLUMN_NAME " & _
					"FROM sys.columns c " & _
					"	LEFT OUTER JOIN sys.extended_properties s ON s.major_id = c.object_id AND s.minor_id = c.column_id AND s.name = 'MS_Description' " & _
					"WHERE c.object_id = OBJECT_ID('dbo." & Request("xref_cols") & "') AND s.value = 'IS_DESC_FIELD' " & _
					"ORDER BY c.column_id"
		'Response.Write strSQL
		Set oRs = oConn.Execute(strSQL)
		if Not oRs.EOF Then
			col_desc_field = oRs("COLUMN_NAME")
		end if
		oRs.Close

		'get rows
		strSQL = "SELECT c.name as COLUMN_NAME " & _
					"FROM sys.columns c " & _
					"	LEFT OUTER JOIN sys.extended_properties s ON s.major_id = c.object_id AND s.minor_id = c.column_id AND s.name = 'MS_Description' " & _
					"WHERE c.object_id = OBJECT_ID('dbo." & Request("xref_rows") & "') AND s.value = 'IS_DESC_FIELD' " & _
					"ORDER BY c.column_id"
		'Response.Write strSQL
		Set oRs = oConn.Execute(strSQL)
		if Not oRs.EOF Then
			row_desc_field = oRs("COLUMN_NAME")
		end if
		oRs.Close

		strSQL = "SELECT id, " & col_desc_field & " as [desc_field] " & _
					" FROM " & Request("xref_cols") & " " & _
					Request("col_filter") & _
					" ORDER BY " & col_desc_field
		'Response.Write strSQL
		'Response.Flush
		Set oRs = oConn.Execute(strSQL)
		strSQL = "SELECT r.ID as row_ID, [" & row_desc_field & "], "
		While Not oRs.EOF
			strSQL = strSQL & " CAST(MAX(CASE WHEN x." & col_field & " = '" & oRs("ID") & "' THEN 1 ELSE 0 END) as bit) as [" & oRs("desc_field") & "] "
			oRs.MoveNext
			if Not oRs.EOF Then
				strSQL = strSQL & ", "
			end if
		WEnd
		oRs.Close
		strSQL = strSQL & "FROM " & Request("xref_rows") & " r " & _
								"	LEFT OUTER JOIN " & Request("table_name") & " x ON r.ID = x." & row_field & " " & _
								Request("row_filter") & _
								"GROUP BY r.ID, " & row_desc_field & " " & _
								"ORDER BY r.ID"

		'Response.Write strSQL
		QueryToJSON(oConn, strSQL).Flush

	end if

	if action = "update_xref" Then

		strSQL = "SELECT FK.TABLE_NAME, FK_COLS.COLUMN_NAME, PK.TABLE_NAME as REF_TABLE_NAME, PK_COLS.COLUMN_NAME as REF_COLUMN_NAME " & _
					"FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS REF_CONST " & _
					"	INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS FK " & _
					"		ON REF_CONST.CONSTRAINT_CATALOG = FK.CONSTRAINT_CATALOG " & _
					"			AND REF_CONST.CONSTRAINT_SCHEMA = FK.CONSTRAINT_SCHEMA " & _
					"			AND REF_CONST.CONSTRAINT_NAME = FK.CONSTRAINT_NAME " & _
					"			AND FK.CONSTRAINT_TYPE = 'FOREIGN KEY' " & _
					"	INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS PK  " & _
					"		ON REF_CONST.UNIQUE_CONSTRAINT_CATALOG = PK.CONSTRAINT_CATALOG " & _
					"			AND REF_CONST.UNIQUE_CONSTRAINT_SCHEMA = PK.CONSTRAINT_SCHEMA " & _
					"			AND REF_CONST.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME " & _
					"			AND PK.CONSTRAINT_TYPE = 'PRIMARY KEY' " & _
					"	INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE FK_COLS ON REF_CONST.CONSTRAINT_NAME = FK_COLS.CONSTRAINT_NAME " & _
					"	INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE PK_COLS ON PK.CONSTRAINT_NAME = PK_COLS.CONSTRAINT_NAME " & _
					"WHERE FK.TABLE_NAME = '" & Request("table_name") & "'"
		Set oRs = oConn.Execute(strSQL)
		While Not oRs.EOF
			if oRs("REF_TABLE_NAME") = Request("xref_cols") Then
				col_field = oRs("COLUMN_NAME")
				col_table = oRs("REF_TABLE_NAME")
			end if
			if oRs("REF_TABLE_NAME") = Request("xref_rows") Then
				row_field = oRs("COLUMN_NAME")
			end if
			oRs.MoveNext
		WEnd
		oRs.Close

		'get col table desc field
		strSQL = "SELECT c.name as COLUMN_NAME " & _
					"FROM sys.columns c " & _
					"	LEFT OUTER JOIN sys.extended_properties s ON s.major_id = c.object_id AND s.minor_id = c.column_id AND s.name = 'MS_Description' " & _
					"WHERE c.object_id = OBJECT_ID('dbo." & Request("xref_cols") & "') AND s.value = 'IS_DESC_FIELD' " & _
					"ORDER BY c.column_id"
		Set oRs = oConn.Execute(strSQL)
		if Not oRs.EOF Then
			col_desc_field = oRs("COLUMN_NAME")
		end if
		oRs.Close

		'get col_ID
		strSQL = "SELECT id FROM " & col_table & " WHERE " & col_desc_field & " = '" & Replace(Request("field_desc"), "___", " ") & "'"
		'Response.Write strSQL
		Set oRs = oConn.Execute(strSQL)
		if Not oRs.EOF Then
			col_ID = oRs("ID")
		end if
		oRs.Close

		if Request("new_value") = "true" Then
			strSQL = "INSERT INTO " & Request("table_name") & " (" & row_field & ", " & col_field & ") VALUES (" & Request("row_ID") & ", " & col_ID & ")"
		else
			strSQL = "DELETE FROM " & Request("table_name") & " WHERE " & row_field & " = " & Request("row_ID") & " AND " & col_field & " = " & col_ID
		end if

		'Response.Write strSQL
		oConn.Execute strSQL
		Response.Write "{""success"":1}"
	end if

	if action = "get_table_cascade" Then

		If Request("filter_name") = "" Then
			use_filter = false
		Else
			use_filter = true
		End if

		strSQL = "SELECT ID, " & Request("text_col") & " as [desc] FROM " & Request("table")

		If use_filter Then
			strSQL = strSQL & " WHERE " & Request("filter_name") & " = " & Request("filter_value")
		End if

		QueryToJSON(oConn, strSQL).Flush

	end if

	oConn.Close
%>