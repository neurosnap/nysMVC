<?php

class Plugins {

	private $plugins;
	private $lib_dir;

	private $css_api;
	private $css_view;
	private $js_api;
	private $js_view;
	
	public $plugin_css = array("");
	public $plugin_js = array("");

	//map for linking an API with its necessary plugins
	public function __construct($plugins, $lib_dir, $api, $action) {

		if (!$plugins || !$lib_dir) {
			die("List of plugins requires lib_dir to be set in settings object");
		}

		$this->plugins = $plugins;
		$this->lib_dir = $lib_dir;

		//api-specific javascript file
		$js_api = './views/' . $api . '/js/' . $api . '.js';
		if ($api != $action && file_exists($js_api)) {
			$this->js_api = $js_api;
		}

		//view-specific javascript file
		$js_view = './views/' . $api . '/js/' . $action . '.js';
		if (file_exists($js_view)) {
			$this->js_view = $js_view;
		}
		
		//api-specific css file
		$css_api = './views/' . $api . '/css/' . $api . '.css';
		if ($api != $action && file_exists($css_api)) {
			$css_api = $css_api;
		}

		//view-specific css file
		$css_view = './views/' . $api . '/css/' . $action . '.css';
		if (file_exists($css_view)) {
			$this->css_view = $css_view;
		}

		$this->setPlugins();

	}

	//accept std object or array
	private function setPlugins() {

		//jquery
		array_push($this->plugin_js, "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js");
		//jquery_ui
		array_push($this->plugin_js, $this->lib_dir . "/js/jquery-ui.min.js");
		array_push($this->plugin_css, $this->lib_dir . "/css/jquery-ui.min.css");

		//bootstrap
		array_push($this->plugin_js, "//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js");
		array_push($this->plugin_css, "//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css");

		foreach ($this->plugins as $key => $plugin) {

			//CASE statement to call appropriate function
			switch ($plugin) {
					
				case "datatables":
					array_push($this->plugin_css, $this->lib_dir . "/css/jquery.dataTables.css");
					array_push($this->plugin_css, $this->lib_dir . "/css/nysDataTables.css");
					array_push($this->plugin_js, $this->lib_dir . "/js/jquery.dataTables.min.js");
				break;

				case "tblEditor":
					array_push($this->plugin_css, $this->lib_dir . "/css/tblEditor.css");
					array_push($this->plugin_js, $this->lib_dir . "/js/tblEditor.js");
				break;

				case "nysReports":
					array_push($this->plugin_js, $this->lib_dir . "/js/nysReports-1.1.7.js");
				break;

				case "select2":
					array_push($this->plugin_css, $this->lib_dir . "/css/select2.css");
					array_push($this->plugin_js, $this->lib_dir . "/js/select2.min.js");
				break;
					
				case "googleCharts":
					array_push($this->plugin_js, "https://www.google.com/jsapi");
				break;
			}

		}

		array_push($this->plugin_js, "./layouts/assets/js/core.js");

		array_shift($this->plugin_css);
		array_shift($this->plugin_js);

	}

	//get CSS plugin list
	public function getPluginsCSS() {

		$css = "";

		foreach ($this->plugin_css as $key => $value) {
    		$css .= '<link href="' . $value . '" rel="stylesheet" />' . PHP_EOL;
    	}

    	if ($this->css_api) {
    		$css .= '<link href="' . $this->css_api . '" rel="stylesheet" />' . PHP_EOL;
    	}

    	if ($this->css_view) {
    		$css .= '<link href="' . $this->css_view . '" rel="stylesheet" />' . PHP_EOL;
    	}

		return $css;

	}

	//get JS plugin list
	public function getPluginsJS() {
		
		$js = "";

		foreach ($this->plugin_js as $key => $value) {
	    	$js .= '<script src="' . $value . '"></script>' . PHP_EOL;
	   }

	    if ($this->js_api) {
			$js .= '<script src="' . $this->js_api . '"></script>' . PHP_EOL;
		}

    	if ($this->js_view) {
			$js .= '<script src="' . $this->js_view . '"></script>' . PHP_EOL;
		}

		return $js;

	}

}

?>
