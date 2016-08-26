define([
	'./core/model',
	'./core/compiler'
], function(Model, Compiler){
	var
		Git = Compiler._$extend({
			
			__init: function(options){

				this.__super();

				this.__rootModel = new Model();	

				this.__domTree = options && options.domTree || document;			
			},

			_$bootstrap: function(){
				this._$compile(this.__domTree)(this.__rootModel);
			
			}			

		}),
		instance = new Git();

	return instance;
})