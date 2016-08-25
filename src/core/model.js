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
			__children: [],

			__init: function(options){
				this.__super();
				
				this.__children = [];

			},

			_$set: function(key, value){
				var
					map = this[key] = this[key] || {};
				map.isData = true;
				map.oldValue = map.newValue;
				map.newValue = value;

				if(map.oldValue != map.newValue){
					map.dirty = true;
				}
			},

			_$get: function(key){
				var
					map = this[key] || {};
				return map.newValue;
			},


			_$children: function(){
				return this.__children;
			},

			_$appendChild: function(model){
				this.__children.push(model);
				model._$setParent(this);
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
				/*if(this[key] == undefined){
					this._$set(key, undefined);
				}*/
				this._$addEvent(key, handler);
			},

			_$off: function(key, handler){
				this._$removeEvent(key, handler)
			},

			_$digest: function(key){
				var
					context = {};
				if(key){
					context[key] = this[key];
				}else{
					context = this;
				}

				u._$forEach(context, function(map, key){
					var
						newValue,
						oldValue,
						i = 0;
					
					if(map.isData !== true) return;


					while(map.dirty != false){
						newValue = map.newValue;
						oldValue = map.oldValue;

						u._$forEach(this._$children(), function(childModel){
							childModel._$digest(key);
						});

						map.oldValue = newValue;
						
						this._$dispatchEvent(key, newValue, oldValue, this);

						if(map.oldValue == map.newValue){
							map.dirty = false;
						}

						i ++;
						if(i > 10){
							u._$error('too much food, indigestion!');
							break;
						}
					}

				}, this);

				if(key == undefined){
					u._$forEach(this._$children(), function(childModel){
						childModel._$digest();
					});
				}
					

			},

			

			_$apply: function(expression){
				/*waitting... :) */
			},

			_$new: function(){
				var
					Constructor = function(){
						this.__children = [];
					},
					childModel;
				Constructor.prototype = this;
				childModel = new Constructor();

				this._$appendChild(childModel);

				return childModel;

			}

		});


	return Model;

});