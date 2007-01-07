// Class: Dump
// Author: Shuns (www.netgrow.com.au/files)
// Last Updated: 10/10/06
// Version: 1.1

// Updated by Kroc Camen:
// * _lots_ of code cleaning
// * ignore Prototype functions

var dump = function(o_var, b_showtypes, b_prototype, n_width, n_height) {
        if (typeof b_showtypes == "undefined") {b_showtypes = false;}  //default: hide the variable types
        if (typeof b_prototype == "undefined") {b_prototype = false;}  //default: do not hide Prototype functions
        if (!n_width)  {n_width  = 760;}
        if (!n_height) {n_height = 500;}
        
        var html    = "",
            title   = "Dump",
            browser = _dumpIdentifyBrowser (),
            leftPos = screen.width  ? (screen.width  - n_width)  / 2 : 0,
            topPos  = screen.height ? (screen.height - n_height) / 2 : 0,
            //list of Prototype functions to ignore. there may be a way to generate this automatically
            protos  = /each|eachSlice|all|any|collect|detect|findAll|grep|include|inGroupsOf|inject|invoke|max|min|partition|pluck|reject|sortBy|toArray|zip|inspect|find|select|member|entries|_reverse|clear|first|last|compact|flatten|without|reduce|uniq|clone/,
            //the javascript in the popup to open/close the blocks when you click them
            script  = 'function tRow(s) {t=s.parentNode.lastChild;tTarget(t,tSource(s));}function tTable(s){var switchToState=tSource(s);var table=s.parentNode.parentNode;for (var i=1;i<table.childNodes.length;i++){t=table.childNodes[i];if(t.style){tTarget(t,switchToState);}}}function tSource(s){if(s.style.fontStyle=="italic"||s.style.fontStyle==null){s.style.fontStyle="normal";s.title="click to collapse";return "open";}else{s.style.fontStyle="italic";s.title="click to expand";return "closed";}}function tTarget(t,switchToState){if(switchToState=="open"){t.style.display="";}else{t.style.display="none";}}',
            //the CSS in the popup
            css     = 'body,table,th {font-size:xx-small;font-family:verdana,arial,helvetica,sans-serif;}\n'+
                      'table {cell-spacing:2px;}\n'+
                      'th {text-align:left;color:white;padding:5px;vertical-align:top;cursor:hand;cursor:pointer;}\n'+
                      'td {vertical-align:top;padding:3px;}\n'+
                      'table.object {background-color:#0000cc;} th.object {background-color:#4444cc;}\n'+
                      '.array {}\n'+
                      '.function {}\n'+
                      '.arguments {}\n'+
                      '.regexp {}\n'+
                      '.date {}\n'+
                      '.domelement {}\n'
        ;
        //if the variable being dumpped is not an array or object, then display it alone, else recurse into the variable
        html += (/string|number|undefined|boolean/.test(typeof(o_var)) || o_var == null) ? o_var : recurse(o_var);
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
        
        /* PRIVATE > recurse
           =============================================================================================================== */
        function recurse(o) {
                var j    = 0,
                    r    = "",
                    t    = typeof o,
                    type = _dumpType (o)
                ;
	        switch (type) {
	                case 'regexp':
	                        r += '<table class="'+type+'"><tr><th colspan="2"' + _dumpStyles(t,'th') + '>' + t + '</th></tr>';
	                        r += '<tr><td colspan="2"' + _dumpStyles(t,'td-value') + '><table' + _dumpStyles('arguments','table') + '><tr><td' + _dumpStyles('arguments','td-key') + '><i>RegExp: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';
	                        j++;
	                        break;
	                case 'date':
	                        r += '<table class="'+type+'"><tr><th colspan="2"' + _dumpStyles(t,'th') + '>' + t + '</th></tr>';
	                        r += '<tr><td colspan="2"' + _dumpStyles(t,'td-value') + '><table' + _dumpStyles('arguments','table') + '><tr><td' + _dumpStyles('arguments','td-key') + '><i>Date: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';
	                        j++;
	                        break;
	                case 'function':
	                        var a = o.toString ().match (/^.*function.*?\((.*?)\)/im);
	                        var args = (a == null || typeof a[1] == 'undefined' || a[1] == '') ? 'none' : a[1];
	                        r += '<table class="'+t+'"><tr><th colspan="2"' + _dumpStyles(t,'th') + '>' + t + '</th></tr>';
	                        r += '<tr><td colspan="2"' + _dumpStyles(t,'td-value') + '><table' + _dumpStyles('arguments','table') + '><tr><td' + _dumpStyles('arguments','td-key') + '><i>Arguments: </i></td><td' + _dumpStyles(type,'td-value') + '>' + args + '</td></tr><tr><td' + _dumpStyles('arguments','td-key') + '><i>Function: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';
	                        j++;
	                        break;
	                case 'domelement':
	                        r += '<table class="'+type+'"><tr><th colspan="2"' + _dumpStyles(t,'th') + '>' + t + '</th></tr>';
	                        r += '<tr><td' + _dumpStyles(t,'td-key') + '><i>Node Name: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o.nodeName.toLowerCase() + '</td></tr>';
		                r += '<tr><td' + _dumpStyles(t,'td-key') + '><i>Node Type: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o.nodeType + '</td></tr>';
		                r += '<tr><td' + _dumpStyles(t,'td-key') + '><i>Node Value: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o.nodeValue + '</td></tr>';
		                r += '<tr><td' + _dumpStyles(t,'td-key') + '><i>innerHTML: </i></td><td' + _dumpStyles(type,'td-value') + '>' + o.innerHTML + '</td></tr>';
	                        j++;
	                        break;
	        }
	        if (/object|array/.test(type)) {
                        for (var i in o) {
	                        var t = _dumpType(o[i]);
	                        if (j < 1) {
	                                r += '<table class="'+t+'"><tr><th colspan="2"' + _dumpStyles(type,'th') + '>' + type + '</th></tr>';
		                        j++;
	                        }
	                        if (typeof o[i] == 'object' && o[i] != null) { 
		                        r += '<tr><td' + _dumpStyles(type,'td-key') + '>' + i + (b_showtypes ? ' [' + t + ']' : '') + '</td><td' + _dumpStyles(type,'td-value') + '>' + recurse(o[i]) + '</td></tr>';	
	                        } else if (typeof o[i] == 'function') {
	                                //ignore the Prototype functions
	                                if (!protos.test(i)) {
		                                r += '<tr><td' + _dumpStyles(type ,'td-key') + '>' + i + (b_showtypes ? ' [' + t + ']' : '') + '</td><td' + _dumpStyles(type,'td-value') + '>' + recurse(o[i]) + '</td></tr>';
		                        }
		                } else {
		                        r += '<tr><td' + _dumpStyles(type,'td-key') + '>' + i + (b_showtypes ? ' [' + t + ']' : '') + '</td><td' + _dumpStyles(type,'td-value') + '>' + o[i] + '</td></tr>';  
	                        }
	                }
	        }
	        if (j == 0) {
	                r += '<table class="'+type+'"><tr><th colspan="2"' + _dumpStyles(type,'th') + '>' + type + ' [empty]</th></tr>'; 	
	        }
	        r += '</table>';
	        return r;
        };	
};
_dumpStyles = function(type, use) {
  var r = '';
  var thScript = 'onClick="tTable(this);" title="click to collapse"';
  var tdScript = 'onClick="tRow(this);" title="click to collapse"';
  switch (type) {
	case 'string':
	case 'number':
	case 'boolean':
	case 'undefined':
	case 'object':
	  r = ' class="object"'
	  switch (use) {
		case 'th':
		  r += thScript;
		  break;
		case 'td-key':
		  r += ' style="background-color:#ccddff;cursor:hand;cursor:pointer;"' + tdScript;
		  break;
		case 'td-value':
		  r += ' style="background-color:#fff;"';
		  break;
	  }
	  break;
	case 'array':
	  switch (use) {
		case 'table':  
		  r = ' style="background-color:#006600;"';
		  break;
		case 'th':
		  r = ' style="background-color:#009900;"' + thScript;
		  break;
		case 'td-key':
		  r = ' style="background-color:#ccffcc;cursor:hand;cursor:pointer;"' + tdScript;
		  break;
		case 'td-value':
		  r = ' style="background-color:#fff;"';
		  break;
	  }	
	  break;
	case 'function':
	  switch (use) {
		case 'table':  
		  r = ' style="background-color:#aa4400;"';
		  break;
		case 'th':
		  r = ' style="background-color:#cc6600;"' + thScript;
		  break;
		case 'td-key':
		  r = ' style="background-color:#fff;cursor:hand;cursor:pointer;"' + tdScript;
		  break;
		case 'td-value':
		  r = ' style="background-color:#fff;"';
		  break;
	  }	
	  break;
	case 'arguments':
	  switch (use) {
		case 'table':  
		  r = ' style="background-color:#dddddd;cell-spacing:3;"';
		  break;
		case 'td-key':
		  r = ' style="background-color:#eeeeee;color:#000000;cursor:hand;cursor:pointer;"' + tdScript;
		  break;	  
	  }	
	  break;
	case 'regexp':
	  switch (use) {
		case 'table':  
		  r = ' style="background-color:#CC0000;cell-spacing:3;"';
		  break;
		case 'th':
		  r = ' style="background-color:#FF0000;"' + thScript;
		  break;
		case 'td-key':
		  r = ' style="background-color:#FF5757;color:#000000;cursor:hand;cursor:pointer;"' + tdScript;
		  break;
		case 'td-value':
		  r = ' style="background-color:#fff;"';
		  break;		  
	  }	
	  break;
	case 'date':
	  switch (use) {
		case 'table':  
		  r = ' style="background-color:#663399;cell-spacing:3;"';
		  break;
		case 'th':
		  r = ' style="background-color:#9966CC;"' + thScript;
		  break;
		case 'td-key':
		  r = ' style="background-color:#B266FF;color:#000000;cursor:hand;cursor:pointer;"' + tdScript;
		  break;
		case 'td-value':
		  r = ' style="background-color:#fff;"';
		  break;		  
	  }	
	  break;
	case 'domelement':
	  switch (use) {
		case 'table':  
		  r = ' style="background-color:#FFCC33;cell-spacing:3;"';
		  break;
		case 'th':
		  r = ' style="background-color:#FFD966;"' + thScript;
		  break;
		case 'td-key':
		  r = ' style="background-color:#FFF2CC;color:#000000;cursor:hand;cursor:pointer;"' + tdScript;
		  break;
		case 'td-value':
		  r = ' style="background-color:#fff;"';
		  break;		  
	  }	
	  break;	  
  }
  return r;
};
_dumpIdentifyBrowser = function() {
  var agent = navigator.userAgent.toLowerCase();
  if (typeof window.opera != 'undefined') {
    return 'opera';
  } else if (typeof document.all != 'undefined') {
    if (typeof document.getElementById != 'undefined') {
      var browser = agent.replace(/.*ms(ie[\/ ][^ $]+).*/, '$1').replace(/ /, '');
      if (typeof document.uniqueID != 'undefined') {
        if (browser.indexOf('5.5') != -1) {
          return browser.replace(/(.*5\.5).*/, '$1');
        } else {
          return browser.replace(/(.*)\..*/, '$1');
        }
      } else {
        return 'ie5mac';
      }
    }
  } else if (typeof document.getElementById != 'undefined') {
    if (navigator.vendor.indexOf('Apple Computer, Inc.') != -1) {
      return 'safari';
    } else if (agent.indexOf('gecko') != -1) {
      return 'mozilla';
    }
  }
  return false;
};
_dumpType = function (obj) {
  var t = typeof(obj);
  if (t == 'function') {
    var f = obj.toString();
    if ( ( /^\/.*\/[gi]??[gi]??$/ ).test(f)) {
      return 'regexp';
    } else if ((/^\[object.*\]$/i ).test(f)) {
      t = 'object'
    }
  }
  if (t != 'object') {
    return t;
  }
  switch (obj) {
    case null:
      return 'null';
    case window:
      return 'window';
	case document:
	  return document;
    case window.event:
      return 'event';
  }
  if (window.event && (event.type == obj.type)) {
    return 'event';
  }
  var c = obj.constructor;
  if (c != null) {
    switch(c) {
      case Array:
        t = 'array';
        break;
      case Date:
        return 'date';
      case RegExp:
        return 'regexp';
      case Object:
        t = 'object';	
      break;
      case ReferenceError:
        return 'error';
      default:
        var sc = c.toString();
        var m = sc.match(/\s*function (.*)\(/);
        if(m != null) {
          return 'object';
        }
    }
  }
  var nt = obj.nodeType;
  if (nt != null) {
    switch(nt) {
      case 1:
        if(obj.item == null) {
          return 'domelement';
        }
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