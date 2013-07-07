<?php

	//GLOBALS
	//----------------------------------------------------------------------
	
	$settings = new stdClass();

	//base directory for where the MVC is located
	$settings->base_dir = dirname(__FILE__);
	//main directory for image files
	$settings->image_dir = "./layouts/assets/images";
	//cloudFront files
	$settings->cloudFront = "https://d1dah60mzcyfe0.cloudfront.net/theme_supr";
	
	//company name
	$settings->company_name = "DEMO COMPANY";
	//product name
	$settings->product_name = "DEMO PRODUCT";
	//description for meta data
	$settings->product_description = "This is a " . $settings->product_name . " description for " . $settings->company_name;
	$settings->logo = './layouts/assets/images/nysus.png';

	//DB INFO
	$settings->server = '';
	$settings->db = '';
	$settings->user = '';
	$settings->pass = '';
	$settings->driver = 'sqlsrv';

?>
