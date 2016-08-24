/**
 * @name 		Model Class
 * @describe 	manage data
 * @author 		yangjiezheng
 * @update 		2016-08-24
 *
 */

define([
	'./eventEmitter',
	'../util/util'
], function(EventEmitter, u){
	var
		Model = EventEmitter._$extend({
			
			__init: function(options){
				this.__super();
				
				this.__children = [];

				this.__model = {};
			},

			_$set: function(key, value){
				var
					map = this.__model[key] = this.__model[key] || {};
				map.oldValue = map.currentValue;
				map.currentValue = value;

				if(map.oldValue != map.currentValue){
					map.dirty = true;
				}
			},

			_$get: function(key){
				var
					map = this.__model[key] || {};
				return map.currentValue;
			},

			_$appendChild: function(model){
				if(model instanceof Model){
					this.__children = this.__children || [];
					this.__children.push(model);
					model._$setParent(this);
				}
					
			},

			_$children: function(){
				return this.__children;
			},

			_$removeChild: function(model){
				u._$forEach(this.__children, function(child, i){
					if(child == model){
						this.__children.splice(i, 1);
					}
				}, this)
			},

			_$setParent: function(model){
				if(model instanceof Model){
					this.__parent = model;
				}
			},

			_$getParent: function(){
				return this.__parent;
			},

			//add listener to key
			_$on: function(key, handler){
				if(this.__model[key] == undefined){
					this._$set(key, undefined);
				}
				this._$addEvent(key, handler);
			},

			_$off: function(key, handler){
				this._$removeEvent(key, handler)
			},

			_$digest: function(){

				u._$forEach(this.__model, function(map, key){
					var
						curValue,
						oldValue,
						i = 0;
					while(map.dirty != false){
						curValue = map.currentValue;
						oldValue = map.oldValue;
						map.oldValue = curValue;
						map.dirty = false;
						this._$dispatchEvent(key, curValue, oldValue, this);						
						i ++;
						if(i > 10){
							u._$error('too much food, indigestion!');
							break;
						}
					}

				}, this);


				u._$forEach(this._$children(), function(childModel){
					childModel._$digest();
				});

				this.__primitiveDigest = false;
			},

			

			_$apply: function(expression){
				/*waitting... :) */
			}

		});


	return Model;

});