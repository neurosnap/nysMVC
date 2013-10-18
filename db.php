<?php
	
	/*
		Database connection variables, demarcated from settings.php because 
		this file will normally be ignored from git
	*/

	$db = new stdClass();

	$db->server = "";
	$db->dba = "";
	$db->user = "";
	$db->pass = "";
	//e.g. sqlsrv, mssql, mysql
	$db->driver = "sqlsrv";

?>