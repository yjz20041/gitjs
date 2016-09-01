/**
 * @name 		Model Class
 * @describe 	manage data
 * @author 		yangjiezheng
 * @update 		2016-08-24
 *
 */

define([
	'./eventEmitter',
	'../util/util',
	'./expParser'
], function(EventEmitter, u, ExpParser){

	var
		parser = new ExpParser(),
		initValue = function(){},

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
				if(this._$hasEvent(key)){
					this._$addEvent(key, handler);
				}else{
					this._$addEvent(key, {
						last: initValue,
						get: parser._$parse(key),
						fn: handler					
					});
				}
					
			},

			_$off: function(key, handler){
				this._$removeEvent(key, handler)
			},

			_$digest: function(isRoot, count){
				
				var
					watches = this._$getEvent(),
					dirty = false,
					i = 0;
				count = count || 0;


				u._$forEach(watches, function(handlers, key){
					var
						proxy = handlers[0],
						get = proxy.get,
						oldValue = proxy.last,
						newValue = get(this);

					proxy.last = newValue;
	
					if(oldValue != newValue && !(u._$isNaN(oldValue) && u._$isNaN(newValue))){
						this._$dispatchEvent(key, newValue, oldValue, this);
						dirty = true;
					}


				}, this);

				if(dirty == true){
					count ++;
					if(count > 10){
						u._$error('too much recursive digestion');
						return;
					}
					this._$digest(false, count);


				}else if(isRoot !== false){

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

			},

			_$destroy: function(){

				if(this.__parent){
					this.__parent._$removeChild(this);
				}
			}

		});


	return Model;

});