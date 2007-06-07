/* =======================================================================================================================
   js/_chat.js - manage the chatbox aside the game
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   + js/CONFIG.js
   + js/boot.js [ + jax/jax.js + js/_shared.js » js/_chat.js - js/_global.js ]
   - games/?/game.js (game dependent)
*/

/* =======================================================================================================================
   OBJECT shared.chat
   ======================================================================================================================= */
shared.chat = {
        //--- private storage -----------------------------------------------------------------------------------------------
        _ : {
                //list of emotes. the file name matches the image file name (sans extension) in 'games/-/img/emotes/'
                //see: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Guide:Regular_Expressions for regex rules
                emotes : [
                        //note: add a "hide: true" pair to an emote object to hide the emote from the pull up list
                        //TODO: can't work out the regex to distinguish ":)" from ">:)"
                        {file: "58", symbol: ">:[", regex: /&gt;:[\[\(]/g},  // miffed   >:[ or >:(
                        {file: "60", symbol: ">:]", regex: /&gt;:[\]\)]/g},  // evilgrin >:] or >:)
                        {file: "01", symbol: ":)",  regex: /:\)/g},          // happy    :)
                        {file: "05", symbol: ";)",  regex: /;\)/g},          // wink     ;)
                        {file: "08", symbol: ":(",  regex: /:\(/g},          // sad      :(
                        {file: "12", symbol: "XD",  regex: /XD/g},           // XD (no lowercase)
                        {file: "15", symbol: ":P",  regex: /:p/gi},          // tongue   :P
                        {file: "19", symbol: ":s",  regex: /:s/gi},          // worried  :s
                        {file: "19", symbol: ":/",  regex: /:[\\\/]/g},      // sigh     :/ or :\
                        {file: "25", symbol: ":X",  regex: /:x|x_x/gi},      // dead     :X or X_x
                        {file: "28", symbol: "o.o", regex: /o[\._]+o/gi},    // amazed   o.o, O_o
                        {file: "29", symbol: ":D",  regex: /:D/g},           // grin     :D (no lowercase)
                        {file: "30", symbol: ":?",  regex: /:\?/g},          // confused :?
                        {file: "38", symbol: "B)",  regex: /B\)/g},          // cool     B)
                        {file: "45", symbol: ":$",  regex: /:\$/g},          // kiss     :$
                        {file: "55", symbol: "D:",  regex: /D:/g},           // oh noes  D: (no lowercase)
                        {file: "62", symbol: ":o",  regex: /:o/gi},          // shocked  :O
                        {file: "63", symbol: ";P",  regex: /;p/gi}           // sarcasm  ;P
                ],
                
                //snippets of HTML used by the chat box
                templates : {
                        //template for chat messages
                        chat_msg : new Template (
                                '<div id="chat-#{time_id}" class="chat-#{html_class}" style="display:none;"><p><span '+
                                'class="timestamp">#{time_stamp}</span> <img src="#{icon}" width="16" height="16" alt='+
                                '"User icon" /> <strong>#{name}</strong></p><blockquote><p>#{text}</p></blockquote></div>'
                        ),
                        //template for emoticons
                        chat_emote : new Template (
                                '<img src="../-/img/emotes/#{file}.png" width="16" height="16" alt="#{symbol}" title="#{symbol}" />'
                        )
                }, 
                
                //event handlers - see `shared.chat.initialise` where these get bound
                events : {
                        //when you click on the "<chat here>" label, pass focus to the text box below
                        chatLabelClick    : function () {$("shared-chat-input").focus ();},
                        //when the text box receives focus, hide the "<chat here>" label
                        chatInputFocus    : function () {$("shared-chat-label").hide ();},
                        //when keys are pressed in the text box
                        chatInputKeypress : function (e_event) {
                                //if they press Return
                                if(e_event.keyCode == Event.KEY_RETURN) {
                                        var e   = $("shared-chat-input"),
                                            msg = e.value.strip ()  //remove leading and trailing whitespace)
                                        ;
                                        e.value = "";  //clear the text box
                                        //send the message (ignore if the message was just whitespace)
                                        if (msg.length > 0) { shared.chat.sendMessage (msg); }
                                }
                        },
                        //when focus is lost in the text box, show the "<chat here>" label if appropriate
                        chatInputBlur : function (e_event) {
                                //`this` is `$("shared-chat-input")`.
                                //if the text box contains only whitespace, clear it and replace the "<chat here>" label
                                if (this.value.blank ()) { this.clear (); $("shared-chat-label").show (); }
                        },
                        //when you click on the emote in the bottom right, open/close the emote panel
                        chatEmoteClick : function () {
                                shared.chat.insertEmoticonText (this.alt);
                                shared.chat.toggleEmoteList ();
                        }
                }
        },
        
        /* > initialise : prepare the chat box for use
           =============================================================================================================== */
        initialise : function () {
                var e_chat_input  = $("shared-chat-input"),   //the textarea you type your message in
                    e_chat_label  = $("shared-chat-label"),   //the "<chat here>" message
                    e_chat_emotes = $("shared-chat-emotes"),  //the emote list holder
                    html          = ""                        //used to put together the emote list
                ;
                //respond to chat messages from the other player
                jax.listenFor ("game_chat_message", function(o_response){
                        //display the chat message received
                        this.addMessage (playerThem.name, playerThem.icon, o_response.data.msg);
                }.bind(this));
                
                //create the emote list
                this._.emotes.each (function(o_emote){
                        //emotes can be hidden so that they do not show in the panel, but still function when typed
                        if (!o_emote.hide) {
                                //add the emoticon image to the collection
                                html += this._.templates.chat_emote.evaluate (o_emote);
                        }
                }.bind(this));
                //put the images into the panel
                e_chat_emotes.update (html);
                
                //add an onclick event to each of the emotes in the panel
                $A(e_chat_emotes.getElementsByTagName("img")).each (function(o_element){
                        Event.observe (o_element, "click", this._.events.chatEmoteClick);
                }.bind(this));
                
                //function the emote button to open the emote panel
                Event.observe ("shared-chat-emote", "click", this.toggleEmoteList);
                
                //when the user clicks on the textbox, hide the label
                Event.observe (e_chat_input, "focus", this._.events.chatInputFocus);
                //when focus on the textbox is lost, put the label back if the textbox is empty
                Event.observe (e_chat_input, "blur", this._.events.chatInputBlur);
                //trap keypresses to the input field
                Event.observe (e_chat_input, "keypress", this._.events.chatInputKeypress);
                
                //if the user clicks on the label itself, pass focus to the textbox
                Event.observe (e_chat_label, "click", this._.events.chatLabelClick);
        },
        
        /* > show : make the chat section visible
           =============================================================================================================== */
        show : function () {
                var e_chat_input  = $("shared-chat-input"),  //the textarea you type your message in
                    e_chat_label  = $("shared-chat-label")   //the "<chat here>" message
                ;
                //make the chat section visible
                $("shared-chat").show ();
                
                //clear the chatbox textarea as Firefox will remember the field value on refresh
                if (e_chat_input.value.blank ()) {
                        e_chat_input.clear ();
                        e_chat_label.show ();
                }
        },
        
        /* > hide : make the chat section invisible
           =============================================================================================================== */
        hide : function () {
                //hide the container
                $("shared-chat").hide ();
        },
        
        /* > insertEmoticonText : add an emote symbol to the chat text input
           =============================================================================================================== */
        insertEmoticonText : function (s_emoticon) {
                var e = $("shared-chat-input");
                e.value += " " + s_emoticon + " ";
                e.focus ();
        },
        
        /* > sendMessage : send a chat message to the server for the other player
           ===============================================================================================================
           params * s_msg : text to send to the other player's chatbox
           =============================================================================================================== */
        sendMessage : function (s_msg) {
                //echo locally
                this.addMessage (playerMe.name, playerMe.icon, s_msg);
                
                //send the message to the server
                jax.sendToQueue ("game_chat_message", {msg:s_msg}, function(o_response){
                        var e = $("shared-chat-input");
                        e.value = "";
                        e.focus ();
                });
        },
        
        /* > addMessage : display a chat message on screen
           ===============================================================================================================
           params * s_name : name of person to display
                    s_icon : icon to display, sans extension
                    s_msg  : text to display, will be parsed for emotes automatically
           =============================================================================================================== */
        addMessage : function (s_name, s_icon, s_msg) {
                var e        = $("shared-chat-history"),
                    now      = new Date (),
                    hours    = now.getHours (),
                    minutes  = now.getMinutes (),
                    chat_msg = {
                            time_stamp : (hours > 12 ? hours - 12 : hours) + ":" + (minutes < 10 ? "0" : "") + minutes,
                            time_id    : now.getTime (),
                            html_class : (s_name == playerMe.name ? "me" : "them"),
                            icon       : s_icon,
                            name       : s_name,
                            text       : s_msg.escapeHTML ()
                    }
                ;
                //parse the message for markup, emoticons and urls
                chat_msg.text = this.applyFormatting (chat_msg.text);
                
                //add the message to the chat history. `Insertion.Bottom` is used (instead of `.innerHTML+=`) so that 
                //multiple messages coming in at the same time don't overwrite each other
                new Insertion.Bottom (e, this._.templates.chat_msg.evaluate(chat_msg));
                //animate the message appearing (and scroll down to meet it)
                new Effect.SlideDown ("chat-"+chat_msg.time_id, {duration: 0.3, afterUpdate: function(){
                        //scroll to the bottom of the chat history
                        e.scrollTop = e.scrollHeight;
                }, afterFinish: function(){
                        //and again on the last frame
                        e.scrollTop = e.scrollHeight;
                }});
        },
        
        /* > applyFormatting : parse the text for markup to be replaced with HTML (URLs, emoticons &c.)
           ===============================================================================================================
           params * s_msg  : text to parse for formatting
           return * string : same text, but formatted with HTML
           =============================================================================================================== */
        applyFormatting : function (s_msg) {
                //first of all, find any URLs and turn into HTML hyperlinks
                s_msg = this.linkURLs (s_msg);
                
                //this private function runs a given function on the messages, sans HTML tags
                //this is needed to prevent letters in a hyperlink turning into an emoticon &c.
                var _applySansTags = function (s_text, f_apply) {
                        var regex = /<[^<>]+>/gi,        //regex to find only HTML tags
                            tags  = s_text.match (regex)  //find all HTML tags and remember them for later
                        ;
                        if (tags) {
                                //temporarily replace all HTML tags with "<^>" so that the emoticon replace will not
                                //accidently break the ":/" in "http://" &c. just don't create an "<^>" emoticon!
                                s_text = s_text.replace (regex, "<^>");
                        }
                        //run the provided function on the message, now without legible HTML tags
                        s_text = f_apply (s_text);
                        //put the html tags back (if there were any)
                        if (tags) {
                                tags.each (function(s_html){ s_text = s_text.replace ("<^>", s_html); });
                        }
                        return s_text;
                }.bind(this);
                
                s_msg = _applySansTags (s_msg, this.applyEmoticons.bind(this));  //parse for emoticons
                s_msg = _applySansTags (s_msg, this.applyMarkup.bind(this));     //parse for markup
                
                return s_msg;
        },
        
        /* > linkURLs : change raw URLs in a message into html hyperlinks
           ===============================================================================================================
           params * s_msg  : text to parse for URLs
           return * string : same text, but with URLs replaced with HTML hyperlinks
           =============================================================================================================== */
        linkURLs : function (s_msg) {
                //regex to find anything shaped like a URL in the text:
                //refer to http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:RegExp
                var regex = new RegExp (
                        "(?:http(s)?:\\/\\/)?"+  //.................................  = http/https (remember "s" in $1)
                        "("+  //....................................................  = remember url in $2 ("www.test.com")
                           "(?:www.|([0-9A-Z_!~\\*'\\(\\)-]+\\.))?"+  //...................  = subdomain. e.g. "www."
                           "("+  //.................................................  = remember short url in $3 ("test.com")
                              "[0-9A-Z-]{2,63}"+  //................................  = domain name ("test")
                              "\\.(?:com|co.uk|[A-Z]{2,3}(?:\\.[A-Z]{2,3})?)"+  //..  = tld. i.e. ".com", ".co.uk" &c.
                           ")"+
                           "(?::[0-9]{1,6})?"+  //..................................  = optional port. e.g. "test.com:80"
                           "(?:\\/[\\/0-9a-z_!~\\*'\\(\\)\\.;\\?:@&=\\+\\$,%-]*)?"+ //= folder/files "test.com/e/index.html"
                           "(?:#[0-9a-z-_]+)?"+  //.................................  = bookmark i.e. "index.html#stuff"
                        ")",
                        "gi"  //'global+ignore', replace all instances, ignore case sensitivity
                );
                //replace URLs in the text with hyperlinks
                return s_msg.replace (regex, '<a href="http$1://$2" target="_blank">&lt;$3$4&hellip;&gt;</a>');
        },
        
        /* > applyMarkup : replace simple text markup with relevant HTML tags
           ===============================================================================================================
           params * s_msg  : text to parse for markup
           return * string : same text, but with markup replaced with relevant HTML tags
           =============================================================================================================== */
        applyMarkup : function (s_msg) {
                return s_msg.replace (/\*(.*)\*/, '<strong>$1</strong>')        //"*bold*"
                            .replace (/\/(.*)\//, '<em>$1</em>')                //"/italic/"
                            .replace (/_(.*)_/,   '<span class="u">$1</span>')  //"_underline_"
                ;
        },
        
        /* > insertEmoticons : replace ASCII emoticons with images
           ===============================================================================================================
           params * s_msg  : text to parse for emoticons
           return * string : same text, but with ASCII emoticons replaced with HTML images
           =============================================================================================================== */
        applyEmoticons : function (s_msg) {
                //loop over each emote and replace any instances of it
                this._.emotes.each (function(o_emote){
                        //replace the emote with the image
                        s_msg = s_msg.replace (o_emote.regex, this._.templates.chat_emote.evaluate(o_emote));
                }.bind(this));
                return s_msg;
        },
        
        /* > toggleEmoteList : slide open/closed the emoticon panel
           =============================================================================================================== */
        toggleEmoteList : function () {
                //slide up the panel (by shrinking the chatlog)
                var button = $("shared-chat-emote"),        //the emote panel button
                    panel  = $("shared-chat-emotes"),       //the emote list
                    v      = panel.visible (),              //true = panel is expanded, false = panel is collapsed
                    height = panel.getDimensions ().height  //height of the emote list
                ;
                $("shared-chat-history").morph ("height: "+(v ? 321 : 321-height)+"px;", {beforeStart:function(){
                        if (!v) {$("shared-chat-emotes").toggle ();}
                },afterFinish:function(){
                        if (v) {$("shared-chat-emotes").toggle ();}
                        button.title = (button.alt == "open") ? "Click to hide emotes" : "Click to show emotes";
                        button.alt   = (button.alt == "open") ? "close" : "open";
                }, duration: 0.3});
        }
};

//add an `onload` event to generate the emote list and apply element events. this cannot be done before `onload` as you
//cannot modify the document before it has finished loading, and the chat HTML may not have loaded yet at this stage.
//this does not replace any previous `onload` event
Event.observe (window, 'load', function(){
        //this is handled internally, to shorten self references
        shared.chat.initialise ();
});

//=== end of line ===========================================================================================================