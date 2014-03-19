<?php
	
function get_plugins($api = false, $action = false) {

	if (!$api || gettype($api) !== "string") {
		die("Plugin Settings: API is invalid");
	}

	switch(strtolower($api)) {

		case "dashboard":
			$plugins = array("");
		break;

		default:
			$plugins = array("");
		break;

	}

	return $plugins;

}

?>