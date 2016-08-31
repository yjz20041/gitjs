define([
	'./eventEmitter',
	'../util/util',
	'./directive',
	'../element/element'
],function(EventEmitter, u, Directive, $){

	var
		OPERATOR = {
			'true': function(){return true;},
    		'false': function(){return false;},
			'+': function(scope, left, right){
				
				if(left == undefined){
					return right(scope);
				}else{
					return left(scope) + right(scope);
				}
				
			},

			'-': function(scope, left, right){
				
				if(left == undefined){
					return - right(scope);
				}else{
					return left(scope) - right(scope);
				}
				
			},

			'*': function(scope, left, right){				
				return left(scope) * right(scope);				
			},

			'/': function(scope, left, right){				
				return left(scope) / right(scope);				
			},

			'%': function(scope, left, right){				
				return left(scope) % right(scope);				
			},

			'&&': function(scope, left, right){				
				return left(scope) && right(scope);				
			},

			'||': function(scope, left, right){				
				return left(scope) || right(scope);				
			},

			'==': function(scope, left, right){				
				return left(scope) == right(scope);				
			},

			'!==': function(scope, left, right){				
				return left(scope) !== right(scope);				
			},

			'>': function(scope, left, right){				
				return left(scope) > right(scope);				
			},

			'>=': function(scope, left, right){				
				return left(scope) >= right(scope);				
			},

			'<': function(scope, left, right){				
				return left(scope) < right(scope);				
			},

			'<=': function(scope, left, right){				
				return left(scope) <= right(scope);				
			},

			'!': function(scope, left){				
				return !left(scope);				
			}
		}
	var
		Lexer = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);
				
			},

			_peek: function(num){
				num = num || 1;
				if(this.__index + num < this.__text.length){
					
					return this.__text.charAt(this.__index + num);
				}
				return undefined;
			},

			_is: function(chars, ch){
				return chars.indexOf(ch || this.__ch) >= 0;
			},

			_isWhite: function(ch){
				return ch == ' ' || ch == '\n' || ch == '\r' || ch == '\t' || ch == '\v';
			},

			_isNumber: function(ch){
				return ch >= '0' && ch <= '9';
			},

			_isString: function(ch){
				return ch == '\'' || ch == '\"';
			},

			_isIdent: function(ch){
				return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch == '_';
			},

			_$lex: function(text){
			

				var
					ch1,
					ch2,
					ch3;

				this.__tokens = [];
				this.__text = text;
				this.__length = text.length;
				this.__index = 0,
				this.__ch = undefined;

				while(this.__index < this.__length){
					this.__ch = text.charAt(this.__index);

					if(this._isNumber(this.__ch)){
						this.__readNumber(this.__ch);
					}else if(this._isString(this.__ch)){
						this.__readString(this.__ch);
					}else if(this._isIdent(this.__ch)){
						this.__readIdent(this.__ch);
					}else if(this._isWhite(this.__ch)){
						this.__index ++;
						continue;
					}else if(this._is('(){}[],.:?;')){
						this.__tokens.push({
							index: this.__index,
							text: this.__ch
						});
						this.__index ++;
					}else if(this._is('|&>=<+-*/%!')){
						ch1 = this.__ch;
						ch2 = ch1 + this._peek();
						ch3 = ch2 + this._peek(2);
						if(OPERATOR[ch3]){
							
							this.__tokens.push({
								index: this.__index,
								text: ch3,
								fn: OPERATOR[ch3]
							})
							this.__index += 3;
						}else if(OPERATOR[ch2]){							
							this.__tokens.push({
								index: this.__index,
								text: ch2,
								fn: OPERATOR[ch2]
							});
							this.__index += 2;
						}else{
							this.__tokens.push({
								index: this.__index,
								text: ch1,
								fn: OPERATOR[ch1]
							});
							this.__index ++;
						}
					}
				}

				return this.__tokens;
			},

			__readNumber: function(ch){

				var
					index = this.__index,
					text = ch;

				
				while(this.__index < this.__length){
					ch = this._peek();
					if(this._isNumber(ch) || ch == '.' && this._isNumber(this._peek(2))){
						text += ch;
						this.__index ++;
					}else{
						break;
					}
				}

				this.__index ++;

				this.__tokens.push({
					index: index,
					text: text,
					fn: function(){
						return 1 * text;
					}
				});
			},

			__readString: function(ch){
				var
					index = this.__index,
					text = ch,
					quotes = ch,
					isEscape = false;

				while(this.__index < this.__length){
					
					ch = this._peek();
					text += ch;
					this.__index ++;
					
					if(ch == quotes && !isEscape){
					
						break;
					
					}else if(ch == '\\'){

						isEscape  = true;						
						continue;
					
					}else{
						isEscape = false;
					}
						
				}

				this.__index ++;

				this.__tokens.push({
					index: index,
					text: text,
					fn: function(){
						return  text;
					}
				});
			},

			__readIdent: function(ch){
				var
					index = this.__index,
					text = ch;

				while(this.__index < this.__length){

					ch = this._peek();
					
					//type: a[0] / a.b.c / a['b'] / a["b"] 
					if(this._isIdent(ch) || this._is('.[]\"\'', ch) || this._isNumber(ch) ){
						text += ch;
						this.__index ++;
					}else{
						break;
					}
				}

				this.__index ++;
				
				this.__tokens.push({
					index: index,
					text: text,
					fn: text == 'true' || text == 'false' ? OPERATOR[text] :  function(scope){
						var
							ret = undefined,
							val = scope;

						u._$forEach(text.split(/[\.\[]/), function(key){

							key = key.replace(/\]/, '');

							val = val[key];
							if(val == undefined){
								return true;
							}else{
								ret = val;
							}
						});
						return ret;
					}
				});

			}

			

		});

	var
		Parser = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);

				
			},

			_$parse: function(text){
				var
					fn;
				this.__lexer = new Lexer();
				this.__tokens = this.__lexer._$lex(text);
				fn  = this._statements();

				return fn;
			},

			
			_peekToken: function(){

				return this.__tokens[0];
			},

			_peek: function(e1, e2, e3, e4){
				var
					token = this._peekToken();
				if(token && (token.text == e1 || token.text == e2 || token.text == e3 || token.text == e4 || e1 == undefined)){
					return token;
				}else{
					return null;
				}
			},

			_expect: function(e1, e2, e3, e4){
				var
					token = this._peek(e1, e2, e3, e4);
				if(token){
					this.__tokens.shift();
					return token;
				}else{
					return null;
				}
			},

			_unaryFn: function(operator, right){
				
				return function(scope){
					return operator(scope, right);
				}
			},

			_binaryFn: function(left, operator, right){
				return function(scope){
					return operator(scope, left, right);
				}
			},

			_ternaryFn: function(left, middle, right){
				return function(scope){
					return left(scope) ? middle(scope) : right(scope);
				}
			},

			_statements: function(){
				
				return this._expression();

			},

			_expression: function(){
				var
					left = this._assignment();
				return left;
			},

			_assignment: function(){
				var
					left = this._ternary();
				return left;
			},

			_ternary: function(){
				var
					left = this._logicalOr(),
					token;

				if(token = this._expect('?')){
					middle = this._assignment();
					if(this._expect(':')){
						return this._ternaryFn(left, middle, this._assignment())
					}
				}

				return left;

			},

			_logicalOr: function(){
				var
					left = this._logicalAnd(),
					token;
				while(token = this._expect('||')){
					left = this._binaryFn(left, token.fn, this._logicalOr());
				}

				return left;
			},

			_logicalAnd: function(){
				var
					left = this._equality(),
					token;
				while(token = this._expect('&&')){
					left = this._binaryFn(left, token.fn, this._logicalAnd());
				}

				return left;
			},

			_equality: function(){
				var
					left = this._relational(),
					token;
				while(token = this._expect('==', '===', '!=', '!==')){
					left = this._binaryFn(left, token.fn, this._equality());
				}

				return left;
			},

			_relational: function(){
				var
					left = this._additive(),
					token;
				while(token = this._expect('>', '<', '>=', '<=')){
					left = this._binaryFn(left, token.fn, this._relational());
				}

				return left;
			},

			_additive: function(){
				var
					left = this._muliplitive(),
					token;
				while(token = this._expect('+', '-')){
					left = this._binaryFn(left, token.fn, this._muliplitive());
				}

				return left;
			},

			_muliplitive: function(){
				var
					left = this._unary(),
					token;
				while(token = this._expect('*', '/', '%')){
					left = this._binaryFn(left, token.fn, this._unary());
				}

				return left;
			},

			_unary: function(){
				var
					left = this._primary(),
					token;
				while(token = this._expect('!')){
					left  = this._unaryFn(token.fn, this._unary());
				}

				return left;
			},

			_primary: function(){
				var
					left,
					token = this._peekToken(),
					text = token.text;
				if(this._expect('(')){

				}else if(this._expect('{')){

				}else if(this._expect('[')){
					//
				}else{

					left = this._expect().fn; 
				}

				return left;
			}

			
		});
	
	/*var
		parser = new Parser();

	 console.log(parser._$parse('\"123\"')({
	 	a: {
	 		b: [1,2,3,4]
	 	}
	 }))*/

	
	


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
						directive._$compile(element, _$attr);
					}

					if(u._$isFunction(directive._$link)){
						linkFns.push(directive._$link);
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
						linkFn.call(this, element, _$attr, model);
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

		}),
		instance = new Compiler();


	//gt-controller	
	instance._$registerDirective('gtController', {
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

	instance._$registerDirective('gtBind', Directive._$extend({
		_$link: function(element, attr, model){
			var
				key = attr['gtBind'];

			this.__super(element, attr, model);

			model._$on(key, function(newVal, oldVal){

				element.innerText = newVal;	
			});
			
			
		}
	}));

	instance._$registerDirective('gtInterpolator', Directive._$extend({
		_$priority: -100,
		_$link: function(node/*textNode or attrNode*/, attr, model){
			var
				key = attr['gtInterpolator'];

			this.__super(node, attr, model);

			model._$on(key, function(newVal, oldVal){
				attr.value = newVal;//don't forget to update attr
				node.nodeType == 3 ? node.nodeValue = newVal : node.value = newVal;	
			});
			
			
		}
	}));

	return Compiler;
})