define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util'
],function(EventEmitter, u){
	var
		Template = EventEmitter._$extend({
			
			__init: function(){

				this.__super();
				
			},

			_$template: function(text){
				var
					escape = /<%([\s\S])+?%>/,
					interpolate = /<%=([\s\S])+?%>/,
					allReg = new RegExp([
						escape.source,
						interpolate.source
					].join('|'), 'g'),
					source,
					render;
				
				text.replace(allReg, function(match, escape, interpolate){
					
				});

				render = new Function('data', source);

				return function(data){
					data = data || {};
					render.call(this, data);
				}
			}
			

		});

	return Template;
})