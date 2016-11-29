define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util',
	'gitjs/core/vDom'
],function(EventEmitter, u, VDom){


	var
		Lexer = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);


				this.__state = 'beginStartTag';
				this.__tagName = [];
				
			},


			_error: function(type){
				var
					message = '',
					i;
				for(i = -10; i < 10 ; i++){
					message += this._peek(i);
				}
				throw ('html syntax error at position' + this.__index + ' and constructor:' +  message + ' status: ' + type);
				this.__state = 'error';
			},

			_states: {
				
				
				beginStartTag: function(ch){
					var
						name;

					if(ch != '<'){
						//textNode
						this.__tokens.push({
							type: 'startTag',
							nodeType: 3,
							tagName: 'text',
							text: this.__readIdent(ch, function(ch){
								return ch != '<';
							})
						});
						this.__tokens.push({
							type: 'endTag',
							tagName: 'text'
						});
						this.__state = 'beginStartTag';

					}else if(ch == '<' && this._peek(1) == '/'){

						this.__state = 'beginEndTag';
						this.__index ++;


					}else if(ch == '<' && this._isIdent(this._peek(1))){
						
						name = this.__readIdent();


						this.__tokens.push({
							type: 'startTag',
							tagName: name,
							nodeType: '1'
						});

						this.__state = 'attribute';
						this.__tagName.unshift(name);

					}else {
						this._error('beginStartTag');
					}

				},

				attribute: function(ch){
					var
						tagName = this.__tagName[0],
						name,
						value = '',
						beginAttributeValue,
						singleQuotes,
						doubleQuotes;	

					// /> transfer to endEndTag status
					if(ch == '/' && this._is('>', this._peek(1)) && (tagName == 'img' || tagName == 'input') ){
						
						this.__state = 'endSelfEndTag';
						return;

					}
					// > transfer to beginStartTag status
					else if(ch == '>'){
			
						this.__state = 'beginStartTag';
						return;

					}else if(this._isIdent(ch)){

						name = this.__readIdent(ch);
					
					}				
					
					while(this.__index < this.__length){

						ch = this._peek(1);

						if(ch == '/' && this._is('>', this._peek(1)) && (tagName == 'img' || tagName == 'input') ){
						
							this.__state = 'endSelfEndTag';
							break;

						}
						// > transfer to endStartTag status
						else if(ch == '>'){
							this.__state = 'endStartTag';
							break;

						}
						else if(!beginAttributeValue){

							if( this._isWhite(ch) ){

								this.__index ++;
								continue;

							}else if(this._isIdent(ch)){

								this.__state = 'attribute';
								break;

							}else if(ch == '='){

								beginAttributeValue = true;
								this.__index ++;

							}else{
								this._error('!beginAttributeValue');
								break;
							}
								
						}else if(beginAttributeValue){

							
							if(!singleQuotes && !doubleQuotes){


								if( this._isWhite(ch) ){

									this.__index ++;
									continue;

								}else if(ch == '\''){

									singleQuotes = true;
									this.__index ++;

								}else if(ch == '\"'){

									doubleQuotes = true;
									this.__index ++;

								}else{
									this._error('beginAttributeValue');
									break;
								}
							}else{
								
								value = this.__readIdent('', function(ch){

									return ch != (singleQuotes ? '\'' : '\"');
								});

								this.__state = 'attribute';
								this.__index ++;
								break;

							}
							

						}else{
							this._error('attribute');
							break;
						}
					}
					this.__tokens.push({
						type: 'attribute',
						name: name,
						value: value
					});

				},

				endStartTag: function(ch){

					this.__state = 'beginStartTag';
					
				},

				beginEndTag: function(ch){
					
					name = this.__readIdent(ch);

					if(name == this.__tagName[0]){

						this.__state = 'endEndTag';

					}else{

						this._error('beginEndTag');
					}
						
				},

				endEndTag: function(ch){
					
					if(ch == '>'){
						this.__state = 'beginStartTag';	
										
						this.__tokens.push({
							type: 'endTag',
							tagName: this.__tagName[0]
						});

						this.__tagName.shift();
					}else{
						this._error('endEndTag');
					}
				},

				endSelfEndTag: function(ch){
					this.__state = 'beginStartTag';					
					this.__tokens.push({

						type: 'endTag',
						tagName: this.__tagName[0]
					});
					this.__tagName.shift();
				}

			},

			_peek: function(num){
				num = num || 0;
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

			_isNotWhite: function(ch){
				return !this._isWhite(ch);
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
							

				this.__tokens = [];
				this.__text = text;
				this.__length = text.length;
				this.__index = 0,
				this.__ch = undefined;


				while(this.__index < this.__length && this.__state != 'error'){
					
					this.__ch = this._peek();
					
					if(this._isWhite(this.__ch)){

						this.__index ++;
						continue;

					}else{

						this._states[this.__state].call(this, this.__ch);
						this.__index ++;
					}
					
				}

				return this.__tokens;
			},

			

			__readIdent: function(ch, _is){
				var
					index = this.__index,
					text = ch || '';
				
				_is = _is || this._isIdent;

				while(this.__index < this.__length){
					
					ch = this._peek(1);
					
					if(_is.call(this, ch)){
						text += ch;
						this.__index ++;
					}else{
						break;
					}															
				}

				return text;
			}




		});



	var
		HtmlParser = EventEmitter._$extend({
			
			__init: function(){

				this.__super();

				
			},

			_$parse: function(text){
				var
					fn;
				this.__lexer = new Lexer();
				this.__tokens = this.__lexer._$lex(text);
				fn  = this._statements();
				return fn;
			},

			_statements: function(){
				
				return this._consume();
			},

			_consume: function(){
				var
					token,
					parentNode = [],
					node,
					type,
					tagName,
					nodeType,
					attrName,
					attrValue,
					text;


				while(this.__tokens.length){

					token = this.__tokens.shift();

					type = token.type;

					if(type == 'startTag'){

						node = new VDom(token);
						if(parentNode[0]){
							parentNode[0].appendChild(node);
						}
						parentNode.unshift(node);

					}else if(type == 'attribute'){

						attrName = token.name;
						attrValue = token.value;
						node.setAttribute(attrName, attrValue);

					}else if(type == 'endTag'){
						node = parentNode.shift();
					}

				}

				return node;
									
			}

		});



	return HtmlParser;
})