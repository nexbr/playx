//------------------------------------------------- GET FROM URL FUNCS -------------------------------------------------//
	
//Get a var from url format
function get(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
//Separates variable from identifier, returns value of var
function getByURL(variable, query)
{
       var vars = query.split("?");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
//Look At URL For Params
var urlParam = function(name, w){
    w = w || window;
    var rx = new RegExp('[\&|\?]'+name+'=([^\&\#]+)'),
        val = w.location.search.match(rx);
    return !val ? '':val[1];
}
	//------------------------------------------------- END GET FROM URL FUNCS -------------------------------------------------//
	//------------------------------------------------- START AT CODE -------------------------------------------------//
//Convert youtube #h#m#s time into seconds
//&start= or &t= can be either in pure seconds or in any order of hours, minutes, seconds in the format of #h#m#s.
//Ex: 2h41m12s = 2 hours, 41 minutes, and 12 seconds
function youtubeTimeConvert(duration){
	var total = 0;
	var hours = duration.match(/(\d+)[hH]/);
	var minutes = duration.match(/(\d+)[mM]/);
	var seconds = duration.match(/(\d+)[sS]/);
	if (hours) total += parseInt(hours[1]) * 3600;
	if (minutes) total += parseInt(minutes[1]) * 60;
	if (seconds) total += parseInt(seconds[1]);
	return total;
}
// Start Time Assignment (Universal)
//Init Working Variables
var start = urlParam('start') || "";
var t = urlParam('t') || "";
var startout;
	
if (start === ""){ //if start is empty, look at t
	if (t != "") {
		if (/^\d*\.?\d+$/.test(t)){ //if no characters found, t is in seconds
			startout = t;
			console.log("URL_TIME: Time t= is pure, starting at" + t);
		} else { //if characters found, decode from youtube time format
			startout = youtubeTimeConvert(t);
			console.log("URL_TIME: Time t= is in #h#m#s format, starting at" + t);
		}
	} else { //if start and t are empty, start at 0
		startout = 0;
		console.log("URL_TIME: Time Not Specified In URL, starting at 0");
	}
} else {
	if (start){
		if (/^\d*\.?\d+$/.test(start)) { //if start is occupied and has only numbers, start is in seconds
			startout = start
			console.log("URL_TIME: Time start= is pure, starting at" + start);
		} else { //else, start is in youtube time format, convert to seconds
			startout = youtubeTimeConvert(start);
			console.log("URL_TIME: Time start= is in #h#m#s format, starting at" + start);
		}
	}
}
	
	var startoutput = Math.round(startout);
	
	//------------------------------------------------- END START AT CODE -------------------------------------------------//
	
	
	//-------------------------------------------- VARIABLE DECLARATION AND PLAYERS --------------------------------------------//
	
	//Define Our Vars For Our Players
	var url = urlParam('url') || null;
	var videoId = get('v') || getByURL('v', urlParam('url') || null);
	var jw = get('jw') || false;

	//Backward Compatability With Legacy PlayX
	if (url.indexOf("youtube.com") === -1){
		jw = true;
	}
	
	//-------------------------------------------- END VARIABLE DECLARATION AND PLAYERS --------------------------------------------//
	//------------------------------------------------- FLASH DETECTION -------------------------------------------------//
	
	//If flash is installed, use flash instead of the standard youtube embed
	//This fixes the random issues with Awesomium and the YT Player
	//This will be removed once CEF is live.
	if (FlashDetect.installed) {
		var flashBuild = FlashDetect.raw;
		console.log("Flash Is Installed, Raw Build: " + flashBuild);
	} else {
		flashBuild = "";
		console.log("Flash Is Not Installed");
	}
	
	if (flashBuild.match(/VLC/)){
		console.log("WARNING: VLC FLASH DETECTED WHICH DOES NOT WORK ON GARRYSMOD");
	}
	
	//------------------------------------------------- END FLASH DETECTION -------------------------------------------------//
	//------------------------------------------------- CHOOSE PLAYER AND PLAY VIDEO -------------------------------------------------//

function onYouTubeIframeAPIReady() {
if(url || videoId){
	if (FlashDetect.installed && !flashBuild.match(/VLC/) && !jw){
	    	console.log("Calling Flash Video Function");
		YouTubeFlashPlayer(videoId, startoutput);
		document.body.innerHTML += '<div style="color:#00ff00"><h3>You have flash, good job</h3></div>';
	} else if(!jw){
		console.log("Calling HTML5 Video Function");
		YouTubeIFramePlayer(videoId, startoutput);
		document.body.innerHTML += '<div style="color:#ff0000"><h3>You dont have flash, bad idea</h3></div>';
	} else if(jw){
		console.log("Calling JWPlayer");
		if(url){
			JWPlayer(url, startoutput);
		} else {
			JWPlayer(videoId, startoutput);
		}
	}
}
}
	
//YouTube Flash Player (yva_video)(Have to use Flash since Awesomium hates HTML5)
var YouTubeFlashPlayer = function(videoId, startoutput){
			
	//Define Player Params and Attributes (SWFObject Embed for yva_video)
	var srcparams = {
		allowScriptAccess: "always",
		bgcolor: "#000000",
		wmode: "transparent"
	};
			
	var srcattributes = {
		id: "player",
	};
	
	//Backup Format: ?enablejsapi=1&amp;autoplay=1&amp;fs=1&amp;hl=en';
	//srcurl += '&amp;modestbranding=1&amp;autohide=1&amp;showinfo=0&amp;controls=0&amp;iv_load_policy=3';
	//Native YouTube SWF: https://s.ytimg.com/yts/swfbin/player-vflJESSS0/watch_as3.swf
	//yva_video backdoor SWF: https://youtube.googleapis.com/yva_video
	
	var srcurl = 'https://youtube.googleapis.com/yva_video?enablejsapi=1&amp;autoplay=1&amp;fs=1&amp;hl=en';
	srcurl += '&amp;modestbranding=1&amp;autohide=1&amp;showinfo=0&amp;controls=0&amp;iv_load_policy=3&amp;vq=hd720';
	srcurl += '&amp;docid=' + videoId + '&amp;start=' + startoutput;
	
	if (videoId.length > 11){
		srcurl += '&amp;partnerid=30&amp;ps=docs';
	}
	
	//Set YouTube Flash Player Source URL (yva_video 
	swfobject.embedSWF(srcurl, "player", "100.0%", "100.0%", "9", null, null, srcparams, srcattributes);
			
	//Set Player Params (called by our onReady detection callback defined above)
	this.onReady = function() {
		console.log("YT Flash Player onReady() Called");
		this.player = document.getElementById('player');
		this.player.style.width = "126.6%";
		this.player.style.height = "104.2%";
		this.player.style.marginLeft = "-23.2%";
		this.player.style.marginTop = "-2%";
		this.player.setPlaybackQuality("hd720");
	}
	
}
//YouTube IFrame Player (Fallback until CEF)
var YouTubeIFramePlayer = function(videoId, startoutput){
	
	//YouTube Embed Code
	console.log("Playing in HTML5");
	
	player = new YT.Player('player', {
    		"width": window.innerWidth, //set size to full window or bounds of PlayX screen
		"height": window.innerHeight, //set size to full window or bounds of PlayX screen
    		videoId: videoId, //get uri from ?url=, either from ?v= or pure uri
   		playerVars: {
			wmode: "transparent",
			autoplay: 1,
			showinfo: 0, //Disable title / creator label
			cc_load_policy: 1, //Remedies issues with some captions randomly coming up
			iv_load_policy: 3, //Removes all annotations
			disablekb: 1, //Disables keybaord to avoid accidental pausing / seeking of video
			modestbranding: 1, //Remove YouTube logo
			rel: 0, //Disable end video recommendations
			controls: 0, //Disable player UI controls
			start: start || 0, //YT Start: Requires for this value to be in string format for some reason
    		},
		events: {
			onReady: onYouTubePlayerReady,
		}
  	});
	
	this.onReady = function(){
		console.log("HTML5 Player onReady() Called");
		//player.style.width = "100%";
		//player.style.height = "100%";
		//player.style.marginLeft = "0%";
		//player.style.marginTop = "0%";
	}
}

var JWPlayer = function(videoId, startoutput){
	/** KEY **/
	
	jwplayer.key = "lmwviL3c55Ymnx4fMjEUQeiU00zeXf6TCiDHQA==";
	
	/** Initialize player **/
	jwplayer("player").setup({
		"aspectratio": "auto",
		"autostart": true,
		"controls": false,
		"displaydescription": false,
		"displaytitle": true,	    
		"file": videoId,
		"preload": "auto",
		"primary": "html5", // Use HTML5 As Primary To Have Native WebM / OGG HTML5 Support, Flash Fallback For Other Content
		"repeat": false,
		"loop": false,
		"stagevideo": false,
		"stretching": "uniform",
		"visualplaylist": false, 
		"width": window.innerWidth,
		"height": window.innerHeight,
		start: startoutput
	});
};
	
//------------------------------------------------- GLOBAL PLAYER FUNCTIONS -------------------------------------------------//
	
	function onYouTubePlayerReady( playerId ) {
		var player = document.getElementById('player');
		console.log("onYouTubePlayerReady() Global Called");
		onReady();
		player.addEventListener("onError", "onYouTubePlayerError");
	}
	
	function onYouTubePlayerError(e) {
		console.log("Youtube Threw An Error :/");
		if (e>=101) {
			console.log("Switching To IFrame API");
			document.getElementById('player').parentNode.removeChild(document.getElementById('player'));
			document.body.innerHTML += '<div id="player"></div>';
			YouTubeIFramePlayer(videoId, startoutput);
		}
	}
	
//------------------------------------------------- ANALYTICS -------------------------------------------------//
	
  //Google Analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
	
  ga('create', 'UA-92533032-1', 'auto'); //Science Tracker
  ga('create', 'UA-43230779-1', 'ziondevelopers.github.io'); //Dathus Tracker
  ga('send', 'pageview');
  ga('ziondevelopers.github.io', 'pageview');