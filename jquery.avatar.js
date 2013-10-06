(function($){

	var uploadData	= {}
	var initialized	= false;
	var selection	= {}

	var options		= {
		$img:		"",
		btnCrop:	"avatar-btn-doCrop",

		uploadURL:	"",
		uploadData:	{},
		uploadDone:	function(data){},
		uploadFail:	function(data){}
	}

	$.fn.avatar		= function(params){
		if( !initialized ) {
			// merge in supplied params to defaults

			options.$img	= this;
			$.extend( options, params );

			$target		= this;

			$target.on('dragenter', function(e) {
				e.preventDefault();
			})
			$target.on('dragover', function(e){
				e.preventDefault();
			})

			$target.on('dragout', function(e){
				e.preventDefault();
			})

			$target.on('drop',function(e){
				e.preventDefault();

				var file	= e.originalEvent.dataTransfer.files[0];
				if( !file.type.match(/image.*/)) {
					return false;
				}

				var reader	= new FileReader();
				reader.onload	= function(e){
					$target.on('load',function(e){
						console.log(e);

						$(this).Jcrop({
							aspectRatio:	1,
							minSize:		[25, 25],
							setSelect:		[0, 0, 100, 100],
							onSelect:		function(c){selection=c;}
						},function(){
							options.jcropAPI	= this;
						})
					})
					$target[0].src = e.target.result;
				}
				reader.readAsDataURL(file);

				var $btn = $("<button id='"+options.btnCrop+"'>Crop and Save</button>");
				$($btn).on('click',function(e){
					e.preventDefault();

					var $logo		= $target;
					var scale		= $logo.width() / $logo[0].naturalWidth;
					var postData	= {
						image:		{
							src:		$logo[0].src,
							width:		$logo.width() / scale,
							height:		$logo.height() / scale,
							scale:		scale
						},
						selection:	{
							x1:			selection.x / scale,
							y1:			selection.y / scale,
							x2:			selection.x2 / scale,
							y2:			selection.y2 / scale,
							w:			(selection.x2 - selection.x) / scale,
							h:			(selection.y2 - selection.y) / scale
						}
					}
					$.extend(postData, options.uploadData);

					$.ajax({
						url:		options.uploadURL,
						type:		'PUT',
						data:		postData
					})
					.done(function(data){
						options.uploadDone(data);
					})
					.fail(function(data){
						options.uploadFail(data);
					})
				});
				$btn.insertAfter($target);
			})

			initialized = true;
		}

		return this;
	}

})(jQuery)