define([
	'./eventEmitter',
	'../util/util',
	'../core/controller'
],function(EventEmitter, u, Controller){


	function getAttr(element){
		var
			ret = {};
		u._$forEach(element.attributes, function(attr){
			ret[attr.name.replace(/-(\w)/, function(all, letter){
				return letter.toUpperCase();
			})] = attr.value;
		});

		return ret;
	}

	var

		Compiler = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);

				//direcitve manager
				this.__directiveManager = {

				};

				//controller manager
				this.__controllerManager = {

				};

				//filter manager
				this.__FilterManager = {

				};
			},

			_$registerController: function(name, fn){
				this.__controllerManager[name] = fn;
			},

			_$registerDirective: function(name, fn){
				this.__directiveManager[name] = fn;
			},


			_$compile: function(element){
				var
					directiveNames = this.__collectDirectives(element),
					directive,
					linkFns = [],
					createChildModel,
					attr = getAttr(element);

				u._$forEach(directiveNames, function(name){
					directive = this.__directiveManager[name];
					if(u._$isFunction(directive)){
						directive = new directive();
					}
					//create child model
					if(directive._$model === true){
						createChildModel = true;
					}

					if(u._$isFunction(directive._$compile)){
						directive._$compile(element, attr);
					}

					if(u._$isFunction(directive._$link)){
						linkFns.push(directive._$link);
					}	
					

				}, this);

				u._$forEach(u._$getChildElements(element), function(childElement){
					linkFns.childLinkFns = linkFns.childLinkFns || [];
					linkFns.childLinkFns.push(this._$compile(childElement));
				}, this);

				
				


				return function(model){
					
					var
						attr = getAttr(element);

					if(createChildModel === true){
						model = model._$new();
					}

					u._$forEach(linkFns.childLinkFns, function(childLinkFn){
						childLinkFn.call(this, model);
					}, this);
					u._$forEachReverse(linkFns, function(linkFn){
						linkFn.call(this, element, attr, model);
					}, this);
					
				}
				
			},

			__collectDirectives: function(element){
				var
					attrs = getAttr(element),
					ret = [];
				u._$forEach(attrs, function(value, name){

					if(this.__directiveManager[name] != undefined){
						ret.push(name);
					}
				}, this);
				return ret;
			}

		}),
		instance = new Compiler();


	//gt-controller	
	instance._$registerDirective('gtController', {
		scope: true,
		_$link: function(element, attr, model){
			var
				controllerName = attr.gtController,
				controllerFn = instance.__controllerManager[controllerName];
			if(u._$isFunction(controllerFn)){
				controllerFn.call(this, model);
				model._$digest();
			}
		}
	});

	return instance;
})