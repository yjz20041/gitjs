define(['./clazz'], function(Clazz){
	var
		EventEmitter = Clazz(),
		pro = EventEmitter.prototype;

	pro.__init = function(options){
		console.log(123)
	}



	return EventEmitter;

})