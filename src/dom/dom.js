/**
 * @name 		Dom Class
 * @describe 	operate dom like jquery
 * @author 		yangjiezheng
 * @update 		2016-08-15
 *
 */

define([
	'../core/eventEmitter',
	'../util/util',
	'./selector',
	'../event/event'
],

function(EventEmitter, u, Selector, Event){

	var
		eventManager = new Event(),
		propCache = {},
		Dom = EventEmitter._$extend({
			
			__init: function(options){
				this.__super();
								

				this.__selectors = options.selectors;
				this.__context = options.context || document;

				
				this.__domSelector = new Selector({
					selectors: this.__selectors,
					context: this.__context
				});

				this.__dom = this.__domSelector._$getDom(); 
				
			},

			_$get: function(index){
				return index != undefined ? this.__dom[index] : this.__dom;
			},


			/**
			 * @method	_$css
			 * @describe get or set css
			 * @param{String/Object} css name of the object of css map
			 * @param{String} css value
			 * @return{this}
			 */
			_$css: function(cssName, cssValue){

				var
					ret;
				
				u._$forEach(this._$get(), function(dom){

					if(u._$isObject(cssName)){
						u._$forEach(cssName, function(value, key){
							this._setCss(dom, key, value)
						}, this);
					}else if(cssValue != undefined){
						this._setCss(dom, cssName, cssValue)
					}else{
						ret = u._$GetCurrentStyle(dom, cssName);
						return true;
					}

				}, this);

				if(cssValue == undefined){
					return ret;
				}
				
				return this;	
							
			},

			_setCss: function(dom, cssName, cssValue){
				if(cssValue != undefined){
					dom.style[cssName] = cssValue;
				}else{
					u._$removeInlineStyle(dom, [cssName]);
				}
					
			},

			_getCss: function(key){

			},

			
			/**
			 * @method	_$position
			 * @describe get position relative parent node
			 * @return{Object}
			 */
			_$position: function(){
				var
					representive = this._$get(0);
				return {
					left: representive.offsetLeft,
					top: representive.offsetTop
				}

			},
			

			/**
			 * @method	_$offset
			 * @describe get offset relative client
			 * @return{Object}
			 */
			_$offset: function(){
				var
					representive = this._$get(0),
					rect = representive.getBoundingClientRect();
				return {
					left: rect.left,
					top: rect.top
				}
			},

			/**
			 * @method	_$width
			 * @describe get width
			 * @return{Int}
			 */
			_$width: function(){
				var
					representive = this._$get(0);
				return representive.offsetWidth;
			},

			/**
			 * @method	_$height
			 * @describe get height
			 * @return{Int}
			 */
			_$height: function(){
				var
					representive = this._$get(0);
				return representive.offsetHeight;
			},

			_bodyScrollTop: function(){
				return document.body.scrollTop || document.documentElement.scrollTop;
			},
			_bodyScrollLeft: function(){
				return document.body.scrollLeft || document.documentElement.scrollLeft;
			},

			/**
			 * @method	_$scrollTop
			 * @describe get scroll top
			 * @return{Int}
			 */
			_$scrollTop: function(){
				var
					representive = this._$get(0);
				return representive.scrollTop;
			},

			/**
			 * @method	_$scrollLeft
			 * @describe get scroll left
			 * @return{Int}
			 */
			_$scrollLeft: function(){
				var
					representive = this._$get(0);
				return representive.scrollLeft;
			},

			/**
			 * @method	_$innerWidth
			 * @describe get inner width excluding border
			 * @return{Int}
			 */
			_$innerWidth: function(){
				var
					representive = this._$get(0);
				return representive.clientWidth;
			},

			/**
			 * @method	_$innerHeight
			 * @describe get inner height excluding border
			 * @return{Int}
			 */
			_$innerHeight: function(){
				var
					representive = this._$get(0);
				return representive.clientHeight;
			},

			/**
			 * @method	_$outerWidth
			 * @describe get outer width including padding and border
			 * @return{Int}
			 */
			_$outerWidth: function(){
				var
					representive = this._$get(0);
				return representive.offsetWidth;
			},

			/**
			 * @method	_$outerHeight
			 * @describe get outer height including padding and border
			 * @return{Int}
			 */
			_$outerHeight: function(){
				var
					representive = this._$get(0);
				return representive.offsetHeight;
			},


			/**
			 * @method	_$attr
			 * @describe set or get attribute of dom
			 * @param{String} attribute name
			 * @param{String optional} attribute value 
			 * @return{String/this}
			 */
			_$attr: function(key, value){
				var
					doms = this._$get();
				if(value == undefined){
					return doms[0].getAttribute(key);
				}else{
					u._$forEach(doms, function(dom){
						dom.setAttribute(key, value);
					});
				}
				return this;
					
			},

			/**
			 * @method	_$removeAttr
			 * @describe remove dom attribute
			 * @param{String} attribute name
			 * @return{String/this}
			 */
			_$removeAttr: function(key){
				u._$forEach(this._$get(), function(dom){
					dom.removeAttribute(key);
				});
				return this;
			},


			/**
			 * @method	_$propCache
			 * @describe set or get prop of dom by cache
			 * @param{String} prop name
			 * @param{String optional} prop value 
			 * @return{Any/this}
			 */
			_$propCache: function(key, value){
				var
					doms = this._$get(),
					gitId;
			
				if(value == undefined){
					gitId = doms[0].getAttribute('gitId');
					return propCache[gitId] && propCache[gitId][key];
				}else{
					u._$forEach(doms, function(dom){
						gitId = dom.getAttribute('gitId');
						if(gitId == undefined){
							gitId = u._$uniqueID();
							dom.setAttribute('gitId', gitId);
						}
						if(!propCache[gitId]){
							propCache[gitId] = {};
						}
						propCache[gitId][key] = value;
					});
				}
				return this;
						
			},


			/**
			 * @method	_$removePropCache
			 * @describe remove prop of dom from prop cache
			 * @param{String} prop name
			 * @return{this}
			 */
			_$removePropCache: function(key){
				u._$forEach(this._$get(), function(dom){
					gitId = dom.getAttribute('gitId');
					
					if(propCache[gitId]){
						delete propCache[gitId][key];
					}
				});
				return this;
			},

			/**
			 * @method	_$prop
			 * @describe set or get prop of dom by dom
			 * @param{String} prop name
			 * @param{String optional} prop value 
			 * @return{Any/this}
			 */
			_$prop: function(key, value){
				var
					doms = this._$get();
			
				if(value == undefined){
					return doms[0][key]
				}else{
					u._$forEach(doms, function(dom){						
						dom[key] = value;
					});
				}
				return this;		
			},

			/**
			 * @method	_$removeProp
			 * @describe remove prop of dom from dom
			 * @param{String} prop name
			 * @return{this}
			 */
			_$removeProp: function(key){
				u._$forEach(this._$get(), function(dom){
					delete dom[key];
				});

				return this;
			},




			/**
			 * @method	_$on
			 * @describe bind event handler to dom
			 * @param{String} event type
			 * @param{Function} event handler
			 * @return{this}
			 */
			_$on: function(type, handler){
				u._$forEach(this._$get(), function(dom){
					eventManager._$on(dom, type, handler);
				});

				return this;
			},

			/**
			 * @method	_$off
			 * @describe remove event handler from dom
			 * @param{String} event type
			 * @param{Function} event handler
			 * @return{this}
			 */
			_$off: function(type, handler){
				u._$forEach(this._$get(), function(dom){
					eventManager._$off(dom, type, handler);
				});

				return this;
			},

			/**
			 * @method	_$trigger
			 * @describe trigger event
			 * @param{String} event type
			 * @param{Object} data passed into the event object
			 * @return{this}
			 */
			_$trigger: function(type, data){
				u._$forEach(this._$get(), function(dom){
					eventManager._$trigger(dom, type, data);
				});

				return this;
			},


			/**
			 * @method	_$addClass
			 * @describe add class name to dom
			 * @param{String} class name
			 * @return{this}
			 */
			_$addClass: function(className){
				var
					regClassName = new RegExp('\\s*' + className + '\\s*');
				u._$forEach(this._$get(), function(dom){
					if(!regClassName.test(dom.className)){
						dom.className = dom.className + ' ' + className;
					}
				});

				return this;
			},

			/**
			 * @method	_$removeClass
			 * @describe remove class name from dom
			 * @param{String} class name
			 * @return{this}
			 */
			_$removeClass: function(className){
				var
					regClassName = new RegExp('\\s*' + className + '\\s*');
				u._$forEach(this._$get(), function(dom){
					dom.className = dom.className.replace(regClassName, ' ');
				});

				return this;
			},


			/**
			 * @method	_$hasClass
			 * @describe if dom has the specified class name
			 * @param{String} class name
			 * @return{boolean}
			 */
			_$hasClass: function(className){
				var
					regClassName = new RegExp('\\s*' + className + '\\s*'),
					representive = this._$get(0);
				return regClassName.test(representive.className);
			},


			/**
			 * @method	_$find
			 * @describe find descends
			 * @param{String} selector
			 * @return{DomObject}
			 */
			_$find: function(selector){
				return new Dom({
					selectors: selector,
					context: this._$get()
				});
			},


			/**
			 * @method	_$eq
			 * @describe return the specified index dom
			 * @param{Int} index
			 * @return{Dom}
			 */
			_$eq: function(index){
				return this._$get(index);
			},

			/**
			 * @method	_$first
			 * @describe return the first index dom
			 * @return{Dom}
			 */
			_$first: function(){
				return this._$get(0);
			},

			/**
			 * @method	_$last
			 * @describe return the last index dom
			 * @return{Dom}
			 */
			_$last: function(){
				
			},

			_$prev: function(){

			},
			_$next: function(){

			},
			_$parent: function(){

			},
			_$parents: function(selector){

			},
			_$children: function(){

			},
			_$siblings: function(){

			},


			//move
			_$append: function(node){

			},
			_$appendTo: function(node){

			},

			_$prepend: function(node){

			},
			_$prependTo: function(node){

			},

			_$before: function(node){

			},
			_$after: function(node){

			},
			_$remove: function(){

			},
			_$clone: function(){

			},

			//decorate
			_$wrap: function(html){

			},
			_$unwrap: function(){

			}			

		});

	return function(selectors, context){
		if(!(selectors instanceof Dom)){
			return new Dom({
				selectors: selectors,
				context: context
			});
		}else{
			return selectors;
		}
	}

});