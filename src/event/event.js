/**
 * @name 		Event Class
 * @describe 	manage event, all of the events will be delegated to the docuemnt,
 				and distinguish them according to the unique id assigned by gitjs of the dom 
 * @author 		yangjiezheng
 * @update 		2016-08-10
 *
 */

define(['../core/eventEmitter', '../util/util'], function(EventEmitter, u){
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
					'mouseover',
					//'mousemove',
					'mouseout',
					'mousedown',
					'mouseup',
					'resize',
					'load',
					'unload'
				];

				u._$forEach(this.__surpportEventType, function(type){
			        u._$addEvent(document, type, this._onDocumentEvent);
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
				this._$off(dom);
			},

			_$trigger: function(dom, type, event){
				var
					gitId = dom.getAttribute('gitId'),
					eventArea = this.__eventMap[gitId],
					handlers;

				if(eventArea == undefined || eventArea[type] == undefined) return;
					
				handlers = eventArea[type];

				u._$forEach(handlers, function(handler){
					if(event.stopImmediatePropagation) return true;
					handler.call(dom, event);
				});
			},

			_onDocumentEvent: function(event){
				var
					gitEvent = {
						srcEvent: event,
						target: event.target || event.srcElement,
						type: event.type,
						keyCode: event.keyCode || event.which,
						preventDefault: event.preventDefault || function(){event.returnValue = false;},
						stopPropagation: event.stopPropagation || function(){event.cancelBubble = true},
						stopImmediatePropagation: function(){this.stopImmediatePropagation = true;this.stopPropagation();}
					}

        		this._$trigger(gitEvent.target, gitEvent.type, gitEvent);
        		
        	}


		});


	return Event;

});