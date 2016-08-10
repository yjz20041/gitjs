define(function(){

	return function(obj){

		return extend.call(function(){}, obj);


		function extend(obj){

			function Clazz(){
				if(this.__init){
					this.__init.apply(this, arguments);
				}
			}

			var
				proto,
				key,
				val,
				superFn;

			function noop(){};
			noop.prototype = this.prototype;
			proto = new noop();


			for(key in obj){
				val = obj[key];
				superFn = this.prototype[key];
				if(obj.hasOwnProperty(key) && isFunction(val)){
					isFunction(superFn) || (superFn = function(){});
					proto[key] = injectSuper(val, superFn);
				}else{
					proto[key] = val;
				}
			}

			Clazz.prototype = proto;
			Clazz.prototype.constructor = Clazz;
			Clazz.prototype.extend = extend;
			Clazz.extend = extend;

			function isFunction(f){
				return {}.toString.call(f).toLowerCase() == '[object function]';
			}

			function injectSuper(fn, superFn){
					
				return function(){
					this._super = superFn;//use _super instead of super because ie8- forbid to  use super various
					fn.apply(this, arguments);
				}
				
			}

			return Clazz;
		}			

	}

});