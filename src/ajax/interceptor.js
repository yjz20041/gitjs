define([
	'../core/eventEmitter',
	'../util/util'
],function(EventEmitter, u){
	var
		cache = [],

		Interceptor = EventEmitter._$extend({
			
			__init: function(options){

				options = u._$merge({

					onrequest: this.__onRequest,
					onresponse: this.__onResponse,
					onformat: this.__onFormat,
					onloaded: this.__onLoaded,
					onerror: this.__onError,
					ontimeout: this.__onTimeout
				
				}, options)
				this.__super(options);

				
			},

			__onRequest: function(){
				
			},

			__onResponse: function(){
				
			},

			__onFormat: function(){
				
			},

			__onLoaded: function(){
				
			},

			__onError: function(){
				
			},

			__onTimeout: function(){
				
			}

			

		});


		Interceptor._$add = function(interceptor){
			if(interceptor instanceof Interceptor){

				cache.push(interceptor);

			}
				
		}

		Interceptor._$remove = function(interceptor){
			u._$forEach(cache, function(item, i){
				if(item == interceptor){
					cache.splice(i, 1);
					this._$remove(interceptor);
					return true;
				}
			})
		}

		Interceptor._$clear = function(){
			cache = [];
		}

		Interceptor._$get = function(){
			return cache;
		}

	return Interceptor;
})