define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util',
	'gitjs/core/model'
],function(EventEmitter, u, model){
	var
		Directive = EventEmitter._$extend({
			
			_$priority: 0,

			__init: function(options){

				this.__super(options);

				//element
				//this.__element = options.element;

				//model
				//this.__model = options.model;

			},

			_$setModel: function(model){
				this.__model = model;
			},

			_$getModel: function(){
				return this.__model;
			},

			_$compile: function(element){

			},

			_$link: function($, attr, model){
				this.__model = model;
			},

			_$set: function(key, value){
				this.__model._$set(key, value);
			},
			_$get: function(key){
				return this.__model._$get(key);
			}

		});

	return Directive;
})