define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util',
	'gitjs/core/directive',
	'gitjs/element/element'
],function(EventEmitter, u, Directive, $){


	function getAttr(element){
		var
			ret = {};
		u._$forEach(element.attributes, function(attr){
			ret[attr.name.replace(/-(\w)/g, function(all, letter){
				return letter.toUpperCase();
			})] = attr.value;
		});

		return ret;
	}

	function getTextpolatorAttrNodes(element){
		var
			ret = [];
		u._$forEach(element.attributes, function(attrNode){
			if(attrNode.value.match(/\{\{(.+)\}\}/)){
				ret.push(attrNode);
			}
		});

		return ret;
	}



	var
		controllerManager = {},
		directiveManager = {},
		filterManager = {},

		Compiler = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);
			},

			_$registerController: function(name, fn){
				controllerManager[name] = fn;
			},

			_$registerDirective: function(name, fn){
				directiveManager[name] = fn;
			},


			_$compile: function(element, externalContext){
				var
					directiveNames,
					directive,
					linkFns = [],
					createChildModel,
					_$attr,
					childNodes,
					isTranscludeNode;

				//console.log(element.nodeType, element.nodeValue, element.parentNode)

				if(element.nodeType == 1){

					u._$forEach(getTextpolatorAttrNodes(element), function(attrNode){
						linkFns.attrLinkFns = linkFns.attrLinkFns || [];
						linkFns.attrLinkFns.push(this._$compile(attrNode));
					}, this);

					directiveNames = this.__collectDirectives(element);
					_$attr = getAttr(element);
				}
				//textNode interpolator
				else if(element.nodeType == '2' && element.value.match(/\{\{(.+)\}\}/) || element.nodeType == '3' && element.parentNode.tagName.toLowerCase() != 'script'  && element.nodeValue.match(/\{\{(.+)\}\}/)){
					directiveNames = ['gtInterpolator'];					
					_$attr = {
						'gtInterpolator': RegExp.$1  							
					};
				}

				u._$forEach(directiveNames, function(name){
					directive = directiveManager[name];
					if(u._$isFunction(directive)){
						directive = new directive({
							element: element
						});
					}
					//create child model
					if(directive._$model === true){
						createChildModel = true;
					}

					if(u._$isFunction(directive._$compile)){ 
						directive._$compile($(element), _$attr);
					}

					if(u._$isFunction(directive._$link)){
						linkFns.push(directive._$link._$bind(directive));
					}

					//create template
					if(directive.template){
					
						element.innerHTML = directive.template;

						if(directive.transclude){

							isTranscludeNode = true;
						}
							
					}	
					

				}, this);
				
				if(element.nodeType != '2' && element.nodeType != '3'){
					u._$forEach(element.childNodes, function(childNode, i){
						linkFns.childLinkFns = linkFns.childLinkFns || [];
						linkFns.childLinkFns.push(this._$compile(childNode, externalContext));

					}, this);
				
				}
				//remove element if transclude is true
				if(isTranscludeNode){
					childNodes = u._$slice(element.childNodes);
					u._$forEach(childNodes, function(childNode, i){
						element.parentNode.insertBefore(childNode, element);
						if(i == 0){
							element.ref = $(childNode);
						}
						if(i == childNodes.length - 1){
							element.parentNode.removeChild(element);
						}
					});
						
				}


				
				


				return function(model){
					

					if(createChildModel === true){
						model = model._$new();
					}

					u._$forEach(linkFns.childLinkFns, function(childLinkFn){
						childLinkFn.call(this, model);
					}, this);

					u._$forEach(linkFns.attrLinkFns, function(attrLinkFn){
						attrLinkFn.call(this, model);
					}, this);


					u._$forEachReverse(linkFns, function(linkFn){
						linkFn.call(this, $(element), _$attr, model, externalContext);
					}, this);
					
				}
				
			},

			__collectDirectives: function(element){
				var
					attrs = getAttr(element),
					ret = [],
					tagName = element.tagName.toLowerCase();

				//add element tag name
				if(directiveManager[tagName] != undefined){
					ret.push(tagName);
				}

				u._$forEach(attrs, function(value, name){

					if(directiveManager[name] != undefined){
						ret.push(name);
					}
				}, this);

				ret.sort(function(a, b){
					return (directiveManager[b].prototype._$priority || 0) - (directiveManager[a].prototype._$priority || 0);
				});

				return ret;
			}

		});

	
	Compiler._$registerController = function(name, fn){
		controllerManager[name] = fn;
	};

	Compiler._$registerDirective = function(name, fn){
		directiveManager[name] = fn;
	};

	//gt-controller	
	Compiler._$registerDirective('gtController', {
		_$model: true,
		_$link: function(element, attr, model){
			var
				controllerName = attr.gtController,
				controllerFn = controllerManager[controllerName];
			if(u._$isFunction(controllerFn)){
				controllerFn.call(this, model, element);
				model._$digest();
			}
		}
	});

	Compiler._$registerDirective('gtBind', Directive._$extend({
		_$link: function(element, attr, model){
			var
				key = attr['gtBind'];

			this.__super(element, attr, model);

			model._$on(key, function(newVal, oldVal){

				element._$text(newVal);	
			});
			
			
		}
	}));

	Compiler._$registerDirective('gtValue', Directive._$extend({
		_$priority: -100,
		_$link: function(element, attr, model){
			var
				key = attr['gtValue'];

			this.__super(element, attr, model);

			model._$on(key, function(newVal, oldVal){

				element._$value(newVal);

			});

			element._$on('keyup', function(){
				model._$set(key, element._$value());
				model._$digest();
			});

			element._$on('blur', function(){
				model._$set(key, element._$value());
				model._$digest();
			});			
		}
	}));

	Compiler._$registerDirective('gtInterpolator', Directive._$extend({
		_$priority: -100,
		_$link: function(node/*textNode or attrNode*/, attr, model){
			var
				key = attr['gtInterpolator'];

			this.__super(node, attr, model);
			
			model._$on(key, function(newVal, oldVal){

				if(newVal == undefined) newVal = '';
				attr.value = newVal;//don't forget to update attr
				node[0].nodeType == 3 ? node[0].nodeValue = newVal : node[0].value = newVal;	
			});
			
			
		}
	}));

	//events
	var
		events = ['click', 'change', 'keydown', 'keyup', 'click', 'dbclick', 'mouseover', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup', 'focus', 'blur'];
	u._$forEach(events, function(item){
		var
			directiveName = u._$under2camel('gt-' + item),
			type = item;
		Compiler._$registerDirective(directiveName, Directive._$extend({
			_$link: function(element, attr, model){

				element._$on(type, function(event){
					var
						fn = model[attr[directiveName]];
					if(u._$isFunction(fn)){
						fn.call(model, event);
						model._$digest();
					}
				}._$bind(this))	
			}
		}));
	});

	//show
	Compiler._$registerDirective('gtShow', Directive._$extend({
		_$link: function(element, attr, model){
			var
				key = attr['gtShow'];

			this.__super(element, attr, model);

			model._$on(key, function(newVal, oldVal){
				element._$show(newVal);
				
			});
			
			
		}
	}));

	/*Compiler._$registerDirective('gtClass', Directive._$extend({
		_$link: function(element, attr, model){


			var
				str = attr['gtClass'];

			this.__super(element, attr, model);

			/^\{([\w\-\s])+:([\w\-\s])+\}$/g.replace(str, function(){
				console.log(arguments)
			})
			
			
		}
	}));*/
		

	return Compiler;
})