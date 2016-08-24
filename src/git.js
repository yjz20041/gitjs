define([
	'./core/controller',
	'./core/directive',
	'./core/filter',
	'./core/model'
], function(Controller, Directive, Filter, Model){
	var
		Git = EventEmitter._$extend({
			
			__init: function(){

				this.__super();

				//controller manager
				this.__controllerManager = {

				};

				//direcitve manager
				this.__direcitveManager = {

				};

				//filter manager
				this.__FilterManager = {

				};
				
			},

			_$registerController = function(name, fn){
				this.__controllerManager[name] = fn;
			},

			_$registerDirecitve = function(name, fn){
				this.__direcitveManager[name] = fn;
			}

			

		});

	return Git;
})