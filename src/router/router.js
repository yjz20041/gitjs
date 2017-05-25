define([
	'gitjs/core/eventEmitter',
	'gitjs/util/util',
	'gitjs/router/history',
	'gitjs/promise/promise',
	'gitjs/ajax/ajax',
	'gitjs/core/directive',
	'gitjs/core/compiler'
],function(EventEmitter, u, History, Promise, Ajax, Directive, Compiler){
	var
		history = new History(),
		
		views = {

		},

		Router = EventEmitter._$extend({
			
			__init: function(options){

				this.__super(options);

				this.__states = {

				};

				this._$bootstrap(options);
			},

			_$registerStates: function(states){
				
				u._$forEach(states, function(state, name){
					state.name = name;
					this.__states[name] = state;
				}, this);

			},

			_$bootstrap: function(config){
				
				config = config || {};

				this._$registerStates(config);

				history._$addEvent('onurlchange', this._$onUrlChange._$bind(this));

				history._$bootstrap();
			},

			_$onUrlChange: function(evt){

				var
					state = this.__states[evt.newValue.replace(/\/$/, '').replace(/\//g, '.')];
				this.__dispatchState(state);
			},

			__dispatchState: function(state){
				var
					stateChain = state.name.split('.'),
					statePromises = [],
					currentName = '';
				
				u._$forEach(stateChain, function(name, i){
					var
						state;

					currentName += i > 0 ? '.' + name : name;
					state = this.__states[currentName]

					if(!state.loaded){

						statePromises.push(Promise._$promise(function(){

							var
								loadingQueue = [],
								_this = this;

							if(state.controller){
								
								loadingQueue.push(function(){
									return new Ajax({
										url: state.controller
									})
								})									
							}

							if(state.templateUrl){
								
								loadingQueue.push(function(){
									return new Ajax({
										url: state.templateUrl
									})
								})									
							}
							Promise._$when.apply(Promise, loadingQueue)._$then(function(){
								_this._$resolve();

							}, function(){

								_this._$reject();

							});


						})._$then(function(){

							state.loaded = true;
						
						}, function(){

							u._$error('loading resource error');
							
						}))	
					}

				}, this);


				Promise._$when.apply(Promise, statePromises)._$then(function(){
					this.__currentState = state;
					this.__dispatchViews();

				}._$bind(this),function(){
					u._$error('loading state chain error');
				})
			},

			__dispatchViews: function(){

				var
					lastStateName = this.__lastState ? this.__lastState.name : '',
					lastStateNameArray = lastStateName.split('.'),
					currentStateName = this.__currentState.name,
					routeStateNameArray = currentStateName.split('.'),
					routeStateName = '',
					routeStateCount = 0,
					viewContent,
					i;
				u._$forEach(routeStateNameArray, function(name, i){
					var
						routeState,
						routeView;

					routeStateName += i > 0 ? '.' + name : name;
					routeStateCount ++ ;

					routeState = this.__states[routeStateName];

					routeView = views[routeState.view];

					if(lastStateName.indexOf(routeStateName) != 0){
						//update view
						if(routeState.template){
							viewContent = document.createElement('div');
							viewContent.innerHTML = routeState.template;
							(new Compiler())._$compile(viewContent)(routeView.model);
							
							routeView.element._$html('');
							routeView.element._$append(viewContent);
						}
					}

				}, this);

				//clear the invaluable views
				if(routeStateCount < lastStateNameArray.length){
					routeStateName = lastStateNameArray.slice(0, routeStateCount).join('.');
					for(i = routeStateCount; i < lastStateNameArray.length; i ++){
						routeStateName += '.' + lastStateNameArray[i];
						routeState = this.__states[routeStateName];
						routeView = views[routeState.view];
						routeView.element._$html('');
					}
				}

				this.__lastState = this.__currentState;
			}

			

		});


		Compiler._$registerDirective('gtView', Directive._$extend({
			
			_getViewName: function(element){
				var
					name = element._$attr('gt-view'),
					node = element[0],
					parentViewName;
				while(node.parentNode && (parentViewName = node.parentNode.getAttribute('gt-view')) != undefined){
					name = parentViewName + '.' + name;
					node = node.parentNode;
				}
				
				return name;
			},

			_$compile: function(element, attr){
				
				this.__super(element, attr);

				

			},

			_$link: function(element, attr, model){
				this.__super(element, attr, model);

				views[this._getViewName(element)] = {
					element: element,
					model: model
				};
				
			}
						

		}));

	return Router;
})