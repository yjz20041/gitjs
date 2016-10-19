define([
	'./eventEmitter',
	'../util/util',
	'./directive',
	'../element/element'
],function(EventEmitter, u, Directive, $){


	function getAttr(element){
		//console.log(element)
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


			_$compile: function(element){
				var
					directiveNames,
					directive,
					linkFns = [],
					createChildModel,
					_$attr;

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
					

				}, this);
				
				if(element.nodeType != '2' && element.nodeType != '3'){
					u._$forEach(element.childNodes, function(childNode){
						linkFns.childLinkFns = linkFns.childLinkFns || [];
						linkFns.childLinkFns.push(this._$compile(childNode));
					}, this);
				
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
						linkFn.call(this, $(element), _$attr, model);
					}, this);
					
				}
				
			},

			__collectDirectives: function(element){
				var
					attrs = getAttr(element),
					ret = [];
				u._$forEach(attrs, function(value, name){

					if(directiveManager[name] != undefined){
						ret.push(name);
					}
				}, this);

				ret.sort(function(a, b){
					return (directiveManager[b]._$priority || 0) - (directiveManager[a]._$priority || 0);
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

	Compiler._$registerDirective('gtInterpolator', Directive._$extend({
		_$priority: -100,
		_$link: function(node/*textNode or attrNode*/, attr, model){
			var
				key = attr['gtInterpolator'];

			this.__super(node, attr, model);
			
			model._$on(key, function(newVal, oldVal){
				attr.value = newVal;//don't forget to update attr
				node[0].nodeType == 3 ? node[0].nodeValue = newVal : node[0].value = newVal;	
			});
			
			
		}
	}));

	return Compiler;
})