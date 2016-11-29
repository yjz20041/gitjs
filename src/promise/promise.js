define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util',
	'gitjs/promise/callback'
],function(EventEmitter, u, Callback){
	var
		Promise = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);

				this.__func = options.func;

				this.__resolveCallback = new Callback({
					
					nonce: true,
					memory: true
				});

				this.__rejectCallback = new Callback({
					
					nonce: true,
					memory: true
				});

				this.__state = 'pending';

				this.__wrapFunc();
			},

			__wrapFunc: function(){

				if(u._$isFunction(this.__func)){

					this.__func.call(this, this);
				}
					
			},

			_$done: function(resolveFn){

				return this._$then(resolveFn);
			},

			_$fail: function(rejectFn){

				return this._$then(function(){}, rejectFn);
			},

			_$always: function(alwaysFn){

				return this._$then(alwaysFn, alwaysFn);
			},

			_$then: function(resolveFn, rejectFn){
				var
					pipes = [
						['__resolveCallback', '_$resolve'],
					 	['__rejectCallback', '_$reject']
					 ],
					_this = this,
					args = arguments;

				return Promise._$promise(function(){
					var
						newPromise = this;

					u._$forEach(args, function(fn, i){
						var
							callback = _this[pipes[i][0]];

						callback._$add(function(){
							var
								ret = fn.apply(_this, arguments);
							if(ret instanceof Promise){
								u._$forEach(pipes, function(item){

									ret[item[0]]._$add(function(){

										newPromise[item[1]].apply(newPromise, arguments);
									})
								});
									
							}else{

								newPromise[pipes[i][1]].apply(newPromise, arguments);
							}
						});

					});
				})
					
				
			},

			_$resolve: function(){
				this.__resolveCallback._$fire.apply(this.__resolveCallback, arguments);
				this.__state = 'resolve';
			},

			_$reject: function(){
				this.__rejectCallback._$fire.apply(this.__rejectCallback, arguments);
				this.__state = 'reject';
			}						

		});
	
	Promise._$promise = function(func){
		/*if(!u._$isFunction(func)){
			u._$error('A function must be passed into method _$promise');
			return;
		}*/
		return new Promise({
			func: func
		})
	}

	Promise._$when =  function(){

		var
			i = 0,
			func,
			waitCount = arguments.length,
			ret,
			promise;

		promise = Promise._$promise();

		if(arguments.length == 0) promise._$resolve();
		
		for(; i < arguments.length; i ++){
			func = arguments[i];
			ret = u._$isFunction(func) ? func.apply(this) : func;
			if(ret instanceof Promise){
				ret._$then(function(){
					waitCount --;
					if(waitCount == 0){
						promise._$resolve();
					}
				}, function(){
					
					promise._$reject();
				});
			}else{
				waitCount --;
				if(waitCount == 0){
					promise._$resolve();
				}
			}
		}

		return promise;
	}

	return Promise;
})