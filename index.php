<?php

error_reporting(E_ALL);

ini_set('display_errors', '1');

//require MVC classes
require("settings.php");
require("classes/loader.php");
require("classes/baseapi.php");
require("classes/orm.php");
require("classes/plugins.php");

//require api classes
//require("api/dashboard.php");

//scan api directory to automatically include api
$api_dir = $settings->base_dir . "\\api\\";

if ($handle = opendir($api_dir)) {

	while (false !== ($file = readdir($handle))) {

		if ($file != "." && $file != "..")
			require($api_dir . $file);

	}

}

//create the api and execute the action
$loader = new Loader($_GET);
$api = $loader->createAPI();
$api->loadAction();

?>