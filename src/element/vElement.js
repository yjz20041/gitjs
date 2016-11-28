define([
	'./element.js',
	'../util/util.js',
	'./selector.js',
	'../event/event.js',
	'../core/vDom.js',
	'../core/gitDiff.js',
	'../core/htmlParser.js'
],function(Element, u, Selector, Event, VDom, gitDiff, HtmlParser){
	var
		vTree = new VDom({
			tagName: 'document',
			nodeType: 1
		}),
		bHead = new VDom({
			tagName: 'head',
			nodeType: 1
		}),
		vBody = new VDom({
			tagName: 'body',
			nodeType: 1
		});


	var
		htmlParser = new HtmlParser();

	var
		VElement = Element.clazz._$extend({
			
			__init: function(options){

				options.context = options.context || vTree;

				this.__super(options);
				
			},

			__initElements: function(){
				
				
				if(this.__selectors == 'document'){
					this._$setElements([vTree]);
				}
				else if(this.__selectors == 'head'){
					this._$setElements([vHead]);
				}
				else if(this.__selectors == 'body'){
					this._$setElements([vBody]);
				}
				// html
				else if(u._$isHtml(this.__selectors)){
					this._$setElements([htmlParser._$parse(this.__selectors)]);
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
				//virtual dom
				else if(this.__selectors instanceof VDom){
					this._$setElements([this.__selectors]);
				}
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
				
				if(element instanceof VDom){
					representive.appendChild(element);
				}else if(element instanceof VElement){

					u._$forEach(element._$get(), function(node){
						representive.appendChild(node);
					});
					
				}else if(u._$isHtml(element)){

					u._$forEach(this._$get(), function(node){
						var 
							newElement = new VElement({
								selectors: element
							});
						node.appendChild(newElement[0]);

					});
					
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
					element = new VElement({
						selectors: htmlParser._$parse(element)
					});
				}

				if(element instanceof VElement){
					representive = element._$get(0);
				}

				u._$forEach(this._$get(), function(node){

					if(element instanceof VDom){
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
					element = new VElement({
						selectors: htmlParser._$parse(element)
					});
				}
				if(element instanceof VDom){
					u._$prependElement(representive, element);
				}else if(element instanceof VElement){

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
					element = new VElement({
						selectors: htmlParser._$parse(element)
					});
				}

				if(element instanceof VElement){
					representive = element._$get(0);
					firstChild = representive.firstChild;
				}

				u._$forEach(this._$get(), function(node){

					if(element instanceof VDom){
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
					element = new VElement({
						selectors: htmlParser._$parse(element)
					});
				}

				if(element instanceof VElement){
					representive = element._$get(0);
				}

				u._$forEach(this._$get(), function(node){

					if(element instanceof VDom){
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
					element = new VElement({
						selectors: htmlParser._$parse(element)
					});
				}

				if(element instanceof VElement){
					representive = element._$get(0);
					nextSibling = u._$getSiblingElement(representive);
				}else{
					nextSibling = u._$getSiblingElement(element);
				}

				u._$forEach(this._$get(), function(node){

					if(element instanceof VDom){
						nextSibling ? element.parentNode.insertBefore(node, nextSibling) : element.parentNode.appendChild(node);
					}else if(representive){
						nextSibling ? representive.parentNode.insertBefore(node, representive) : representive.parentNode.appendChild(node);								
					}
				});
				
				return this;
			},

			_$commit: function(){
				gitDiff._$commit();
			}
		}),

		exports = function(selectors, context){
			if(!(selectors instanceof VElement)){
				return new VElement({
					selectors: selectors,
					context: context
				});
			}else{
				return selectors;
			}
		};

		exports._$commit = function(){
			gitDiff._$commit();
			//console.log(gitDiff.__cache)
		}

		exports.clazz = VElement;

	return exports;

})