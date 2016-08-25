define([
	'./core/eventEmitter',
	'./core/controller',
	'./core/directive',
	'./core/filter',
	'./core/model',
	'./core/compiler'
], function(EventEmitter, Controller, Directive, Filter, Model, Compiler){
	var
		Git = EventEmitter._$extend({
			
			__init: function(){

				this.__super();
				
			}			

		}),
		instance = new Git();

	return instance;
})