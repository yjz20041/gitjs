define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util'
],function(EventEmitter, u){
	var
		Callback = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);

				this.__list = [];

				this.__nonce = options.nonce || false;

				this.__memory = options.memory || false;

				//the arguments of firing
				this.__firingArgs = [];

				//indicate if the callback is fired
				this.__fired = false;

			},

			_$add: function(fn){
				

				if(u._$isFunction(fn)){
					
					if(this.__fired && this.__memory){

						fn.apply(this, this.__firingArgs);

						if(!this.__nonce){

							this.__list.push(fn);
						}

					}else{

						this.__list.push(fn);
					}						
				}
					
			},

			_$remove: function(fn){
				var
					i;
				for(i = 0; i< this.__list.length; i ++){
					if(this.__list[i] == fn){
						this.__list.splice(i, i);
						i --;
					}
				}

			},

			_$fire: function(){
				this.__firingArgs = arguments;

				this.__fired = true;

				u._$forEach(this.__list, function(item){
					item.apply(this, this.__firingArgs);
				}, this);


				if(this.__nonce){
					this.__list = [];
				}
			}

			

		});

	return Callback;
})