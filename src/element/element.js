/**
 * @name 		Element Class
 * @describe 	operate element like jquery
 * @author 		yangjiezheng
 * @update 		2016-08-16
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
		Element = EventEmitter._$extend({
			
			__init: function(options){
				
				this.__super();
								

				this.__selectors = options.selectors;
				this.__context = options.context || document;

				this.__initElements();

				
					
				
			},

			__initElements: function(){

				if(this.__selectors == 'document'){
					this._$setElements([document]);
				}
				else if(this.__selectors == 'body'){
					this._$setElements([document.body]);
				}
				//virtual dom
				else if(this.__selectors instanceof EventEmitter){
					this._$setElements([this.__selectors._$getDom()]);
				}
				// html
				else if(u._$isHtml(this.__selectors)){
					tempElement = document.createElement('div');
					tempElement.innerHTML = this.__selectors;
					this._$setElements(u._$getChildElements(tempElement));
				}
				//selectors
				else if(u._$isString(this.__selectors)){

					this.__elementSelector = new Selector({
						selectors: this.__selectors,
						context: this.__context
					});

					this._$setElements(this.__elementSelector._$get());
				}
				// array
				else if(u._$isArray(this.__selectors)){
					this._$setElements(this.__selectors);
				}
				//element
				else if(u._$isElement(this.__selectors)){
					this._$setElements([this.__selectors]);
				}
			},

			_$get: function(index){
				return index != undefined ? this.__elements[index] : this.__elements;
			},

			_clearElements: function(){
				
				while(this[0]){
					delete this[0];
				}
			},

			_mergeElements: function(elements){
				u._$forEach(elements, function(element, i){

					this[i] = element;

				}, this);
			},

			_$setElements: function(elements){
				this._clearElements();
				this._mergeElements(elements);
				this.__oldElements = this.__elements;
				this.__elements = elements;
			},

			_$size: function(){
				return this._$get().length;
			},

			_$end: function(){
				this._$setElements(this.__oldElements);
				return this;
			},

			_$index: function(selectors){

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
				
				u._$forEach(this._$get(), function(element){

					if(u._$isObject(cssName)){
						u._$forEach(cssName, function(value, key){
							this._setCss(element, key, value)
						}, this);
					}else if(cssValue != undefined){
						this._setCss(element, cssName, cssValue)
					}else{
						ret = u._$GetCurrentStyle(element, cssName);
						return true;
					}

				}, this);

				if(cssValue == undefined){
					return ret;
				}
				
				return this;	
							
			},

			_setCss: function(element, cssName, cssValue){
				if(cssValue != undefined){
					element.style[cssName] = cssValue;
				}else{
					u._$removeInlineStyle(element, [cssName]);
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
			 * @describe set or get attribute of element
			 * @param{String} attribute name
			 * @param{String optional} attribute value 
			 * @return{String/this}
			 */
			_$attr: function(key, value){
				var
					elements = this._$get();
				if(value == undefined){
					return elements[0].getAttribute(key);
				}else{
					u._$forEach(elements, function(element){
						element.setAttribute(key, value);
					});
				}
				return this;
					
			},

			/**
			 * @method	_$removeAttr
			 * @describe remove element attribute
			 * @param{String} attribute name
			 * @return{String/this}
			 */
			_$removeAttr: function(key){
				u._$forEach(this._$get(), function(element){
					element.removeAttribute(key);
				});
				return this;
			},


			/**
			 * @method	_$propCache
			 * @describe set or get prop of element by cache
			 * @param{String} prop name
			 * @param{String optional} prop value 
			 * @return{Any/this}
			 */
			_$propCache: function(key, value){
				var
					elements = this._$get(),
					gitId;
			
				if(value == undefined){
					gitId = elements[0].getAttribute('gitId');
					return propCache[gitId] && propCache[gitId][key];
				}else{
					u._$forEach(elements, function(element){
						gitId = element.getAttribute('gitId');
						if(gitId == undefined){
							gitId = u._$uniqueID();
							element.setAttribute('gitId', gitId);
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
			 * @describe remove prop of element from prop cache
			 * @param{String} prop name
			 * @return{this}
			 */
			_$removePropCache: function(key){
				u._$forEach(this._$get(), function(element){
					gitId = element.getAttribute('gitId');
					
					if(propCache[gitId]){
						delete propCache[gitId][key];
					}
				});
				return this;
			},

			

			/**
			 * @method	_$prop
			 * @describe set or get prop of element by element
			 * @param{String} prop name
			 * @param{String optional} prop value 
			 * @return{Any/this}
			 */
			_$prop: function(key, value){
				var
					elements = this._$get();
			
				if(value == undefined){
					return elements[0][key]
				}else{
					u._$forEach(elements, function(element){						
						element[key] = value;
					});
				}
				return this;		
			},

			/**
			 * @method	_$removeProp
			 * @describe remove prop of element from element
			 * @param{String} prop name
			 * @return{this}
			 */
			_$removeProp: function(key){
				u._$forEach(this._$get(), function(element){
					delete element[key];
				});

				return this;
			},




			/**
			 * @method	_$on
			 * @describe bind event handler to element
			 * @param{String} event type
			 * @param{Function} event handler
			 * @return{this}
			 */
			_$on: function(type, handler){
				u._$forEach(this._$get(), function(element){
					eventManager._$on(element, type, handler);
				});

				return this;
			},

			/**
			 * @method	_$off
			 * @describe remove event handler from element
			 * @param{String} event type
			 * @param{Function} event handler
			 * @return{this}
			 */
			_$off: function(type, handler){
				u._$forEach(this._$get(), function(element){
					eventManager._$off(element, type, handler);
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
				u._$forEach(this._$get(), function(element){
					eventManager._$trigger(element, type, data);
				});

				return this;
			},


			/**
			 * @method	_$addClass
			 * @describe add class name to element
			 * @param{String} class name
			 * @return{this}
			 */
			_$addClass: function(className){
				var
					regClassName = new RegExp('\\s*' + className + '\\s*');
				u._$forEach(this._$get(), function(element){
					if(!regClassName.test(element.className)){
						element.className = element.className + ' ' + className;
					}
				});

				return this;
			},

			/**
			 * @method	_$removeClass
			 * @describe remove class name from element
			 * @param{String} class name
			 * @return{this}
			 */
			_$removeClass: function(className){
				var
					regClassName = new RegExp('\\s*' + className + '\\s*');
				u._$forEach(this._$get(), function(element){
					element.className = element.className.replace(regClassName, ' ');
				});

				return this;
			},


			/**
			 * @method	_$hasClass
			 * @describe if element has the specified class name
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
			 * @describe find descend
			 * @param{String} selector
			 * @return{ElementObject}
			 */
			_$find: function(selector){
				return new Element({
					selectors: selector,
					context: this._$get()
				});
			},


			/**
			 * @method	_$eq
			 * @describe put the specified index element into the set of matched elements
			 * @param{Int} index
			 * @return{this}
			 */
			_$eq: function(index){
				this._$setElements([this._$get(index)]);
				return this;
			},

			/**
			 * @method	_$first
			 * @describe put the first element into the set of matched elements
			 * @return{this}
			 */
			_$first: function(){

				this._$setElements([this._$get(0)]);
				return this;
			},

			/**
			 * @method	_$last
			 * @describe put the last element into the set of matched elements
			 * @return{this}
			 */
			_$last: function(){
				this._$setElements([this.__elements[this.__elements.length - 1]]);
				return this;
			},


			_find: function(selectors, context){
				if(selectors != undefined){
					this._$setElements( (new Element({
						selectors: selectors,
						context: context
					}))._$get() )
				}else{
					this._$setElements(context);
				}
			},
			/**
			 * @method	_$prev
			 * @describe put the immediately previous sibling of each element in the set of matched elements. 
			 * If a selector is provided, it retrieves the previous sibling only if it matches that selector
			 * @param{String optional} selectors as be the fitler condition for the previous siblings
			 * @return{this}
			 */
			_$prev: function(selectors){
				var
					context = [];
				u._$forEach(this._$get(), function(element){
					var
						prevElement = u._$getSiblingElement(element, false);
					if(prevElement){
						context.push(prevElement);
					}
				});

				this._find(selectors, context);
					
				return this;
			},

			/**
			 * @method	_$next
			 * @describe put the immediately next sibling of each element in the set of matched elements. 
			 * If a selector is provided, it retrieves the next sibling only if it matches that selector
			 * @param{String optional} selectors as be the fitler condition for the next siblings
			 * @return{this}
			 */
			_$next: function(selectors){
				var
					context = [];
				u._$forEach(this._$get(), function(element){
					var
						nextElement = u._$getSiblingElement(element);
					if(nextElement){
						context.push(nextElement);
					}
				});

				this._find(selectors, context);
					
				return this;
			},

			/**
			 * @method	_$parent
			 * @describe put the parent node of each element in the set of matched elements. 
			 * If a selector is provided, it retrieves the parent node only if it matches that selector
			 * @param{String optional} selectors as be the fitler condition for the parent node
			 * @return{this}
			 */
			_$parent: function(selectors){
				var
					context = [];
				u._$forEach(this._$get(), function(element){
					var
						parentElement = u._$getParentElement(element);
					if(parentElement){
						context.push(parentElement);
					}
				});

				this._find(selectors, context);
					
				return this;
			},

			/**
			 * @method	_$parents
			 * @describe put the ancestor nodes of each element in the set of matched elements. 
			 * If a selector is provided, it retrieves the ancestor node only if it matches that selector
			 * @param{String optional} selectors as be the fitler condition for the ancestor node
			 * @return{this}
			 */
			_$parents: function(selectors){
				var
					context = [];
				u._$forEach(this._$get(), function(element){
					var
						ancestorElements = u._$getParentElement(element, true);
					if(ancestorElements){
						context = context.concat(ancestorElements);
					}
				});
				this._find(selectors, context);
					
				return this;
			},

			/**
			 * @method	_$children
			 * @describe put the children nodes of each element in the set of matched elements. 
			 * If a selector is provided, it retrieves the children node only if it matches that selector
			 * @param{String optional} selectors as be the fitler condition for the children node
			 * @return{this}
			 */
			_$children: function(selectors){
				var
					context = [];
				u._$forEach(this._$get(), function(element){
					var
						childElements = u._$getChildElements(element);
					if(childElements){
						context = childElements;
					}
				});
				this._find(selectors, context);
					
				return this;
			},

			/**
			 * @method	_$descend
			 * @describe put the descend nodes of each element in the set of matched elements. 
			 * If a selector is provided, it retrieves the descend node only if it matches that selector
			 * @param{String optional} selectors as be the fitler condition for the descend node
			 * @return{this}
			 */
			_$descend: function(selectors){
				var
					context = [];
				u._$forEach(this._$get(), function(element){
					var
						descendElements = u._$getChildElements(element, true);
					if(descendElements){
						context = descendElements;
					}
				});

				this._find(selectors, context);
					
				return this;
			},


			/**
			 * @method	_$siblings
			 * @describe put the sibling nodes of each element in the set of matched elements. 
			 * If a selector is provided, it retrieves the sibling node only if it matches that selector
			 * @param{String optional} selectors as be the fitler condition for the sibling nodes
			 * @return{this}
			 */
			_$siblings: function(selectors){
				var
					context = [];
				u._$forEach(this._$get(), function(element){
					var
						siblingElements = u._$getSiblingElement(element, true, true);
					if(siblingElements){
						context = context.concat(siblingElements);
					}
				});

				this._find(selectors, context);
					
				return this;
			},


			/**
			 * @method	_$append
			 * @describe append elements
			 * @param{Dom/Element} dom or instance of Element 
			 * @return{this}
			 */
			_$append: function(element){
				var
					representive = this._$get(0);
				if(u._$isElement(element)){
					representive.appendChild(element);
				}else if(element instanceof Element){

					u._$forEach(element._$get(), function(node){
						representive.appendChild(node);
					});
					
				}else if(u._$isHtml(element)){

					u._$forEach(this._$get(), function(node){
						var 
							newElement = new Element({
								selectors: element
							});
						node.appendChild(newElement[0]);

					})
					
				}
				return this;
			},

			/**
			 * @method	_$appendTo
			 * @describe append to element
			 * @param{Dom} dom or instance of Element 
			 * @return{this}
			 */
			_$appendTo: function(element){
				var
					representive;

				if(u._$isHtml(element)){
					element = new Element({
						selectors: element
					});
				}

				if(element instanceof Element){
					representive = element._$get(0);
				}

				u._$forEach(this._$get(), function(node){

					if(u._$isElement(element)){
						element.appendChild(node);
					}else if(representive){
						representive.appendChild(node);										
					}
				});
				
				return this;
			},

			/**
			 * @method	_$prepend
			 * @describe prepend element
			 * @param{Dom/Element} dom or instance of Element 
			 * @return{this}
			 */
			_$prepend: function(element){
				var
					representive = this._$get(0);

				if(u._$isHtml(element)){
					element = new Element({
						selectors: element
					});
				}
				if(u._$isElement(element)){
					u._$prependElement(representive, element);
				}else if(element instanceof Element){

					u._$forEach(element._$get(), function(node){
						u._$prependElement(representive, node);
					});					
				}
				return this;
			},

			/**
			 * @method	_$prependTo
			 * @describe prepend to element
			 * @param{Dom} dom or instance of Element 
			 * @return{this}
			 */
			_$prependTo: function(element){
				var
					representive,
					firstChild;
				
				if(u._$isHtml(element)){
					element = new Element({
						selectors: element
					});
				}

				if(element instanceof Element){
					representive = element._$get(0);
					firstChild = representive.firstChild;
				}

				u._$forEach(this._$get(), function(node){

					if(u._$isElement(element)){
						u._$prependElement(element, node);
					}else if(representive){
						firstChild ? representive.insertBefore(node, firstChild) : representive.appendChild(node);									
					}
				});
				
				return this;
			},

			/**
			 * @method	_$before
			 * @describe insert before element
			 * @param{Dom/Element} dom or instance of Element 
			 * @return{this}
			 */
			_$before: function(element){
				var
					representive;
				
				if(u._$isHtml(element)){
					element = new Element({
						selectors: element
					});
				}

				if(element instanceof Element){
					representive = element._$get(0);
				}

				u._$forEach(this._$get(), function(node){

					if(u._$isElement(element)){
						element.parentNode.insertBefore(node, element);
					}else if(representive){
						representive.parentNode.insertBefore(node, representive);								
					}
				});
				
				return this;
			},

			/**
			 * @method	_$after
			 * @describe insert after element
			 * @param{Dom/Element} dom or instance of Element 
			 * @return{this}
			 */
			_$after: function(element){
				var
					representive,
					nextSibling;

				if(u._$isHtml(element)){
					element = new Element({
						selectors: element
					});
				}

				if(element instanceof Element){
					representive = element._$get(0);
					nextSibling = u._$getSiblingElement(representive);
				}else{
					nextSibling = u._$getSiblingElement(element);
				}

				u._$forEach(this._$get(), function(node){

					if(u._$isElement(element)){
						nextSibling ? element.parentNode.insertBefore(node, nextSibling) : element.parentNode.appendChild(node);
					}else if(representive){
						nextSibling ? representive.parentNode.insertBefore(node, representive) : representive.parentNode.appendChild(node);								
					}
				});
				
				return this;
			},

			/**
			 * @method	_$remove
			 * @describe remove element
			 * @return{this}
			 */
			_$remove: function(){
				var
					gitId;
				u._$forEach(this._$get(), function(node){
					node.parentNode.removeChild(node);	
				}, this);
				this._$removePropCache();				
				return this;
			},

			/**
			 * @method	_$clone
			 * @describe clone Element instance
			 * @param{Boolean} if clone event and prop
			 * @return{Element}
			 */
			_$clone: function(deep){
				var
					cloneElements = [],
					cloneElement;
				u._$forEach(this._$get(), function(node){
					cloneElement = node.cloneNode(true);
					if(deep !== true){
						cloneElement.removeAttribute('gitId');
					}
					cloneElements.push(cloneElement);
									
				});

				return new Element({
					selectors: cloneElements
				});
			},

			/**
			 * @method	_$wrap
			 * @describe wrap element with the html element
			 * @param{String} html
			 * @return{this}
			 */
			_$wrap: function(html){
				var
					tempElement,
					wrappedElement,
					innerMostElement;
				u._$forEach(this._$get(), function(node, i){
					
					tempElement = document.createElement('div');
					tempElement.innerHTML = html;
					wrappedElement = u._$getChildElements(tempElement)[0];
					//for unwraping
					wrappedElement.originElement = node;
					//update matched elements
					this.__elements[i] = wrappedElement;
					
					node.parentNode.replaceChild(wrappedElement, node);
					innerMostElement = u._$getInnerMostElement(wrappedElement);	
					innerMostElement.appendChild(node);
				}, this);

				return this;
			},

			/**
			 * @method	_$wrap
			 * @describe unwrap element with the html element
			 * @return{this}
			 */
			_$unwrap: function(){
				u._$forEach(this._$get(), function(node, i){
					
					node.parentNode.replaceChild(node.originElement, node);

					//update matched elements
					this.__elements[i] = node.originElement;

				}, this);
				return this;
			}			

		}),
		exports = function(selectors, context){
			if(!(selectors instanceof Element)){
				return new Element({
					selectors: selectors,
					context: context
				});
			}else{
				return selectors;
			}
		};
		exports.clazz = Element

	return exports;

});