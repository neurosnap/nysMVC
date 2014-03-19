nysMVC -- v1.1.0
======

Razor thin MVC framework in PHP with SQL and mySQL RDBMS driver support.

Intro
======

The purpose of this framework is to create a standard for new web apps that are
launched at Nysus Solutions.  The goal is to have a base source code that allows
us to build web applications quickly, efficiently, and effectively.

The idea behind this framework is really to organize content to make it easy to predict where 
things are being loaded in at as well as to create clean layer separation.  This allows us to create
and environment that is easy to learn, easy to manipulate, and easy to collaborate simultaneously with
other developers.

File & Folder Structure
======

nysMVC/

  *  api/ (Where all views are loaded as well as handling AJAX requests)
      *  dashboard.php (Example of an API)
  * classes/ (Where all the base classes that are used to generate the web app)
      * baseapi.php (Abstract class that all APIs will inherit)
      * loader.php (Class that redirects traffic based on the URL $_GET variables "api" and "action")
      * orm.php (Basic Object Relational Map that helps execute SQL or mySQL queries with JSON responses)
      * plugins.php (Class that defines dynamic plugins for APIs)
  * layouts/ (Where all the layouts or "shells" are located for the web app)
      * layout.php (Layout of the website, has access to $settings, $api, $cookies objects)
      * assets/ (Where all the layout assets (i.e javascript, css, images) are located for the web app)
          * js/
          * css/ 
          * images/
  * lib/ (Where all the libraries should be located)
  * views/ (Where all the views are located)
      * dashboard/ (Example of a view "app")
          * js/ (Where all the view-specific javascript files are located)
              * index.js (Example of a javascript file for dashboard "api" and index "action")
              * dashboard.js (Example of a javascript file for all of the dashboard "api")
          * css/ (Where all the view-specific css files are located)
              * index.css (Example of a stylesheet file for dashboard "api" and index "action")
              * dashboard.css (Example of a stylesheet file for all of the dashboard "api")
          * index.php (Example of a VIEW in dashboard "api" and index "action")
  * index.php (File that actually gets hit by the browser, which loads in all the helper classes, apis, and views)
  * settings.php (All global settings for the application ($settings stdClass, $cookies stdClass), very important to setup)
  * plugin_settings.php (Where the plugin settings are held, based off of the api and action values)
  * db.php (Database file containing ($db stdClass), which is used to connect to a database)

Setup
=====

When first installing the application, the three things that are needed to get started are of course are the settings, API, and views.
API is really a fusion of a Controller and a Model in a MVC pattern design.

#### Settings (nysMVC/settings.php)
This is where global variables are defined that can essentially be accessed everywhere there is a PHP file in this framework.
Go there to find plenty of settings.


#### BaseAPI (nysMVC/classes/baseapi.php)
The baseapi class is an abstract class with some built-in functionality to load the views.  All APIs and VIEWs are driven off of this class by returnView() method.

Here is an example of an API:

	class Dashboard extends BaseAPI {
		
		protected function Index() {
			$this->returnView();
		}
	
	}

When someone visits index.php?api=dashboard&action=index -- they will activate the function above, which will return a view.  The returnView() method figures out what plugins
are necessary, checks for authentication rights, and then injects the view, embedded within the layout.  Both the layout and view will inherit the BaseAPIs variables, and methods.
The view that the above API is looking for: 

  * nysMVC/views/{API}/{ACTION}.php 

as well as: 

  * nysMVC/views/{API}/js/{ACTION}.js (VIEW-specific JS file)
  * nysMVC/views/{API}/css/{ACTION}.css (VIEW-specific CSS file)
  * nysMVC/views/{API}/js/{API}.js (API-specific JS file)
  * nysMVC/views/{API}/css/{API}.css (API-specific CSS file)


#### Loader (nysMVC/classes/loader.php)
The loader class will direct traffic when someone hits nysMVC/index.php based on the $_GET variables "api" and "action" e.g. index.php?api=dashboard&action=index


#### Plugins (nysMVC/classes/plugins.php)
The plugin class creates an interface to dynamically load in JS or CSS files.


#### ORM (nysMVC/classes/orm.php)
The ORM class interfaces with 3 different PHP drivers (sqlsrv, mssql, and mysql).  It is to be used in the various API classes.  There are 4 main methods in the ORM:

  * Connect ()
      * Connects to the database
  * Close ()
      * Closes the database connection
  * Qu ($string, $json_content = true, $multiple_records = false)
      * A query that is merely downloading data
  * Mod ($string, $json_content = true)
      * A query that does not return data but UPDATEs, INSERTs, or DELETEs

Here is a quick example of how to return a list of users in JSON format:

	//create an instance of the ORM class within an API method
	$orm = new ORM();
	
	//Not necessary, but for clearity this will be called before a connection is established
	$orm->Connect();
	
	//SQL Query
	echo $orm->Qu("SELECT * FROM users");
	
	//Must close the connection before finishing
	$orm->Close();


By default, Qu() returns JSON objects, to convert that JSON ENCODED object back into a stdClass object:

	$orm = new ORM();
	
	//$json_content should be set to false or else a JSON response header will be set
	$records = $orm->Qu("SELECT * FROM users", false);
	
	$model = json_decode($records);
	
	$orm->Close();


There are more examples in the default API, dashboard:  nysMVC/api/dashboard.php