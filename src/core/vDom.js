define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util',
	'gitjs/core/gitDiff'
],function(EventEmitter, u, gitDiff){
	var
		map = {

		};
	var
		VDom = EventEmitter._$extend({
			
			__init: function(options){

				var
					gitId = u._$uniqueID();

				this.__super(options);

				map[gitId] = this;

				this.__dom = null;//refer to reality dom

				this.attributes = [];

				this.childNodes = [];

				this.className = '';

				//this.firstChild = null;

				this.id = null;

				this.innerHTML = null;

				//this.lastChild = null;

				//this.nextSibling = null;

				this.nodeName = null;

				this.nodeType = options.nodeType;

				this.nodeValue = null;

				this.parentNode = null;

				//this.previousSibling = null;

				this.tagName = options.tagName;

				this.text = options.text;


				this.__gitId = gitId;

				this.setAttribute('gitId', gitId);

				this.__grade = 0;
				this.__index = 0;
			},

			_$getDom: function(){
				return this.__dom;
			},

			_$setDom: function(dom){
				this.__dom = dom
			},

			_$getGitId: function(){

				return this.__gitId;

			},

			_$setGitId: function(gitId){
				this.__gitId = gitId;
				this.setAttribute('gitId', gitId);
			},

			
			_$index: function(){
				var
					index;

				if(!this.parentNode){
					index = -1;
				}else{
					/*if(this.__index == undefined){
						u._$forEach(this.parentNode.childNodes, function(node, i){
							if(node == this){
								index = i;
								this.__index = i;
								return true;
							}
						}, this)
					}else{
						return this.__index;
					}*/
					return this.__index;
						
				}

				return index;
			},

			_$setIndex: function(index){
				this.__index = index;
			},

			_$getIndex: function(){
				return this.__index;
			},

			_$setGrade: function(grade){
				this.__grade = grade;
			},

			_$updateGrade: function(){
				
				this._$setGrade(this.parentNode ? this.parentNode._$getGrade() + 1 : 0);
				
				u._$forEach(this.childNodes, function(cNode){
					cNode._$updateGrade();
				});
			},

			_$getGrade: function(){
				return this.__grade;
			},

			_$firstChild: function(){
				return this.childNodes[0];
			},

			_$lastChild: function(){
				var
					childNodes = this.childNodes;
				return childNodes[childNodes.length - 1];
			},

			_$previousSibling: function(){
				var
					index = this._$index(),
					siblings = this.parentNode.childNodes;
				return siblings[index - 1];
			},

			_$nextSibling: function(){
				var
					index = this._$index(),
					siblings = this.parentNode.childNodes;
				return siblings[index + 1];
			},


			appendChild: function(node){
				var
					lastChild = this._$lastChild();
				this.childNodes.push(node);
				node.parentNode = this;

				node._$updateGrade();
				node._$setIndex(this.childNodes.length - 1);

				gitDiff._$add(this, 'appendChild', {
					type: 'appendChild',
					node: node
				});
			},

			cloneNode: function(){

			},

			getAttribute: function(name){
				var
					ret;

				u._$forEach(this.attributes, function(attrNode){
					var
						value = attrNode[name];
					if(value != undefined){
						ret = value;
						return true;
					}	
				});

				return ret;
			},

			getElementsByTagName: function(name){
				var
					ret = [];
				u._$forEach(this.childNodes, function(node){
					ret = ret.concat(node.getElementsByTagName(name));
					if(name == node.tagName || name == '*'){
						ret.push(node);
					}
				});

				return ret;
			},

			hasAttibute: function(name){
				var
					ret = false;
				u._$forEach(this.attributes, function(attr){
					if(attr[name]){
						ret = true;
						return true;
					}	
				});

				return ret;
			},

			hasAttibutes: function(){

				return this.attributes.length > 0 ? true : false;
			},

			hasChildNodes: function(){

				return this.childNodes.length > 0 ? true : false;
			},

			_$updateChildrenIndex: function(start, width){
				var
					i,
					childNode;
				start = start || 0;
				width = width || 1;

				for(i = start; i < this.childNodes.length; i ++ ){
					childNode = this.childNodes[i];
					childNode._$setIndex(childNode._$getIndex() + width);
				}
			},

			insertBefore: function(node){
				var
					parentNode = node.parentNode,
					index = node._$index();
					//previousSibling = this._$previousSibling(),
					//nextSibling = this._$nextSibling();
				this.parentNode = parentNode;
				this._$updateGrade();
				this._$setIndex(index);

				parentNode.childNodes.splice(index, 0, this);
				parentNode._$updateChildrenIndex(index + 1);
				
				/*this._$setMoved();
				previousSibling && previousSibling._$setMoved();
				nextSibling && nextSibling._$setMoved();
				node._$setMoved();*/


			},

			removeAttribute: function(name){

				u._$forEach(this.attributes, function(attr){
					var
						attrName = attr[name]
					if(attrName == name){
						delete attr;
						return true;
					}	
				});
			},

			removeChild: function(node){
				var
					childNodes = this.childNodes;
				u._$forEach(childNodes, function(childNode, i){
					if(node == childNode){
						
						childNodes.splice(i, 1);
						this._$updateChildrenIndex(i);
						return true;
					}
				}, this);
			},

			replaceChild: function(newNode, oldNode){
				var
					childNodes = this.childNodes;
				u._$forEach(childNodes, function(childNode, i){
					if(oldNode == childNode){

						childNodes.splice(i, 1, newNode);

						newNode.parentNode = this;
						newNode._$updateGrade();
						newNode._$setIndex(i);

						return true;
					}
				}, this)
			},

			setAttribute: function(name, value){
				
				this.attributes.push({
					name: name,
					value: value
				});

				if(name == 'class'){
					this.className = value;
				}

			},

			createElement: function(name){
				return new this({
					tagName: name,
					nodeType: 1
				})
			},

			createTextNode: function(){
				return new this({
					tagName: 'text',
					nodeType: 3
				})
			}
			

		});

	VDom._$get = function(gid){
		return map[gid];
	}
	return VDom;
})