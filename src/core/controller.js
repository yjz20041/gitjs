define([
	'./directive',
	'../util/util'
],function(Directive, u){
	var
		Controller = Directive._$extend({
			
			__init: function(fn){

				this.__super();



				this.__model = {};

				this.__view = null;

				this.__controller = fn;
				
			},

			_$setModel: function(model){
				this.__model = model;
			},

			_$getModel: function(){
				return this.__model;
			},

			_$setView: function(domTree){
				this.__view = domTree;
			},

			_$getView: function(){
				return this.__view;
			},

			_$link: function(element, attr, model){
				this.__controller.apply(this, arguments);
				model._$digest();
			}			

		});

	return Controller;
})