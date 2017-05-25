define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util',
	'gitjs/element/element'
],function(EventEmitter, u, $){
	var
		GitDiff = EventEmitter._$extend({
			
			__init: function(){

				this.__super();

				//git repository
				this.__repository = {

				};

				//restore changing temporarily
				this.__cache = [];


			},

			_$get: function(){

				return this.__cache;
			},

			_$clear: function(){

				this.__cache = [];
			},

			_isEmpty: function(cache){
				var
					ret;
				u._$forEach(cache, function(val, key){
					if(u._$isArray(val) || u._$isObject(val)){
						ret = this._isEmpty(val);
					}else if(u._$isObject(cache) && cache.hasOwnProperty(key) || u._$isArray(cache)){
						ret = true;
					}
				}, this)

				return ret;
			},

			_getNodeCache: function(node){
				var
					nodeCache;
				u._$forEach(this.__cache, function(item){
					if(item.node == node){
						nodeCache = item;
						return true;
					}
				});

				if(!nodeCache){

					nodeCache = {
						node: node,
						cache: {}
					}
					this.__cache.push(nodeCache);
				}

				return nodeCache.cache;
					
			},

			_$add: function(node, type, data){

				var
					gitId = node._$getGitId(),
					nodeCache,
					actionQueue,
					actionData,
					actionType,
					appendChildCache, 
					dataIndex,
					i;

				/*if(gitId == undefined){
					throw new Error('the node add git diff has no gitId');
				}


				cache = this.__cache[gitId] = this.__cache[gitId] || {};
				cache.node = node;*/
				nodeCache = this._getNodeCache(node);

				switch(type){
					case 'css':
						actionType = 'css';

					case 'pro':
						actionType = 'property';


					case 'setAttribute':
					case 'getAttribute':
						actionType = 'attribute';

					case 'on':
					case 'off':
						actionType = 'event';

						actionQueue = nodeCache[actionType] = nodeCache[actionType] || {};

					break;

					case 'appendChild':
					case 'removeChild':
					case 'insertBefore':
					case 'replaceChild':
						actionType = 'move';

						actionQueue = nodeCache[actionType] = nodeCache[actionType] || [];
					break;

					default:
					break;
				}


				actionQueue.push(data);
				
				//dataIndex = this._$findDuplicatedIndex(actionQueue, data);

				/*switch(type){


					case 'appendChild':
					case 'removeChild':
 						
 						for(i == 0; i < actionQueue.length; i ++){

 							actionData = actionQueue[i];
 							if((actionData.type == 'appendChild' || actionData.type == 'removeChild') && actionData.node == data.node){
 								actionQueue.splice(i, 1);
 								i = i > 0 ? i -- : 0;
 							}
 						}

 						
 						actionQueue.push(data);

					break;

					case 'insertBefore':

						for(i == 0; i < actionQueue.length; i ++){

 							actionData = actionQueue[i];
 							if(actionData.type == data.type){
 								actionQueue.splice(i, 1);
 								break;
 							}
 						}
 						actionQueue.push(data);

					break;
					case 'replaceChild':
						for(i == 0; i < actionQueue.length; i ++){

 							actionData = actionQueue[i];
 							if(actionData.type == data.type && actionData.oldNode == data.oldNode){
 								actionQueue.splice(i, 1);
 							}
 						}

 						actionQueue.push(data);
						
					break;

					default:

					break;
				}*/

			},

			_$commit: function(){
				this._sortCache();
				this._cleanCache();
				this._commitCache();
				this._$clear();
			},

			//sort the cache: sort the commit queue from top to down and left to right by grade and index of the commit node
			_sortCache: function(){
				
				this.__cache.sort(function(a, b){
					var
						aNode = a.node,
						aGrade = aNode._$getGrade(),
						aIndex = aNode._$getIndex(),
						bNode = b.node,
						bGrade = bNode._$getGrade(),
						bIndex = bNode._$getIndex();
					return aGrade == bGrade ? aIndex - bIndex : aGrade - bGrade;
				})
			},
			
			_removeDuplicatedCache: function(commitNode, actionData){
				
				var
					type = actionData.type,
					relatedNode = actionData.node;
				u._$forEach(this.__cache, function(nodeCache){
					var
						compraingNode = nodeCache.node;
					nodeCache = nodeCache.cache;

					u._$forEach(nodeCache, function(queue, action){
						
						if(action == 'move'){
							u._$forEach(queue, function(actionData){

								//this._removeDuplicatedCache(node, actionData);
							
							}, this);
						}
					});
				});
				switch(type){
					case 'appendChild':

					break;
					case 'removeChild':
					break;
					case 'insertBefore':
					break;
					case 'replaceChild':
					break;
					default:
					break;
				}
				
			},

			//clean cache, calculate the fianal delta
			_cleanCache: function(){
				u._$forEachReverse(this.__cache, function(nodeCache, index){
					var
						node = nodeCache.node;
					nodeCache = nodeCache.cache;
					u._$forEach(nodeCache, function(queue, action){
						if(action == 'move'){
							u._$forEach(queue, function(actionData){

								this._removeDuplicatedCache(node, actionData);
							
							}, this);
						}
					}, this);
				}, this);
			},

			_commitCache: function(){

				u._$forEach(this.__cache, function(nodeCache){
					var
						commitNode = nodeCache.node,
						nodeCache = nodeCache.cache;
					
					if(!commitNode._$getDom()){
						this._connectRealDom(commitNode);
					}
					
					commitNode = $(commitNode);

					u._$forEach(nodeCache, function(typeQueue, action){
						
						//except the key of 'node' which is just for maintaining the commit node handler
						if(action == 'node') return;

						u._$forEach(typeQueue, function(data, key){
							
							var
								type = data.type,
								relatedNode = data.node;

							if(!relatedNode._$getDom()){
								this._connectRealDom(relatedNode);
							}

							relatedNode = $(relatedNode);

							switch(type){
								case 'appendChild':
									commitNode._$append(relatedNode);
								break;
								case 'removeChild':
									relatedNode._$remove();
								break;
								case 'insertBefore':
									commitNode._$before(relatedNode);
								break;
								case 'replaceChild':
								break;
								default:
								break;
							}
						}, this);

							
					}, this);

				}, this);
			
			},

			_creatRealDom: function(vDom){
				var
					tagName = vDom.tagName,
					attributes = vDom.attributes,
					rDom;
				if(tagName == 'document'){
					rDom = document;
				}else if(tagName == 'body' || tagName == 'head'){
					rDom = document[tagName];
				}else if(tagName == 'text'){
					rDom = document.createTextNode(vDom.text);
				}else{
					rDom = document.createElement(tagName);
					u._$forEach(attributes, function(attr){
						rDom.setAttribute(attr.name, attr.value);
					});
				}
				
				return rDom;
			},

			_connectRealDom: function(vDom){
				var
					rDom;
				
				rDom = this._creatRealDom(vDom);
				vDom._$setDom(rDom);
					
			}

		});

	return new GitDiff();
})