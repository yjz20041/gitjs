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

				//model
				this.__model = options.model;				
			},

			_$setModel: function(model){
				this.__model = model;
			},

			_$getModel: function(){
				return this.__model;
			},

			_$compile: function(element){

			},

			_$link: function(element, model){

			}

		});

	return Directive;
})