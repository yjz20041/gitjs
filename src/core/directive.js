define([
	'./eventEmitter',
	'../util/util',
	'./model'
],function(EventEmitter, u, model){
	var
		Directive = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);

				//element
				this.__element = options.element;

				//parent model
				this.__parentModel = options.parentModel;

				if(this.__model === true){

					this.__model = this.__parentModel ? this.__parentModel._$new() : new Model();
				}				
			},

			_$setModel = function(model){
				this.__model = model;
			},

			_$getModel = function(){
				return this.__model;
			},

			_$compile: function(element, model){

			},

			_$link: function(element, model){

			}

			

		});

	return Directive;
})