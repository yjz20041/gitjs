define([
	'gitjs/core/directive',
	'gitjs/util/util'
], function(Directive, u){

	var
		Component = Directive._$extend({
			
			__init: function(options){

				this.__super(options);
				
				
			},
			transclude: true,
			_$model: true,

			_$compile: function($, attr){
				
			},

			_$link: function($, attr, model){
				var
					element = $[0],
					ref = element.ref,
					metas = {
						id: true,
						name: true,
						class: true,
						title: true,
						placeholder: true,
						size: true
					};

				this.__super($, attr, model);
				
				u._$forEach(attr, function(value, key){

					if(/^on[A-Z].*$/.test(key)){
						
						this._$addEvent(key, function(event){
							if(u._$isFunction(model[value])){
								model[value].call(this, event);
							}
						}._$bind(this));
					}

					if(metas[key]){
						model._$set(key, value);
					}
				}, this)

				this.__ref = ref;

				//model._$set(attr);
				
				this._$config(model);
				model._$digest();	

				this._$init(ref, attr, model);
				model._$digest();
			
			},

			_$config: function(model){
				
				
			},
			_$init: function($, attr){}
			

		});

	return Component;
	
})