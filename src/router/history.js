define([
	'../core/eventEmitter',
	'../util/util'
],function(EventEmitter, u){
	var
		History,
		started = false;

	History = EventEmitter._$extend({
	
		_useHash: function(){
			var
				ua = /(msie)\s(\w+)/.exec(navigator.userAgent.toLowerCase());
			return !ua || ua[2] > 7 && 'onhashchange' in window;
		},

		//get hash from url
		_$getHash: function(){

			return /#\/?(.*)\/?/.exec(location.href) ? RegExp.$1 : undefined;
		},

		_doCallbacks: function(evt){

			this._$dispatchEvent('onurlchange', evt);
		},

		_synHash: function(){
			var
				current = this._$getHash(),
				iHash = this.__iWin ? this.__iWin.location.hash.replace(/#/, '') : '',
				old = this.__iWin ? iHash : this.__oldValue,
				evt;
			//console.log(current, old)
			//old == undefined && (old = '');
			if(current == old) return;

			//prevent default behavior if the _$beforeChange method reutrn false
			evt = {
				oldValue: old,
				newValue: current
			};

			if(this._$dispatchEvent('onbeforeurlchange', evt) === false){

				this._$navigate(old);
				return;
			} 

			if(this.__iWin){
				
				//is navigation, create history entry
				if(current != this.__oldValue){
					this.__iWin.document.open();
					this.__iWin.document.close();				
					this.__iWin.location.hash = current;
				}
				//just move history
				else{					
					location.hash = iHash;
					current = iHash;
					evt.newValue = iHash;
				}
			}

			this._doCallbacks(evt);

			this.__oldValue = current;
		},

		/*_$beforeChange: function(evt){

			return this._$dispatchEvent('onbeforeurlchange', evt);
		},*/

		_$navigate: function(hash){

			location.hash = hash;
		},

		_$bootstrap: function(){
			var
				iframe,
				iWin;

			if(started) return;

			started = true;
			
			if(!location.hash){
				location.hash = '';
			}
			//this.__oldValue = this._$getHash();
			if(this._useHash()){
				u._$addEvent(window, 'hashchange', this._synHash._$bind(this));
			}else{
				iframe = document.createElement('iframe');
				iframe.src = 'javascript:void(0)';
				iframe.style.display = 'none';
				iframe.tabIndex = -1;
				iWin  = this.__iWin = document.body.insertBefore(iframe, document.body.firstChild).contentWindow;
				iWin.document.open();
				//iWin.document.close();				
				//iWin.location.hash = this._$getHash();
				this.__timer = setInterval(this._synHash._$bind(this), 50);
			}

			this._synHash();

			return this;
		}
	});
	
	return History;
})