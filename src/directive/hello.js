define([
	'../core/directive',
	'../util/util'
],function(Directive, u){
	var
		HelloDirective = Directive._$extend({
			
			

			__init: function(){

				this.__super();
			},

			_$compile: function(element, model){

			},

			_$link: function(element, model){

			}
						

		});

	return HelloDirective;
})