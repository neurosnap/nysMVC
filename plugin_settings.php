<?php
	
function get_plugins($api = false, $action = false) {

	if (!$api || gettype($api) !== "string") {
		die("Plugin Settings: API is invalid");
	}

	$response = "No plugins defined for API (" . $api . ")";

	switch(strtolower($api)) {

		case "dashboard":
			$response = array("supr");
		break;

		default:
			$response = array("supr");
		break;

	}

	return $response;

}

?>