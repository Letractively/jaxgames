// Class: Dump
// Author: Shuns (www.netgrow.com.au/files)

/* Updated by Kroc Camen (http://kroc.deviantart.com)
+ _lots_ of code cleaning
+ ignore Prototype functions
+ window height/width arguments
+ uses a CSS block instead of inline CSS (removed the huge _dumpStyles function)
+ strings are braced by speech marks to make numbers stored as a string / nullstrings obvious
+ no longer polutes the global namespace with outside functions. all functions are internal
+ functions are shown in <pre> blocks with horizontal scrollbar if needed
+ html in functions does not break. this can be massively improved (now uses Prototype if present to encode into HTML)
+ IE/Safari/Opera support is broken, will work on this

If using this script in Jax Games, cd to _build in the terminal and execute these commands to compress this script
  java -jar ./libs/custom_rhino.jar -opt -1 -c ../js/libs/dump_src/js > ../js/libs/dump.js
  java -jar ./libs/custom_rhino.jar ./libs/packer.js ../js/libs/dump.js ../js/libs/dump.js
*/
var dump = function(o_var, b_showtypes, n_width, n_height) {
	if (b_showtypes == null) {b_showtypes = false;}  //default: hide the variable types
	if (!n_width)  {n_width  = 760;}
	if (!n_height) {n_height = 500;}

	var html    = '',
	    title   = "Dump",
	    browser = identifyBrowser (),
	    leftPos = screen.width  ? (screen.width  - n_width)  / 2 : 0,
	    topPos  = screen.height ? (screen.height - n_height) / 2 : 0,
	    //list of Prototype functions to ignore. there may be a way to generate this automatically
	    proto   = (!Prototype) ? "" : /each|eachSlice|all|any|collect|detect|findAll|grep|include|inGroupsOf|inject|invoke|max|min|partition|pluck|reject|sortBy|toArray|zip|inspect|find|select|member|entries|_reverse|clear|first|last|compact|flatten|without|reduce|uniq|clone|size/,
	    //the javascript in the popup to open/close the blocks when you click them
	    script  = 'function tRow(s){t=s.parentNode.lastChild;tTarget(t,tSource(s));}function tTable(s){var switchToState=tSource(s);var table=s.parentNode.parentNode;for (var i=1;i<table.childNodes.length;i++){t=table.childNodes[i];if(t.style){tTarget(t,switchToState);}}}function tSource(s){if(s.style.fontStyle=="italic"||s.style.fontStyle==null){s.style.fontStyle="normal";s.title="click to collapse";return "open";}else{s.style.fontStyle="italic";s.title="click to expand";return "closed";}}function tTarget(t,switchToState){if(switchToState=="open"){t.style.display="";}else{t.style.display="none";}}',
	    //the CSS in the popup
	    css     = 'body,table,th {font-size:xx-small;font-family:verdana,arial,helvetica,sans-serif;} table {cell-spacing:2px;} th {text-align:left;color:white;padding:5px;vertical-align:top;cursor:hand;cursor:pointer;} td {vertical-align:top;padding:3px;} td.key {cursor:hand;cursor:pointer;} td.value {background-color:#fff;} pre {overflow: auto;} table.object {background-color:#00c;} th.object {background-color:#44c;} td.object.key {background-color:#cdf;} table.array {background-color:#060;} th.array {background-color:#090;} td.array.key {background-color:#cfc;} table.function {background-color:#a40;} th.function {background-color:#c60;} td.function.key {background-color:#fff;} table.arguments {background-color:#ddd;cell-spacing:3;} td.arguments.key {background-color:#eee;color:#000;} table.regexp {background-color:#C00;cell-spacing:3;} th.regexp {background-color:#F00;} td.regexp.key {background-color:#FF5757;color:#000;} table.date {background-color:#639;cell-spacing:3;} th.date {background-color:#96C;} td.date.key {background-color:#B266FF;color:#000;} table.domelement {background-color:#FC3;cell-spacing:3;} th.domelement {background-color:#FD6;} table.domelement td.key {background-color:#FFF2CC;color:#000;}'
	;
	//if the variable being dumpped is not an array or object, then display it alone, else recurse into the variable
	html += (/string|number|undefined|boolean/.test(typeof(o_var)) || o_var == null) ? o_var : recurse(o_var);
	//open the popup window
	winName = window.open ('', "WinDump", "height="+n_height+",width="+n_width+",top="+topPos+",left="+leftPos+",scrollbars=yes,menubar=no,status=no,resizable=yes");
	if (browser.indexOf('ie') != -1 || browser == 'opera' || browser == 'ie5mac' || browser == 'safari') {
		winName.document.write ('<html><head><title> '+title+' </title><script type="text/javascript">'+script+'</script><style type="text/css">'+css+'<style/><head>');
		winName.document.write ('<body>'+html+'</body></html>');
	} else {
		winName.document.body.innerHTML = html;
		winName.document.title = title;
		var ffs = winName.document.createElement ('script');
		ffs.setAttribute ('type', 'text/javascript');
		ffs.appendChild (document.createTextNode(script));
		winName.document.getElementsByTagName ('head')[0].appendChild (ffs);
		ffs = winName.document.createElement ('style');
		ffs.setAttribute ('type', 'text/css');
		ffs.appendChild (document.createTextNode(css));
		winName.document.getElementsByTagName ('head')[0].appendChild (ffs);
	}
	winName.focus ();

	//=== recurse : loop through a variable and display its contents ===
	function recurse(o) {
		var j    = 0,
		    t    = typeof o,
		    type = getType (o),
		    c    = ' class="'+getCssType(type),
		    r    = '<table'+c+'">',
		    th   = c+'" colspan="2" onClick="tTable(this);" title="click to collapse"',
		    td   = ' onClick="tRow(this);" title="click to collapse"',
		    tdk  = c+' key" '+td,
		    tdv  = c+' value" '
		;
		switch (type) {
			case 'regexp':
				r += '<tr><th'+th+'>'+t+'</th></tr><tr><td colspan="2"'+tdv+'><table><tr><td'+tdk+'><i>RegExp: </i></td><td'+tdv+'>'+o+'</td></tr></table>';
				j++;
				break;
			case 'date':
				r += '<tr><th'+th+'>'+t+'</th></tr><tr><td colspan="2"'+tdv+'><table><tr><td'+tdk+'><i>Date: </i></td><td'+tdv+'>'+o+'</td></tr></table>';
				j++;
				break;
			case 'function':
				var a    = o.toString ().match (/^.*function.*?\((.*?)\)/im),
				    args = (a == null || typeof a[1] == 'undefined' || a[1] == '') ? 'none' : a[1]
				;
				r += '<tr><th'+th+'>'+t+'</th></tr><tr><td colspan="2"'+tdv+'><table><tr><td class="arguments key"><i>Arguments: </i></td><td'+tdv+'>'+args+'</td></tr><tr><td class="arguments key"><i>Function: </i></td><td'+tdv+'><pre>'+fixHTML(o.toString())+'</pre></td></tr></table>';
				j++;
				break;
			case 'domelement':
				r += '<tr><th'+th+'>'+t+'</th></tr>'+
				     '<tr><td'+tdk+'><i>Node Name: </i></td><td'+tdv+'>'+o.nodeName.toLowerCase()+'</td></tr>'+
				     '<tr><td'+tdk+'><i>Node Type: </i></td><td'+tdv+'>'+o.nodeType+'</td></tr>'+
				     '<tr><td'+tdk+'><i>Node Value: </i></td><td'+tdv+'>'+o.nodeValue+'</td></tr>'+
				     '<tr><td'+tdk+'><i>innerHTML: </i></td><td'+tdv+'>'+o.innerHTML+'</td></tr>'
				;
				j++;
				break;
		}
		if (/object|array/.test(type)) {
			for (var i in o) {
				var t = getType(o[i]);
				if (j < 1) {
					r += '<tr><th'+th+'>'+type+'</th></tr>';
					j++;
				}
				if (typeof o[i] == 'object' && o[i] != null) { 
					r += '<tr><td'+tdk+'>'+i+(b_showtypes?' ['+t+']':'')+'</td><td'+tdv+'>'+recurse(o[i])+'</td></tr>';	
				} else if (typeof o[i] == 'function') {
					//ignore the Prototype functions
					if (!proto || (proto && !proto.test(i))) {
						r += '<tr><td'+tdk+'>'+i+(b_showtypes?' ['+t+']':'')+'</td><td'+tdv+'>'+recurse(o[i])+'</td></tr>';
					}
				} else {
					r += '<tr><td'+tdk+'>'+i+(b_showtypes?' ['+t+']':'')+'</td><td'+tdv+'>'+(typeof o[i]=="string"?'"'+fixHTML(o[i])+'"':o[i])+'</td></tr>';
				}
			}
		}
		if (j == 0) {r += '<tr><th'+th+'>'+type+' [empty]</th></tr>';}
		return r+'</table>';

		//=== getCssType : some types have the same css classname ===
		function getCssType (s_type) {
			return (/string|number|boolean|undefined|object/.test(s_type)) ? "object" : s_type;
		}
		
		//=== fixHTML : encode strings to prevent html in strings from being rendered on screen ===
		function fixHTML (s_text) {
		        return (!proto) ? s_text.replace(/</g, "&lt;") : s_text.escapeHTML();
		}
		
		//=== getType : return a detailed variable type ===
		function getType (obj) {
			var t = typeof(obj);
			if (t == 'function') {
				var f = obj.toString();
				if ( ( /^\/.*\/[gi]??[gi]??$/ ).test(f)) {
					return 'regexp';
				} else if ((/^\[object.*\]$/i ).test(f)) {
					t = 'object';
				}
			}
			if (t != 'object') {return t;}
			switch (obj) {
				case null:         return 'null';
				case window:       return 'window';
				case document:     return document;
				case window.event: return 'event';
			}
			if (window.event && (event.type == obj.type)) {return 'event';}
			var c = obj.constructor;
			if (c != null) {
				switch(c) {
					case Array:  t = 'array'; break;
					case Date:   return 'date';
					case RegExp: return 'regexp';
					case Object: t = 'object'; break;
					case ReferenceError:
						return 'error';
					default:
						var sc = c.toString(),
						    m  = sc.match(/\s*function (.*)\(/);
						if(m != null) {return 'object';}
				}
			}
			var nt = obj.nodeType;
			if (nt != null) {
				switch(nt) {
					case 1:
						if(obj.item == null) {return 'domelement';}
						break;
					case 3:
						return 'string';
				}
			}
			if (obj.toString != null) {
				var ex = obj.toString();
				var am = ex.match(/^\[object (.*)\]$/i);
				if(am != null) {
					var am = am[1];
					switch(am.toLowerCase()) {
						case 'event':
							return 'event';
						case 'nodelist':
						case 'htmlcollection':
						case 'elementarray':
							return 'array';
						case 'htmldocument':
							return 'htmldocument';
					}
				}
			}
			return t;
		};
	}

	//=== identifyBrowser : detect which web browser is being used ===
	function identifyBrowser () {
		var agent   = navigator.userAgent.toLowerCase();
		var browser = agent.replace(/.*ms(ie[\/ ][^ $]+).*/, '$1').replace(/ /, '');
		
		//instead of lots of ifs, this packs into a much smaller space
		return typeof window.opera != 'undefined'
			? 'opera'
			: (typeof document.all != 'undefined'
				? (typeof document.getElementById != 'undefined'
					? (typeof document.uniqueID != 'undefined'
						? (browser.indexOf('5.5') != -1
							? browser.replace(/(.*5\.5).*/, '$1')
							: browser.replace(/(.*)\..*/, '$1')
						) : 'ie5mac'
					) : false
				) : (typeof document.getElementById != 'undefined'
					? (navigator.vendor.indexOf('Apple Computer, Inc.') != -1
						? 'safari'
						: (agent.indexOf('gecko') != -1 ? 'mozilla' : false)
					) : false
				)
			)
		;
	}
};