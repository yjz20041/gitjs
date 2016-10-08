define(function(){

	if(!Function.prototype._$bind){
		Function.prototype._$bind = function(context){
			var
				constructor = this,
				args = [].slice.call(arguments, 1);
			return function(){
				var
					newArgs = args.slice(0);// copy one
					i = 0;
				for(; i < arguments.length; i ++){
					newArgs.push(arguments[i]);
				}
				constructor.apply(context, newArgs);
			}
		}
	}

	function isFunction(f){
		return {}.toString.call(f).toLowerCase() == '[object function]';
	}

	function injectSuper(fn, superFn){
			
		return function(){
			this.__super = superFn;//use __super instead of super because ie8- forbid to  use super various
			return fn.apply(this, arguments);
		}
		
	}

	function merge(target, source, superPrototype){
		var
			key,
			val;

		for(key in source){
			val = source[key];
			superFn = superPrototype[key];
			if(source.hasOwnProperty(key) && isFunction(val)){
				isFunction(superFn) || (superFn = function(){});
				target[key] = injectSuper(val, superFn);
			}else{
				target[key] = val;
			}
		}
	}


	return function(obj){

		return extend.call(function(){}, obj);


		function extend(obj){

			function Clazz(){
				if(this.__init){
					this.__init.apply(this, arguments);
				}
			}

			var
				superProto = this.prototype,
				proto;

			function noop(){};
			noop.prototype = superProto;
			proto = new noop();

			//extend properties
			merge(proto, obj, superProto);



			Clazz.prototype = proto;
			Clazz.prototype.constructor = Clazz;
			Clazz._$extend = extend;
			Clazz.prototype._$extend = function(obj){
				merge(this, obj, superProto)
			}

			//static method
			for(var key in this){
				if(this.hasOwnProperty(key) && this[key] != extend && isFunction(this[key])){
					Clazz[key] = this[key];
				}
					
			}

			

			return Clazz;
		}			

	}

});