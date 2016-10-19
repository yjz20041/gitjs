define([
	'../promise/promise',
	'../util/util',
	'./interceptor'
],function(Promise, u, Interceptor){
	var
		Ajax = Promise._$extend({
			
			__init: function(options){

				this.__super(options);

				this.__options = options;

				//set the interceptor
				this.__setInterceptor();
				this.__createRequest();
			},

			__setInterceptor: function(){
				this.__interceptor = this.__options.interceptor instanceof Interceptor 
					?  this.__options.interceptor : Interceptor._$get() || [];
			},

			/**
			 * @method	_dispatchInterceptorEvent
			 * @describe dispatch event to intercepors 
			 * @return{Boolean} abort the request if return false
			 */

			_dispatchInterceptorEvent: function(){
				var
					args = arguments,
					ret,
					//build the array of interceptor temporary
					temp = this.__interceptor;

				if(!(temp instanceof Array)){
					
					temp = [temp];
				}

				u._$forEach(temp, function(interceptor){

					ret = interceptor._$dispatchEvent.apply(interceptor, args);

					if(ret === false){
						return true;
					}
				
				});

				return ret;
			},

			__createRequest: function(){

				var
					request,
					headers = u._$merge({
						'Content-Type': 'application/x-www-form-urlencoded'
					}, this.__options.headers),
					method = this.__options.method || 'get',
					url = this.__options.url || '',
					asyn = this.__options.asyn || true,
					timeout = this.__options.timeout,
					params = this.__options.params || {},
					dataType = this.__options.dataType || 'json';

				//onrequest
				if(this._dispatchInterceptorEvent('onrequest', this.__options) === false)
					return;

				if(window.XMLHttpRequest){
					this.__request = request = new XMLHttpRequest();
				}else{
					this.__request = request = new window.ActiveXObject('Microsoft.XMLHTTP');
				}

				//open request
				request.open(method, url,  asyn);

				//timeout
				if(asyn && timeout){
					request.timeout = timeout;
					this.__timer = setTimeout(function(){
						var
							res = {
								result: 'timeout'
							};
						
						if(request.readyState != 4){
							if(this._dispatchInterceptorEvent('ontimeout', res, req) === false)
								return;
							request.abort();
							this._$reject(res, this.__options);
						}
						delete this.__timer;
							
					}._$bind(this), timeout);
				}

				//headers
				u._$forEach(headers, function(val, key){

					request.setRequestHeader(key, val);
				
				}, this);

				//method
				method = method.toUpperCase();

				//params
				params = u._$json2param(params);
				if(method == 'GET'){				
					if(params){
						url += '?' + params;
					}
						
				}

				request.onreadystatechange = function(){
					var
						result,
						responseHeaders,
						req = this.__options,
						res = {};
					if(request.readyState == 4){

						//clear timer
						if(this.__timer){
							clearTimeout(this.__timer);
							delete this.__timer;
						}

						//response headers
						responseHeaders = request.getAllResponseHeaders();
						res.headers = res.headers || {};
						u._$forEach(responseHeaders.split(/[\n]/), function(header){
							var
								key,
								val;
							header = header.split(': ');
							key = header[0];
							val = header[1];
							if(key){
								
								res.headers[key] = val;
							}
						});

						//status
						res.status = request.status;

						
						//response text
						result = request.responseText;
						res.result = result;
						
						//onresponse
						if(this._dispatchInterceptorEvent('onresponse', res, req) === false)
							return;


						if(dataType.toUpperCase() == 'JSON'){
							try{
								result = u._$parse(result);
							}catch(e){

							}								
						}
						res.result = result;

						//onformat
						if(this._dispatchInterceptorEvent('onformat', res, req) === false)
							return;

						

						if(request.status == 200){
							
							//onloaded
							if(this._dispatchInterceptorEvent('onloaded', res, req) === false)
								return;

							this._$resolve(res, req);
						
						}else{
							
							//onerror
							if(this._dispatchInterceptorEvent('onerror', res, req) === false)
								return;
							
							this._$reject(res, req);

						}
					}
				
				}._$bind(this);

				//send request
				this.__request.send(params);
			},

			

			_$abort: function(){
				this.__request.abort();
				
			}

			

		});

	return Ajax;
})