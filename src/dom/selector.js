/**
 * @name 		Selector Class
 * @describe 	select dom from document tree or virtual dom tree
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
		regSplit = /(\w+)?(#|\.)?\w+(\[\w+=?(\w+)?\])?(:\w+)?(\s*>\s*)?/g,

		// 1 tag name
		// 2 flag; 
		// 3 tag value: id/class/tag
		// 5 attr name
		// 6 attr value
		// 8 pseudo
		// 9 parent
		regFragment = /^(\w+)?(#|\.)?(\w+)?(\[(\w+)=?(\w+)?\])?(:(\w+))?(\s*>\s*)?$/,

		Selector = EventEmitter._$extend({
			
			__init: function(options){
				this.__super();

				this.__selectors = options.selectors;
				this.__context = options.context;

				if(typeof this.__context == 'string'){
					this.__context = this._$find(this.__context, document)._$get();
				}

				if(u._$isDom(this.__selectors)){
					this.__dom = this.__selectors;
				}else{

					this.__dom = this._$find(this.__selectors, this.__context) || [];
				}
					


				//temp dom container
				this._finding = [];

			},

			/**
			 * @method	_$find
			 * @describe find dom according to the selectors and context
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
					u._$forEach(context, function(node){
						this._finding = this._finding.concat(u._$getDomDescends(node));
					}, this);
				}else{
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
					u._$forEach(this._finding, function(dom){

						if(this._judge(dom, tagName, flag, tagValue, attrName, attrValue, pseudo, isParent, i == parts.length - 1)){
							temp.push(dom);
						}
						
					}, this);


					this._finding = temp;

				}


				return this._finding;

			},

			/**
			 * @method	_judge
			 * @describe judge a dom if conform the specified selector
			 * @param{Dom} the dom to be judged
			 * @return{Void}
			 */
			_judge: function(dom, tagName, flag, tagValue, attrName, attrValue, pseudo, isParent, self){
				var
					ret;


				if(self === true){

					dom.findingStart = dom;
					
					return this._judgeFlag(dom.findingStart, tagName, flag, tagValue) && this._judgeAttr(dom.findingStart, attrName, attrValue);
				
				}else if(isParent){
					dom.findingStart = dom.findingStart.parentNode;


					
					return this._judgeFlag(dom.findingStart, tagName, flag, tagValue) && this._judgeAttr(dom.findingStart, attrName, attrValue);
				
				}else{
					
					ret = false;
					
					
					while(dom.findingStart.parentNode){
						
						dom.findingStart = dom.findingStart.parentNode;
					
						//stop judging if parentnode is __context
						if(dom.findingStart == this.__context){
							break;
						}
						if(this._judgeFlag(dom.findingStart, tagName, flag, tagValue) && this._judgeAttr(dom.findingStart, attrName, attrValue)){
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
			 * @param{Dom} dom judged
			 * @param{tagName} html tag or undefined
			 * @param{flag} ./#/undefined
			 * @param{tagValue} className Id or html tag
			 * @return{Boolean} if the dom is passed the flag judge
			 */
			_judgeFlag: function(dom, tagName, flag, tagValue){

				var
					domTag =  dom.tagName.toLowerCase();



				if(tagName && domTag != tagName){
					return false;
				}


				return (flag == '.' && (new RegExp('^\\s*' + tagValue + '\\s*$')).test(dom.className)
					|| flag == '#' && dom.id == tagValue
					|| !flag && domTag == tagName);
			},

			/**
			 * @method	_judgeAttr
			 * @describe filter doms with the attribute of the dom
			 * @param{Dom} dom judged
			 * @param{String} attribute name
			 * @param{String} attribute value
			 * @return{Boolean} if the dom is passed the flag judge
			 */
			_judgeAttr: function(dom, attrName, attrValue){

				return attrName && !attrValue && dom.getAttribute(attrName) != undefined 
					|| attrName && attrValue && attrValue == dom.getAttribute(attrName)
					|| !attrName && !attrValue;
			},


			_judgePseudo: function(dom, pseduo){
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
			 * @describe return the dom found
			 * @return{Array} 
			 */
			_$getDom: function(){

				return this.__dom;
			}

		});

	return Selector;

});