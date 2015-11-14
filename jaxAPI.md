[jax.js](http://jaxgames.googlecode.com/svn/trunk/js/libs/jax.js) is a javascript class that you can use to send small bits of data between two people on different computers.
Jax Games is a set of turn-based two player games written in HTML/Javascript using Jax.

At the moment Jax relies upon [Prototype](http://prototype.conio.net/) & Prototype-compatible [json.js](http://jaxgames.googlecode.com/svn/trunk/js/libs/json.js). Prototype is quite large, so if your site is not using Prototype, it can be an added burden. It is still early for Jax, and it may be improved in the future to work without Prototype, and use your own choice of AJAX module (such as [SACK](http://www.twilightuniverse.com/projects/sack/))

This document explains Jax's programming interface so that you can utilize the script yourself, in your own projects.


# key #
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Class.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Class.png) Class
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Instance.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Instance.png) Instance of a class
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Function.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Function.png) Function
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Object.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Object.png) Object Literal
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Array.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Array.png) Array
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/String.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/String.png) String
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Number.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Number.png) Number (any kind)
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Constant.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Constant.png) Constant, a value to be considered read only to you
  * ![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Event.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Event.png) Javascript Event Object

# 1. Jax #
![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Class.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Class.png)
Jax itself is just a single class that manages the AJAX calls to the server. It uses Prototype to provide a constructor, you can (optionally) provide the URL to Jax's response.php page, relative to the HTMl/PHP page that the user is viewing. The default value is "server/response.php" assuming that your page is on webroot, and response.php is in a folder named server, as is provided by default with Jax.

**parameters**
  * _**![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/String.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/String.png) server** : The relative URL from your HTML file to the Jax response.php page to deal with AJAX sever side_

**Example:**
```
var jax = new Jax ();                          //use the default URL (server/response.php)
var jax = new Jax ("../server/response.php");  //use a different URL to response.php
```

## 1.1 version ##
![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Constant.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Constant.png)
Version number of Jax. presented as "major.minor.revision.build.tag". Major and minor are as normal version numbers, e.g. '1.3', the revision is a security/bug release (e.g. '1.3.1'), build is the four digit build number, incremented at each new build and does not reset and finally the tag is for 'alpha', 'beta' or 'rc' status tags (always all lowercase please). Split the string by "." to extract each piece.

**Example:**
```
var jax = new Jax ();
alert (jax.version);
```

## 1.2 conn\_id ##
![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Constant.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Constant.png)
'Connection ID'. See `open` below. When you open a new person-to-person connection you're given a Connection ID that the other user needs to join the connection. Connection ID's are six letters long, 0-9, A-Z. e.g. M5CIVK

How you get the Connection ID to the other user is up to you. Jax Games puts the code on screen, and expects the user to IM/e-mail/FedEx the code to the other person. You could get the other person to query the server for new connections started and give them the join key that way, but this is up to you to decide.

## 1.3 open ##
![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Function.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Function.png)
The person hosting starts a new connection with this function.

**parameters**
  * **![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Object.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Object.png) data** : Data (as object literal) to give to the other person as soon as they join. this can be any javascript object, that can include arrays, other objects and so on. used in Jax Games to pass the player's name, and icon to the other player
  * **![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Function.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Function.png) onOpen** : A function to call once the server accepts the connection and begins waiting for the other person
  * **![http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Function.png](http://jaxgames.googlecode.com/svn/trunk/_build/resources/wiki_images/Function.png) onJoin** : A function to call once the other person has joined



## 1.4 connect ##
## 1.5 timerStart ##
## 1.6 timerStop ##
## 1.7 listenFor ##
## 1.8 sendRequest ##
## 1.9 sendToQueue ##
## 1.10 disconnect ##








