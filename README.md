nysMVC
======

Razor thin MVC framework in PHP

Intro
======

The purpose of this framework is to create a standard for new web apps that are
launched at Nysus Solutions.  The goal is to have a base source code that allows
us to build web applications quickly, efficiently, and effectively.

The idea behind this framework is really to organize content to make it easy to predict where 
things are being loaded in at as well as to create clean layer separation.  This allows us to create
and environment that is easy to learn, easy to manipulate, and easy to collaborate simultaneously with
other developers.

Folder Structure
======

nysMVC/
--> api/ (Where all views are loaded as well as handling AJAX requests)
--> classes/ (Where all the base classes that are used to generate the web app)
--> layouts/ (Where all the layouts or "shells" are located for the web app)
--> --> assets/ (Where all the layout assets (i.e javascript, css, images) are located for the web app)
--> --> --> js/
--> --> --> css/ 
--> --> --> images/
--> lib/ (Where all the libraries should be located)
--> views/ (Where all the views are located)
--> --> js/ (Where all the view-specific javascript files are located)
--> --> css/ (Where all the view-specific css files are located)

Setup
=====

api folder is used for AJAX calls and returning views
	
	class Dashboard extends BaseAPI {

		protected function Index() {

			//Loading data with a view
			//$orm = new ORM();
			//$orm->Connect();
			//$model = $orm->Qu("SELECT * FROM users");
			//$orm->Close();
			//$this->loadView($model);

			//Loading AJAX call
			//$orm = new ORM();
			//$orm->Connect();
			//$model = $orm->Qu("SELECT * FROM users WHERE id = " . $_POST['id']);
			//$orm->Close();
			//echo $model;

			//loads the view with data from model
			//function loadView($model, $fullview = true, $authenticate = false, $view_override = false, $layout_override = false)
			//----------------------------------------------------------------------------------------------
			//$model = database data, gets passed to the view as $model, typically string, object, or array
			//$authenticate = adding user authentication to the view, should be an int (i.e. 1, 2, 3, 4)
			//		Authenticate uses $_SESSION['operator_ID'] and $_SESSION['permission_level']
			//		the check is if ($authenticate >= $_SESSION['permission_level'])
			//$view_override = expecting string containing filename of view that should be used instead of 
			//		default action
			//$layout_override = expecting string containing file of layout that should be used instead of 
			//		default layout, layout must contain:  require($api->view);  in order to load the view content properly

		}

	}

views folder is used for displaying content