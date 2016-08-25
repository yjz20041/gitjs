define([
	'./eventEmitter',
	'../util/util'
],function(EventEmitter, u){
	var

		Compiler = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);

				//direcitve manager
				this.__directiveManager = {

				};

				//filter manager
				this.__FilterManager = {

				};
			},

			_$registerController: function(name, fn){
				this.__directiveManager[name] = fn;
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


				return function(model){
					
					var
						attr = getAttr(element);

					if(createChildModel === true){
						model = model._$new();
					}

					u._$forEach(linkFns, function(linkFn){
						linkFn.call(this, element, attr, model);
					}, this);

					u._$forEach(linkFns.childLinkFns, function(childLinkFn){
						childLinkFn.call(this, model);
					}, this);
				}
				
			},

			__collectDirectives: function(element){
				var
					attrs = element.attributes,
					ret = [];

				u._$forEach(attrs, function(attr){
					if(this.__directiveManager[attr.name] != undefined){
						ret.push(attr.name);
					}
				}, this);
				return ret;
			}

		}),
		instance = new Compiler();

	return instance;
})