define(function(){
	var
		_r = [],
		_o = {},
		_f = function(){},
		slice = _r.slice,
		concat = _r.concat,
		util = {
			_$type: function(o){
				var
					r = /^\[object\s(.*)\]$/;
				return {}.toString.call(o).match(r)[1].toLowerCase();
			},

			_$isObject: function(o){
				return this._$type(o) == 'object' || (typeof o === 'object' && typeof o.nodeType === 'number' &&  typeof o.nodeName === 'string') || o == window;
			},

			_$isArray: function(a){
				return this._$type(a) == 'array';
			},

			_$isString: function(s){
				return this._$type(s) == 'string';
			},

			_$isNumber: function(n){
				return this._$type(n) == 'number';
			},

			_$isFunction: function(f){
				return this._$type(f) == 'function';
			},

			_$isBoolean: function(b){
				return this._$type(b) == 'boolean';
			},

			_$isDom: function(obj){
			    if(typeof HTMLElement == 'object'){
			      	return obj instanceof HTMLElement;
			    }else{
			      	return obj && obj.nodeType == 1 && typeof obj.nodeName == 'string';
			    }
			},

			_$isBlankObject: function(obj){
				var
					key;
				for(key in obj){
					if(obj.hasOwnProperty(obj[key])){
						return true;
					}
				}

				return false;
			},

			_$merge: function(deep){
				var
					target,
					srcArray;
				if(util._$isBoolean(deep)){
					target = util._$isObject(arguments[1]) || util._$isArray(arguments[1]) ? arguments[1] :{};
					srcArray = slice.call(arguments, 2);
				}else{
					target = util._$isObject(deep) || util._$isArray(deep) ? deep : {};
					srcArray = slice.call(arguments, 1);
				}				
					
				util._$forEach(srcArray,function(src){
					if(util._$isObject(src) || util._$isArray(src)){
						util._$forEach(src,function(val, key){
							if(deep === true && (util._$isObject(val) || util._$isArray(val))){
								target[key] = util._$isObject(val) ? {} : [];
								util._$merge(deep, target[key], val);
							}else{
								target[key] = val;
							}
						})
					}
				});
				
				return target;
			},

			_$forEach: function(obj, callback, context){
				var
					i = 0,
					key;
				
				if(!util._$isFunction(callback)) return;
				if(util._$isArray(obj) || (obj && obj.length != undefined)){
					for(; i < obj.length; i ++){
						if(callback.call(context || obj[i], obj[i], i)) break;
					}
				}else if(util._$isObject(obj)){
					for(key in obj){
						if(callback.call(context || obj, obj[key], key)) break;
					}
				}
			},

			_$bind: function(fun, context){
				var
					args = slice.call(arguments, 0);
				return function(){
					fun.apply(context, args);
				}
			},

			_$concat: function(){
				var
					ret = [],
					i;
				util._$forEach(slice.call(arguments), function(o){
					for( i = 0; i < o.length; i ++){
						ret.push(o[i]);
					}
				})
				return ret;
			},

			_$walker: function(array,idField,pidField){
			    var 
			      	result = [],
			      	arr  = array.slice(0);
			    
			    idField = idField || 'id';
			    pidField = pidField || 'pid';
			    
			    util._$forEach(arr,function(n, i){
			      	var
			        	cNode,
			        	j = 0;
			      	if (n.isChildren) return true;
			      
			      	n.deep = 0;

			      	for (; j < arr.length; j ++){
			        	cNode = arr[j];
				        if (cNode[pidField] == n[idField]){
				          	n.hasChildren = true;
				          	cNode.isChildren = true;
				          	cNode.deep = (n.deep || 0) + 1;
				          	n.children || (n.children = []);
				          	n.children.push(cNode);
				        }else if (n[pidField] == cNode[idField]){
				          	n.isChildren = true;
				          	cNode.hasChildren = true;
				          	n.deep = (cNode.deep || 0) + 1;
				          	cNode.children || (cNode.children = []);
				          	cNode.children.push(n);
				        }
			      	}
			      	if (!n.isChildren)
			        	result.push(n);

			    });
			    return result;
			},

			_$slice: function(context){
				var
					args = slice.call(arguments, 1);
				return slice.apply(context, args);
			},

			_$uniqueID: (function(){
		        var 
		        	seed = new Date,
		        	count = 0,
		        	id;
		        return function(){
		        	try{
		        		count ++;
		        		id = seed + count;
		        	}catch(e){
		        		seed = new Date;
		        		count = 0;
		        		id = seed + count;
		        	}
		            return id;
		        }
		    })(),

		    _$addEvent: function(dom, type, handler){
		    	if(dom.addEventListener){
		    		dom.addEventListener(type, handler, false);
		    	}else{
		    		dom.attachEvent('on' + type, handler);
		    	}
		    },

		    _$removeEvent: function(dom, type, handler){
		    	if(dom.removeEventListener){
		    		dom.removeEventListener(type, handler, false);
		    	}else{
		    		dom.detachEvent('on' + type, handler);
		    	}
		    },

		    _$triggerEvent: function(dom, type){
		    	var 
		    		event;

			  	if (document.createEvent) {
			    	event = document.createEvent("HTMLEvents");
			    	event.initEvent(type, true, true);
			  	}else {
			    	event = document.createEventObject();
			    	event.eventType = type;
			  	}

			  	event.eventName = type;

			  	if(document.createEvent){
			    	dom.dispatchEvent(event);
			  	}else{
			    	dom.fireEvent("on" + event.eventType, event);
			  	}
		    }

		}
	return util;
})