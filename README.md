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
* api/ (Where all views are loaded as well as handling AJAX requests)
  * classes/ (Where all the base classes that are used to generate the web app)
  * layouts/ (Where all the layouts or "shells" are located for the web app)
    * assets/ (Where all the layout assets (i.e javascript, css, images) are located for the web app)
       * js/
       * css/ 
       * images/
  * lib/ (Where all the libraries should be located)
  * views/ (Where all the views are located)
    * js/ (Where all the view-specific javascript files are located)
    * css/ (Where all the view-specific css files are located)

Setup
=====

