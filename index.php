<?php

//require MVC classes
require_once("classes/loader.php");
require_once("classes/baseapi.php");
require_once("classes/orm.php");

//scan api directory to automatically include api
$api_dir = implode(DIRECTORY_SEPARATOR, array(dirname(__FILE__), "api"));
if ($handle = opendir($api_dir)) {
	while (false !== ($file = readdir($handle))) {
		if ($file != "." && $file != "..") {
			require_once(implode(DIRECTORY_SEPARATOR, array($api_dir, $file)));
        }
	}
}

//create the api and execute the action
$loader = new Loader($_REQUEST);
$api = $loader->createAPI();
$api->loadAction($_REQUEST);

?>