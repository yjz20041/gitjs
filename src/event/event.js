/**
 * @name 		Event Class
 * @describe 	manage event, all of the events will be delegated to the docuemnt,
 				and distinguish them according to the unique id  of the dom which is assigned by gitjs 
 * @author 		yangjiezheng
 * @update 		2016-08-11
 *
 */

define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util',
	'gitjs/event/gitEvent'
], 
function(EventEmitter, u, GitEvent){
	var
		Event = EventEmitter._$extend({
			
			__init: function(options){
				this.__super();

				//event map
				this.__eventMap = {};

				//the event type surpported
				this.__supportedEventMap = {
					click: false,
					dbclick: false, 
					change: false, 
					keydown: false,
					keyup: false,
					keypress: false,
					focus: false,
					blur: false,
					mouseover: false,
					mousemove: false,
					mouseout: false,
					mousedown: false,
					mouseup: false,
					resize: false,
					load: false,
					unload: false
				};

				
			},

			/**
			 * @method	_$on
			 * @describe add event handler to the dom
			 * @param{Dom} the dom to bind event
			 * @param{String} the type of the event
			 * @param{Function} the handler of the event
			 * return{Void}
			 */

			_$on: function(dom, type, handler){
				var
					gitId = dom.getAttribute('gitId'),
					eventArea;
				if(gitId == undefined){
					gitId = u._$uniqueID();
					dom.setAttribute('gitId', gitId);
				}
				eventArea = this.__eventMap[gitId] = this.__eventMap[gitId] || {};
				
				//adding the supported event dynamicly to reduce the perfomance overhead of the event dispatcher 
				if(!this.__supportedEventMap[type]){
					if(type == 'focus' || type == 'blur'){
						//IE
						if(u._$isIE8()){
							switch(type){
								case 'focus':
									type = 'focusin';
								break;
								case 'blur':
									type = 'focusout';
								break;
								default:
								break;
							}
							u._$addEvent(document, type, this._eventDispatcher._$bind(this), false);
						}else{
							u._$addEvent(document, type, this._eventDispatcher._$bind(this), true);
						}						

					}else{
						u._$addEvent(document, type, this._eventDispatcher._$bind(this));
					}
					this.__supportedEventMap[type] = true;
						
				}

				eventArea[type] = eventArea[type] || [];
				eventArea[type].push(handler);

			},

			/**
			 * @method	_$off
			 * @describe remove event handler from the dom
			 * @param{Dom} the dom to remove event
			 * @param{String optional} the type of the event, being none to remove all type event handlers of the dom
			 * @param{Function optional} the handler of the event, being none to remove all handlers of the specified type
			 * return{Void}
			 */
			_$off: function(dom, type, handler){
				var
					gitId = dom.getAttribute('gitId'),
					eventArea = this.__eventMap[gitId],
					handlers;

				if(eventArea == undefined || eventArea[type] == undefined) return;
					
				handlers = eventArea[type];

				if(u._$isFunction(handler)){
					u._$forEach(handlers, function(item, i){
						if(item == handler){
							handlers.splice(i, 1);
							return true;
						}
					});
				}else if(type != null){
					delete eventArea[type];
				}else{
					delete this.__eventMap[gitId];
				}

				//delete specified type event area
				if(handlers.length == 0){
					delete eventArea[type];
				}

				//delete total event area
				if(u._$isBlankObject(eventArea)){
					delete this.__eventMap[gitId];
				}					

			},

			/**
			 * @method	_$clear
			 * @describe clear the event handlers of dom, or clear total event map
			 * @param{Dom} the dom to clear event handlers
			 * return{Void}
			 */

			_$clear: function(dom){
				if(dom != undefined){
					this._$off(dom);
				}else{
					this.__eventMap = {};
				}
				
			},


			/**
			 * @method	_$trigger
			 * @describe trigger a event of the dom
			 * @param{Dom} the dom to trigger the event
			 * @param{String} the type of the event
			 * @param{Object} instance of the GitEvent or the data to be passed into the handlers
			 * return{Void}
			 */
			_$trigger: function(dom, type, data){
				var
					gitId = dom.getAttribute('gitId'),
					eventArea = this.__eventMap[gitId],
					handlers,
					createdEvent,
					event;
				if(eventArea == undefined || eventArea[type] == undefined || eventArea[type].length == 0) return;
					
				handlers = eventArea[type];

				//init event if event is not existed
				if(data instanceof GitEvent){

					event = data;

				}else{

					if (document.createEvent) {
				    	createdEvent = document.createEvent("HTMLEvents");
				    	createdEvent.initEvent(type, true, true);
				    	createdEvent.target = dom;
				  	}else {
				    	createdEvent = document.createEventObject();
				    	createdEvent.eventType = type;
				    	createdEvent.srcElement = dom;
				  	}
				  	event = new GitEvent(createdEvent);
				  	event.data = data;

				}


				u._$forEach(handlers, function(handler){
					if(event.stopped === true) return true;
					handler.call(dom, event);
				});
			},


			/**
			 * @method	_$_eventDispatcher
			 * @describe dispatch event
			 * @param{Event} the event to be dispatched
			 * return{Void}
			 */
			_eventDispatcher: function(event){
				
				var
					//git event object which cross platform
					gitEvent,
					gitId,
					eventArea,
					target = event.target || event.srcElement,
					type = event.type;
				//we do so many judging is in order to reduce the perfomance overhead of the event dispatcher.
				//if target is document, it has no getattribute function
				if(this.__supportedEventMap[event.type] && target != document){

					gitId = target.getAttribute('gitId');
					eventArea = this.__eventMap[gitId];
					if(eventArea && eventArea[type] && eventArea[type].length){
						gitEvent = new GitEvent(event);
						this._$trigger(target, type, gitEvent); 
					}
						     
				}
        					
        	}

		});


	return Event;

});