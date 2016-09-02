define([
	'./eventEmitter',
	'../util/util'
],function(EventEmitter, u){
	var
		VDom = EventEmitter._$extend({
			
			__init: function(){

				this.__super();

				this.attributes = [];

				this.childNodes = [];

				this.className = '';

				this.firstChild = null;

				this.id = null;

				this.innerHTML = null;

				this.lastChild = null;

				this.nextSibling = null;

				this.nodeName = null;

				this.nodeType = null;

				this.nodeValue = null;

				this.parentNode = null;

				this.previousSibling = null;


			},

			appendChild: function(dom){

			},

			cloneNode: function(){

			},

			getAttibute: function(){

			},

			getElementsByTagName: function(){

			},

			hasAttibute: function(){

			},

			hasAttibutes: function(){

			},

			hasChildNodes: function(){

			},

			insertBefore: function(){

			},

			removeAttribute: function(){

			},

			removeChild: function(){

			},

			replaceChild: function(){

			},

			setAttribute: function(){

			}
			

		});

	return VDom;
})