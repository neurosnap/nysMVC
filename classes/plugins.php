<?php

class Plugins {

	private $plugin_list;
	private $settings;
	private $css_api;
	private $css_view;
	private $js_api;
	private $js_view;
	public $plugin_css = array("");
	public $plugin_js = array("");

	//map for linking an API with its necessary plugins
	public function __construct($api) {

		require('./settings.php');
		$this->settings = $settings;
		$this->plugin_list = $settings->plugin_list;
		$this->css_api = $api->css_api;
		$this->css_view = $api->css_view;
		$this->js_api = $api->js_api;
		$this->js_view = $api->js_view;

		$this->setPlugins();

	}

	//accept std object or array
	public function setPlugins() {

		//jquery
		array_push($this->plugin_js, $this->settings->lib_dir . "/js/jquery-1.10.2.min.js");
		//jquery_ui
		array_push($this->plugin_js, $this->settings->lib_dir . "/js/jquery-ui.min.js");
		array_push($this->plugin_css, $this->settings->lib_dir . "/css/jquery-ui.min.css");

		//bootstrap
		array_push($this->plugin_js, $this->settings->lib_dir . "/js/bootstrap.min.js");
		array_push($this->plugin_css, $this->settings->lib_dir . "/css/bootstrap.min.css");
		array_push($this->plugin_css, $this->settings->lib_dir . "/css/bootstrap-responsive.min.css");

		foreach ($this->plugin_list as $key => $plugin) {

			//CASE statement to call appropriate function
			switch ($plugin) {
				//Always (for proper loading)
				case "supr":
					array_push($this->plugin_css, "./layouts/assets/css/supr_main.css");
					array_push($this->plugin_js, "./layouts/assets/js/nysus_supr.js");
				break;

				case "datatables":
					array_push($this->plugin_css, $this->settings->lib_dir . "/css/jquery.dataTables.css");
					array_push($this->plugin_css, $this->settings->lib_dir . "/css/nysDataTables.css");
					array_push($this->plugin_js, $this->settings->lib_dir . "/js/jquery.dataTables.min.js");
				break;

				case "tblEditor":
					array_push($this->plugin_css, $this->settings->lib_dir . "/css/tblEditor.css");
					array_push($this->plugin_js, $this->settings->lib_dir . "/js/tblEditor.js");
				break;

				case "nysReports":
					array_push($this->plugin_js, $this->settings->lib_dir . "/js/nysReports-1.1.7.js");
				break;

				case "select2":
					array_push($this->plugin_css, $this->settings->lib_dir . "/css/select2.css");
					array_push($this->plugin_js, $this->settings->lib_dir . "/js/select2.min.js");
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
    		$css .= '<link href="' . $value . '" rel="stylesheet" type="text/css" />' . PHP_EOL;
    	}

    	if ($this->css_api != null) {
    		$css .= '<link href="' . $this->css_api . '" rel="stylesheet" type="text/css" />' . PHP_EOL;
    	}

    	if ($this->css_view != null) {
    		$css .= '<link href="' . $this->css_view . '" rel="stylesheet" type="text/css" />' . PHP_EOL;
    	}

		return $css;

	}

	//get JS plugin list
	public function getPluginsJS() {
		
		$js = "";

		foreach ($this->plugin_js as $key => $value) {
	    	$js .= '<script type="text/javascript" src="' . $value . '"></script>' . PHP_EOL;
	    }

	    if ($this->js_api != null) {
			$js .= '<script type="text/javascript" src="' . $this->js_api . '"></script>' . PHP_EOL;
		}

    	if ($this->js_view != null) {
			$js .= '<script type="text/javascript" src="' . $this->js_view . '"></script>' . PHP_EOL;
		}

		return $js;

	}

}

?>
