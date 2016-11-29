define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util'
],function(EventEmitter, u){
	var
		Injector = EventEmitter._$extend({
			
			__init: function(){

				this.__super();

				this.__providerSuffix = 'Provider';
				this.__providerCache =  {};
				this.__serviceCache =  {};
			},

			_$getProvider = function(name){
				return this.__providerCache[name];
			}

			//provider must be a object witch contain a _$get factory method
			_$registerProvider: function(name, provider){
				
				if(!providerFn._$get) u._$error('provider must define _$get method');
				this.__providerCache[name + this.__providerSuffix] = provider;

				return this;
			},

			_$registerService: function(name, serviceFn){
				
				this._$registerProvider(name + this.__providerSuffix, {
					_$get: serviceFn
				});

				return this;
			},

			_$registerConstant: function(name, value){
				this.__serviceCache[name] = value;

				return this;
			},

			_$invoke: function(fn, self, locals){
				var
					services,
					func,
					returnValue;
				
				if(u._$isArray(fn)){
					func = fn.slice(-1, 1);
					services = fn.slice(0, fn.length - 1);
				}

				u._$forEach(services, function(name, i){
					services[i] = this._$getService(name, locals);
				}, this);

				return func.apply(self || this, services);
			},

			_$getService: function(name, locals){
				var
					provider = this._$getProvider(name),
					service;
				locals = locals;
				if(this.__serviceCache[name]){
					return this.__serviceCache[name];
				}else{
					service  = this._$instantiate(this._$getProvider(name)._$get);
					this.__serviceCache[name] = service;
					return service;
				}
			},

			_$instantiate: function(fn, locals){
				var
					func = fn;
				if(u._$isArray(fn)){
					func = fn.slice(-1, 1);
				}

				return this._$invoke(fn, new func(), locals);

			}

		});

	return Injector;
})