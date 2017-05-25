define(function(){
	
	return function(event){
		this.srcEvent = event;
		this.target = event.target || event.srcElement;
		this.type = event.type;
		this.keyCode = event.keyCode || event.which;
		this.pageX = event.pageX || event.clientX + document.documentElement.scrollLeft;
		this.pageY = event.pageY || event.clientY + document.documentElement.scrollTop;
		this.preventDefault = event.preventDefault || function(){event.returnValue = false;};
		this.stopImmediate = function(){this.stopped = true;};
	}
})