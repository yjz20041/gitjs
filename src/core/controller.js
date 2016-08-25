define([
	'./eventEmitter',
	'../util/util'
],function(EventEmitter, u){
	var
		Controller = EventEmitter._$extend({
			
			__init: function(){

				this.__super();

				this.__model = {};

				this.__view = null;
				
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
			}

			

		});

	return Controller;
})