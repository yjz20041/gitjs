/**
 * @name 		Event Class
 * @describe 	manage event, all of the events will be delegated to the docuemnt,
 				and distinguish them according to the unique id  of the dom which is assigned by gitjs 
 * @author 		yangjiezheng
 * @update 		2016-08-10
 *
 */

define([
	'../core/eventEmitter',
	'../util/util',
	'./gitEvent'
], 
function(EventEmitter, u, GitEvent){
	var
		Event = EventEmitter._$extend({
			
			__init: function(options){
				this.__super();

				//event map
				this.__eventMap = {};

				//the event type surpported
				this.__surpportEventType = [
					'click',
					'dbclick', 
					'change', 
					'keydown',
					'keyup',
					'keypress',
					'focus',
					'blur',
					/*'mouseover',
					'mousemove',
					'mouseout',
					'mousedown',
					'mouseup',
					'resize',
					'load',
					'unload'*/
				];

				u._$forEach(this.__surpportEventType, function(type){
			        u._$addEvent(document, type, this._onDocumentEvent._$bind(this));
			    }, this);

				
			},

			_$on: function(dom, type, handler){
				var
					gitId = dom.getAttribute('gitId'),
					eventArea;
				if(gitId == undefined){
					gitId = u._$uniqueID();
					dom.setAttribute('gitId', gitId);
				}
				eventArea = this.__eventMap[gitId] = this.__eventMap[gitId] || {};
				eventArea[type] = eventArea[type] || [];
				eventArea[type].push(handler);

			},


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

			_$clear: function(dom){
				if(dom != undefined){
					this._$off(dom);
				}else{
					this.__eventMap = {};
				}
				
			},

			_$trigger: function(dom, type, data){
				var
					gitId = dom.getAttribute('gitId'),
					eventArea = this.__eventMap[gitId],
					handlers,
					createdEvent,
					event;
				if(eventArea == undefined || eventArea[type] == undefined) return;
					
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

			_packGitEvent: function(event){
					
				return {
					srcEvent: event,
					target: event.target || event.srcElement,
					type: event.type,
					keyCode: event.keyCode || event.which,
					pageX: event.pageX || event.clientX + document.documentElement.scrollLeft,
					pageY: event.pageY || event.clientY + document.documentElement.scrollTop,
					preventDefault: event.preventDefault || function(){event.returnValue = false;},
					//stopPropagation: event.stopPropagation || function(){event.cancelBubble = true},
					stopImmediate: function(){this.stopped = true;}
				}
			},

			_onDocumentEvent: function(event){
				var
					//git event object which cross platform
					gitEvent = new GitEvent(event);

        		this._$trigger(gitEvent.target, gitEvent.type, gitEvent);        		
        	}

		});


	return Event;

});