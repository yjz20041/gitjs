/**
 * @name 		Dom Class
 * @describe 	operate dom like jquery
 * @author 		yangjiezheng
 * @update 		2016-08-15
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


			/**
			 * @method	_$css
			 * @describe get or set css
			 * @param{String/Object} css name of the object of css map
			 * @param{String} css value
			 * @return{this}
			 */
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

			
			/**
			 * @method	_$position
			 * @describe get position relative parent node
			 * @return{Object}
			 */
			_$position: function(){
				var
					representive = this._$get(0);
				return {
					left: representive.offsetLeft,
					top: representive.offsetTop
				}

			},
			

			/**
			 * @method	_$offset
			 * @describe get offset relative client
			 * @return{Object}
			 */
			_$offset: function(){
				var
					representive = this._$get(0),
					rect = representive.getBoundingClientRect();
				return {
					left: rect.left,
					top: rect.top
				}
			},

			/**
			 * @method	_$width
			 * @describe get width
			 * @return{Int}
			 */
			_$width: function(){
				var
					representive = this._$get(0);
				return representive.offsetWidth;
			},

			/**
			 * @method	_$height
			 * @describe get height
			 * @return{Int}
			 */
			_$height: function(){
				var
					representive = this._$get(0);
				return representive.offsetHeight;
			},

			_bodyScrollTop: function(){
				return document.body.scrollTop || document.documentElement.scrollTop;
			},
			_bodyScrollLeft: function(){
				return document.body.scrollLeft || document.documentElement.scrollLeft;
			},

			/**
			 * @method	_$scrollTop
			 * @describe get scroll top
			 * @return{Int}
			 */
			_$scrollTop: function(){
				var
					representive = this._$get(0);
				return representive.scrollTop;
			},

			/**
			 * @method	_$scrollLeft
			 * @describe get scroll left
			 * @return{Int}
			 */
			_$scrollLeft: function(){
				var
					representive = this._$get(0);
				return representive.scrollLeft;
			},

			/**
			 * @method	_$innerWidth
			 * @describe get inner width excluding border
			 * @return{Int}
			 */
			_$innerWidth: function(){
				var
					representive = this._$get(0);
				return representive.clientWidth;
			},

			/**
			 * @method	_$innerHeight
			 * @describe get inner height excluding border
			 * @return{Int}
			 */
			_$innerHeight: function(){
				var
					representive = this._$get(0);
				return representive.clientHeight;
			},

			/**
			 * @method	_$outerWidth
			 * @describe get outer width including padding and border
			 * @return{Int}
			 */
			_$outerWidth: function(){
				var
					representive = this._$get(0);
				return representive.offsetWidth;
			},

			/**
			 * @method	_$outerHeight
			 * @describe get outer height including padding and border
			 * @return{Int}
			 */
			_$outerHeight: function(){
				var
					representive = this._$get(0);
				return representive.offsetHeight;
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