/**
 * @name 		Model Class
 * @describe 	manage data
 * @author 		yangjiezheng
 * @update 		2016-08-10
 *
 */

define(['./eventEmitter'], function(EventEmitter){
	var
		Model = EventEmitter._$extend({
			
			__init: function(options){
				this.__super();
				
			}

		});


	return Model;

});