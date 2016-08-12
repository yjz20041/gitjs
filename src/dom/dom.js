/**
 * @name 		Dom Class
 * @describe 	operate dom like jquery
 * @author 		yangjiezheng
 * @update 		2016-08-11
 *
 */

define([
	'../core/eventEmitter',
	'../util/util',
	'./selector'
],

function(EventEmitter, u, Selector){

	var
		cache = {},
		Dom = EventEmitter._$extend({
			
			__init: function(options){
				this.__super();
								

				this.__selectors = options.selectors;
				this.__context = options.context || document;

				this.__domSelector = new Selector({
					selectors: this.__selectors,
					context: this.__context
				});

				this.__dom = this.__domSelector._$getDom(); 
				
			},

			_$get: function(index){
				return index != undefined ? this.__dom[index] : this.__dom;
			},


			//css
			_$css: function(cssName, cssValue){

				var
					ret;
				
				u._$forEach(this._$get(), function(dom){

					if(u._$isObject(cssName)){
						u._$forEach(cssName, function(value, key){
							this._setCss(dom, key, value)
						}, this);
					}else if(cssValue != undefined){
						this._setCss(dom, cssName, cssValue)
					}else{
						ret = u._$GetCurrentStyle(dom, cssName);
						return true;
					}

				}, this);

				if(cssValue == undefined){
					return ret;
				}
				
				return this;	
							
			},

			_setCss: function(dom, cssName, cssValue){
				if(cssValue != undefined){
					dom.style[cssName] = cssValue;
				}else{
					u._$removeInlineStyle(dom, [cssName]);
				}
					
			},

			_getCss: function(key){

			},

			_$position: function(){

			},
			_$offset: function(){

			},
			_$width: function(){

			},
			_$height: function(){

			},
			_$scrollTop: function(){

			},
			_$scrollLeft: function(){

			},
			_$innerWidth: function(){

			},
			_$innerHeight: function(){

			},
			_$outerWidth: function(){

			},
			_$outerHeight: function(){

			},


			//attr
			_$attr: function(key, value){

			},

			_$removeAttr: function(key){

			},


			//prop
			_$prop: function(key, value){

			},

			_$removeProp: function(key){

			},


			//event
			_$on: function(type, handler){

			},

			_$off: function(type, handler){

			},

			_$trigger: function(type, data){

			},


			//class
			_$addClass: function(className){

			},

			_$removeClass: function(className){

			},

			_$hasClass: function(className){

			},


			//select
			_$find: function(selector){

			},
			_$eq: function(index){

			},
			_$first: function(){

			},
			_$last: function(){

			},
			_$prev: function(){

			},
			_$next: function(){

			},
			_$parent: function(){

			},
			_$parents: function(selector){

			},
			_$children: function(){

			},
			_$siblings: function(){

			},


			//move
			_$append: function(node){

			},
			_$appendTo: function(node){

			},

			_$prepend: function(node){

			},
			_$prependTo: function(node){

			},

			_$before: function(node){

			},
			_$after: function(node){

			},
			_$remove: function(){

			},
			_$clone: function(){

			},

			//decorate
			_$wrap: function(html){

			},
			_$unwrap: function(){

			}			

		});

	return function(selectors, context){
		if(!(selectors instanceof Dom)){
			return new Dom({
				selectors: selectors,
				context: context
			});
		}else{
			return selectors;
		}
	}

});