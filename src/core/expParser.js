define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util'
],function(EventEmitter, u){
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
			},

			'=': function(){}
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
					}else{
						u._$error('expression sythnax error:' + text);
						return null;
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
					index: index.replace,
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

							key = key.replace(/[\]\"\']/g, '');
	
							val = val[key];
							if(val == undefined){
								ret = undefined;
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
		ExpParser = EventEmitter._$extend({
			
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
				var left = this._ternary(),
			    	right,
			    	token;
			    if(token = this._expect('=')){
			      	if(!left.assign) {
			        	u._$error('implies assignment but can not be assigned to', token);
			      	}
			      	right = this._ternary();
			      	return function(scope){
			        	return left.assign(scope, right(scope));
			      	};
			    }
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

				left.assign = function(scope, right){
					var
						keys = text.split(/[\.\[]/);
					if(u._$isString(right)){
						right = right.replace(/[\"\']/g, '');
					}
					u._$forEach(keys, function(key, i){

						key = key.replace(/[\]\"\']/g, '');
						if( i == keys.length - 1){
							scope[key] = right;
						}else if(u._$isObject(scope) || u._$isArray(scope)){
							scope = scope[key];
						}
						
					});
				}

				return left;
			}

			
		});
	
	
	return ExpParser;
})