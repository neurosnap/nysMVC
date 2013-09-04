<?php

	$page_title = $settings->company_name . " " . $settings->product_name . " - " . $api->name;

?>

<!DOCTYPE html>
<html>
    <head>
	    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	    <title><?= $settings->company_name ?> - <?= $api->name ?></title>

	        <!-- Mobile Specific Metas -->
	    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="author" content="<?= $settings->company_name ?>" />
		<meta name="description" content="<?= $settings->product_description ?>" />
		<meta name="keywords" content="" />
		<meta name="application-name" content="<?= $settings->product_name ?>" />

	    <!-- <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css' /> --> <!-- Headings -->
		<!-- <link href='https://fonts.googleapis.com/css?family=Droid+Sans:400,700' rel='stylesheet' type='text/css' /> --> <!-- Text -->

	    <?php
	    	//loop through plugins here $plugins array
	    	$plugin = new Plugins();
	    	$plugin->setPlugins($api->page_plugins);

	    	$css = $plugin->getPluginsCSS();

	    	foreach ($css as $key => $style) {
	    		echo '<link href="' . $style . '" rel="stylesheet" type="text/css" />' . PHP_EOL;
	    	}
	    ?>

		<!-- Le javascript
	    ================================================== -->

	    <!-- User defined javascript -->
	    <script type="text/javascript">
	    	var base_dir = '<?= $settings->base_dir ?>';
	    	var api = '<?= $api->name ?>';
	    	var action = '<?= $api->action ?>';
	    	var id = '<?= $api->id ?>';
	    	var image_dir = '<?= $settings->image_dir ?>';
	    </script>

	    <!-- Load plugins -->
	    <?php
	    	$js = $plugin->getPluginsJS();

	    	foreach ($js as $key => $value) {
		    	echo '<script type="text/javascript" src="' . $value . '"></script>' . PHP_EOL;
		    }
	    ?>

		<script type="text/javascript" src="<?= $api->jsloc; ?>"></script>

    </head>

	<body>

		<!-- Header -->
		<div id="header">
			<div class="navbar">
				<div class="supr-navbar-inner">
					<div class="container-fluid">
						<a class="brand" href="<?= $settings->base_dir ?>"><img src="<?= $settings->logo ?>" alt="logo" style="height:55px;" /></a>

					</div>
				</div><!-- /navbar-inner -->
			</div><!-- /navbar -->
		</div>
		<!-- End #header -->

		<div id="wrapper">
			<!--Sidebar collapse button-->
			<div class="collapseBtn leftbar" style="top: 70px;">
				<a href="#" class="tipR" title="Hide sidebar"><img src="<?= $settings->image_dir ?>/application-dock-180.png"/></a>
			</div>

			<!--Sidebar background-->
			<div id="sidebarbg"></div>
			<!--Sidebar content-->
			<div id="sidebar">

				<div class="sidenav">

					<div class="sidebar-widget" style="margin: -1px 0 0 0;">
						<h5 class="title" style="margin-bottom:0">Navigation</h5>
					</div><!-- End .sidenav-widget -->

					<div class="mainnav">
						<ul>
							<li>
								<a href="index.php"><img src="<?= $settings->image_dir ?>/home.png"/>  Dashboard</a>
							</li>
							<li>
								<a href="#"><img src="<?= $settings->image_dir ?>/reports-stack.png"/>  Demo <span class="hasDrop iconSwitch"><img src="<?= $settings->image_dir ?>/arrow-transition.png" /></span></a>
								<ul class="sub">
									<li><a href="index.php?api=dashboard&action=index"><img src="<?= $settings->image_dir ?>/report.png"/>  Demo 1</a></li>
									<li><a href="index.php?api=dashboard&action=index"><img src="<?= $settings->image_dir ?>/report.png"/>  Demo 2</a></li>
								</ul>
							</li>
							<li>
								<a href="#"><img src="<?= $settings->image_dir ?>/reports-stack.png"/>  Demo <span class="hasDrop iconSwitch"><img src="<?= $settings->image_dir ?>/arrow-transition.png" /></span></a>
								<ul class="sub">
									<li><a href="index.php?api=dashboard&action=index"><img src="<?= $settings->image_dir ?>/report.png"/>  Demo 1</a></li>
									<li><a href="index.php?api=dashboard&action=index"><img src="<?= $settings->image_dir ?>/report.png"/>  Demo 2</a></li>
								</ul>
							</li>
						</ul>
					</div>

				</div>
				<!-- End sidenav -->
			</div><!-- End #sidebar -->

			<!--Body content-->
			<div id="content" class="clearfix">
				<div class="contentwrapper"><!--Content wrapper-->
					<div class="heading">
						<h3><?php echo $page_title; ?></h3>

						<ul class="breadcrumb">
							<li>You are here:</li>
							<li>
								<a href="/index.php" class="tip" title="back to dashboard">
									<img src="<?= $settings->image_dir ?>/home.png"/>
								</a>
								<span class="divider">
									<img src="<?= $settings->image_dir ?>/resultset_next.png"/>
								</span>
							</li>
							<li class="active"><?php echo $api->name; ?></li>

						</ul>

					</div><!-- End .heading-->
					<!-- Build page from here: -->
	               <?php require($api->view); ?>

	            </div><!-- End contentwrapper -->
	        </div><!-- End #content -->

    	</div><!-- End #wrapper -->

    </body>
</html>