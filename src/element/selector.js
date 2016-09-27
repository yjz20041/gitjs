/**
 * @name 		Selector Class
 * @describe 	select element from document tree or virtual element tree
 * @author 		yangjiezheng
 * @update 		2016-08-12
 *
 */

define([
	'../core/eventEmitter',
	'../util/util'
	
],

function(EventEmitter, u){
	var
		regSplit = /([\w|\*]+)?(#|\.)?[\w|\*]+(\[\w+=?(\w+)?\])?(:\w+)?(\s*>\s*)?/g,

		// 1 tag name
		// 2 flag; 
		// 3 tag value: id/class/tag
		// 5 attr name
		// 6 attr value
		// 8 pseudo
		// 9 parent
		regFragment = /^([\w|\*]+)?(#|\.)?([\w|\*]+)?(\[(\w+)=?(\w+)?\])?(:(\w+))?(\s*>\s*)?$/,

		Selector = EventEmitter._$extend({
			
			__init: function(options){
				this.__super();

				this.__selectors = options.selectors;
				this.__context = options.context;

				if(typeof this.__context == 'string'){
					this.__context = this._$find(this.__context, document)._$get();
				}



				this.__elements = this._$find(this.__selectors, this.__context) || [];
				
					


				//temp element container
				this._finding = [];

			},

			/**
			 * @method	_$find
			 * @describe find element according to the selectors and context
			 * if the browser support querySelectorAll method, we will call it directly. 
			 * if not, call the private method _querySelectorAll.
			 * @param{String} selectors
			 * @param{Dom tree} context
			 * @return{Void}
			 */

			_$find: function(selectors, context){
				/*if(context.querySelectorAll){
					return context.querySelectorAll(selector);
				}else{
					return this._querySelectorAll(selector, context);
				}*/
				return this._querySelectorAll(selectors, context);
			},


			/**
			 * @method	_querySelectorAll
			 * @describe the substitute of the querySelectorAll method of document.
			 * the algorithm is similar with the original method: filter doms from right to left according to the selectors
			 * @param{String} selectors
			 * @param{Dom tree} context
			 * @return{Array} the result is store in private property _finding
			 */
			_querySelectorAll: function(selectors, context){
				var					
					parts = selectors.match(regSplit),
					part,
					fragment,
					//h1.class
					tagName,//h1
					flag,//.
					tagValue,//class
					
					//[key=value]
					attrName,//key
					attrValue,//value
					pseudo,//:visible
					isParent,// > 

					i = parts.length - 1,
					temp;

				this._finding = [];

				if(context instanceof Array){
					
					this._finding = context;

				}else{
					this._finding.push(context);
					this._finding = context.getElementsByTagName('*');
				}

				for(; i >= 0; i --){
					
					part = parts[i];
					fragment = regFragment.exec(part);
					tagName = fragment[1];
					flag = fragment[2];
					tagValue = fragment[3];
					attrName = fragment[5];
					attrValue = fragment[6];
					pseudo = fragment[8];
					isParent = fragment[9];

					temp = [];
					u._$forEach(this._finding, function(element){

						if(this._judge(element, tagName, flag, tagValue, attrName, attrValue, pseudo, isParent, i == parts.length - 1)){
							temp.push(element);
						}
						
					}, this);


					this._finding = temp;

				}


				return this._finding;

			},

			/**
			 * @method	_judge
			 * @describe judge a element if conform the specified selector
			 * @param{Dom} the element to be judged
			 * @return{Void}
			 */
			_judge: function(element, tagName, flag, tagValue, attrName, attrValue, pseudo, isParent, self){
				var
					ret;


				if(self === true){

					element.findingStart = element;
					
					return this._judgeFlag(element.findingStart, tagName, flag, tagValue) && this._judgeAttr(element.findingStart, attrName, attrValue);
				
				}else if(isParent){

					element.findingStart = element.findingStart.parentNode;
					
					return this._judgeFlag(element.findingStart, tagName, flag, tagValue) && this._judgeAttr(element.findingStart, attrName, attrValue);
				
				}else{
					
					ret = false;
					
					
					while(element.findingStart.parentNode){
						
						element.findingStart = element.findingStart.parentNode;
						
						//stop judging if parentnode is  document
						if(this.__context instanceof Array){
							
							if(element.findingStart == document){
								break;
							}							

						}else if(element.findingStart == this.__context){
							break;
						}
						

						

						if(this._judgeFlag(element.findingStart, tagName, flag, tagValue) && this._judgeAttr(element.findingStart, attrName, attrValue)){
							ret = true;
							break;
						}
					}

					return ret;
				}
				

				
			},

			/**
			 * @method	_judgeFlag
			 * @describe filter doms with the 'flag' and the constructor is like 'h1.head'. In this case, the 'h1' is the tagName,
			 * '.' is the flag and 'head' is the tagValue. In another case like '.head' which the tagName is undefined while the 
			 * the flag is '.' and the tagValue is 'head'.
			 * @param{Dom} element judged
			 * @param{tagName} html tag or undefined
			 * @param{flag} ./#/undefined
			 * @param{tagValue} className Id or html tag
			 * @return{Boolean} if the element is passed the flag judge
			 */
			_judgeFlag: function(element, tagName, flag, tagValue){

				var
					domTag =  element.tagName.toLowerCase();



				if(tagName && domTag != tagName && tagName != '*'){
					return false;
				}


				return (flag == '.' && (new RegExp('^\\s*' + tagValue + '\\s*$')).test(element.className)
					|| flag == '#' && element.id == tagValue
					|| !flag && (domTag == tagName) || tagName == '*');
			},

			/**
			 * @method	_judgeAttr
			 * @describe filter doms with the attribute of the element
			 * @param{Dom} element judged
			 * @param{String} attribute name
			 * @param{String} attribute value
			 * @return{Boolean} if the element is passed the flag judge
			 */
			_judgeAttr: function(element, attrName, attrValue){

				return attrName && !attrValue && element.getAttribute(attrName) != undefined 
					|| attrName && attrValue && attrValue == element.getAttribute(attrName)
					|| !attrName && !attrValue;
			},


			_judgePseudo: function(element, pseduo){
				//waitting... : )
			},


			/**
			 * @method	_getFragment
			 * @describe split the selector to fragments that can be recognize
			 * @param{selector} 
			 * @return{Array} 
			 */
			_getFragment: function(selector){

				return regFragment.exec(prevPart);
			},



			_$filter: function(filter){
				//waitting... : )
			},


			/**
			 * @method	_$getDom
			 * @describe return the element found
			 * @return{Array} 
			 */
			_$get: function(){

				return this.__elements;
			}

		});

	return Selector;

});