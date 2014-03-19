<?php

	/*
		nysMVC v1.1.0
		written by: Eric Bower (http://neurosnap.net)
		Latest: https://github.com/neurosnap/nysMVC
	*/

	//GLOBALS
	//----------------------------------------------------------------------
	
	$settings = new stdClass();

	//base directory for where the MVC is located
	$settings->base_dir = dirname(__FILE__);
	//main directory for image files
	$settings->image_dir = "./layouts/assets/images";
	//company name
	$settings->company_name = "DEMO COMPANY";
	//product name
	$settings->product_name = "DEMO PRODUCT";
	//description for meta data
	$settings->product_description = "This is a " . $settings->product_name . " description for " . $settings->company_name;
	$settings->logo = './layouts/assets/images/nysus.png';

	//library directory, primarily for plugin class
	$settings->lib_dir = './lib';
	//default layout file in ./layouts
	$settings->layout = "layout.php";

?>
