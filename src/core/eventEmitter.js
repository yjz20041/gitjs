/**
 * @name 		EventEmitter Class
 * @describe 	the base class
 * @author 		yangjiezheng
 * @update 		2016-08-10
 *
 */

define(['./clazz', '../util/util'], function(Clazz, u){
	var
		EventEmitter = Clazz(),
		pro = EventEmitter.prototype;

	pro.__init = function(options){
		//the map of event
		this.__events = {};

		this.__autoAddEvents(options);

	}

	pro.__autoAddEvents = function(options){
		
		u._$forEach(options, function(val, key){
			if(/^on/.test(key) && u._$isFunction(val)){
				this._$addEvent(key, val);
			}
		}, this);

	}

	pro._$getEvent = function(type){
		return type ? this.__events[type] : this.__events;
	}


	/**
	 * @method	_$addEvent
	 * @describe add handler to the event map
	 * @param{String} the event type
	 * @param{Function} the event handler
	 * return{Void}
	 */
	pro._$addEvent = function(type, handler){
		if(u._$isFunction(handler) || u._$isObject(handler)){
			this.__events[type] = this.__events[type] || [];
			this.__events[type].push(handler);
		}
	}

	pro._$hasEvent = function(type){
		return this.__events[type] ? true : false;
	}

	/**
	 * @method	_$removeEvent
	 * @describe remove handler from the event map
	 * @param{String} the event type
	 * @param{Function} the event handler. if null, remove all of the handlers in this type
	 * return{Void}
	 */
	pro._$removeEvent = function(type, handler){
		var
			handlers = this.__events[type];
		if(u._$isFunction(handler)){
			u._$forEach(handlers, function(item, i){
				if(u._$isObject(item)){
					item = item.fn
				}
				if(item == handler){
					handlers.splice(i, 1);
					return true;
				}
			})
		}else{
			delete this.__events[type];
		}
			
	}

	/**
	 * @method	_$clearEvent
	 * @describe clear  event map
	 * return{Void}
	 */
	pro._$clearEvent = function(){
		this.__events = [];
	}


	/**
	 * @method	_$dispatchEvent
	 * @describe dispatch event
	 * @param{String} the event type
	 * return{Void}
	 */
	pro._$dispatchEvent = function(type){
		var
			handlers = this.__events[type],
			args = u._$slice(arguments, 1),
			ret;
		u._$forEach(handlers, function(item, i){
			if(u._$isObject(item)){
				item = item.fn
			}
			ret = item.apply(this, args);
			if(ret === false){
				return true;
			}
		}, this);

		return ret;
	}



	return EventEmitter;

})