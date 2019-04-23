// == Application =========================

jQuery( document ).ready( function() {

	// Register App
	var app	= cmt.api.root.registerApplication( 'gallery', 'cmt.api.Application', { basePath: ajaxUrl } );

	// Map Controllers
	app.mapController( 'item', 'cmg.controllers.gallery.ItemController' );

	// Map Services
	app.mapService( 'item', 'cmg.services.gallery.ItemService' );

	// Register Listeners
	cmt.api.utils.request.register( app, jQuery( '[cmt-app=gallery]' ) );

	// Event Listeners
	app.getService( 'item' ).initListeners();
});

// == Controller Namespace ================

var cmg = cmg || {};

cmg.controllers = cmg.controllers || {};

cmg.controllers.gallery = cmg.controllers.gallery || {};

// == Service Namespace ===================

cmg.services = cmg.services || {};

cmg.services.gallery = cmg.services.gallery || {};

// == UI Guide ============================

/*
// An independent component to perform CRUD operations of gallery items.

.cmt-gallery-item-crud {

	.cmt-gallery-item-add {
		// Trigger to show the model form
	}

	.cmt-gallery-item-form {
		// The form container to add/update model

		.cmt-gallery-item-close {
			// Hides the add/update form
		}
	}

	.cmt-gallery-item-collection {
		// Collection of existing models

		.cmt-gallery-item {
			// Renders all the models either using PHP or viewTemplate by making call to get models and iterating the result set
			// Renders the model using viewTemplate after adding an model
			// Refresh and partial render the model using refreshTemplate after updating an model

			.cmt-gallery-item-header {
				// Header
			}

			.cmt-gallery-item-data {
				// Data
			}
		}
	}
}
*/

// == Item Controller =====================

cmg.controllers.gallery.ItemController = function() {

	this.app = cmt.api.root.getApplication( 'gallery' );

	this.modelService = this.app.getService( 'item' );
};

cmg.controllers.gallery.ItemController.inherits( cmt.api.controllers.RequestController );

cmg.controllers.gallery.ItemController.prototype.getActionSuccess = function( requestElement, response ) {

	var container	= this.modelService.findContainer( requestElement );
	var item		= requestElement.closest( '.cmt-gallery-item' );

	// Hide Actions
	requestElement.closest( '.actions-list-data' ).slideUp( 'fast' );

	// Show Update Form
	this.modelService.initUpdateForm( container, item, response.data );
};

cmg.controllers.gallery.ItemController.prototype.addActionSuccess = function( requestElement, response ) {

	var container = this.modelService.findContainer( requestElement );

	// Add Item to List
	this.modelService.add( container, response.data );
};

cmg.controllers.gallery.ItemController.prototype.updateActionSuccess = function( requestElement, response ) {

	var container	= this.modelService.findContainer( requestElement );
	var item		= container.find( '.cmt-gallery-item[data-id=' + response.data.mid + ']' );

	this.modelService.refresh( container, item, response.data );
};

cmg.controllers.gallery.ItemController.prototype.deleteActionSuccess = function( requestElement, response ) {

	var container	= this.modelService.findContainer( requestElement );
	var item		= container.find( '.cmt-gallery-item[data-id=' + response.data.mid + ']' );

	// Hide Actions
	requestElement.closest( '.actions-list-data' ).slideUp( 'fast' );

	this.modelService.remove( container, item );
};

// == Item Service ========================

cmg.services.gallery.ItemService = function() {

	this.addTemplate		= 'addItemTemplate';
	this.updateTemplate		= 'updateItemTemplate';
	this.viewTemplate		= 'itemViewTemplate';
	this.refreshTemplate	= 'itemRefreshTemplate';

	this.hiddenForm = true; // Keep form hidden when not in use
};

cmg.services.gallery.ItemService.inherits( cmt.api.services.BaseService );

cmg.services.gallery.ItemService.prototype.initListeners = function() {

	var self = this;

	var triggers = jQuery( '.cmt-gallery-item-add' );

	if( triggers.length == 0 ) {

		return;
	}

	triggers.click( function() {

		var container = jQuery( this ).closest( '.cmt-gallery-item-crud' );

		self.initAddForm( container );
	});
}

cmg.services.gallery.ItemService.prototype.initAddForm = function( container ) {

	var source 		= document.getElementById( this.addTemplate ).innerHTML;
	var template 	= Handlebars.compile( source );
	var data		= { };
	var output 		= template( data );

	var form = container.find( '.cmt-gallery-item-form' );

	// Hide View
	form.hide();

	// Append View
	form.html( output );

	// Init Request
	cmt.api.utils.request.registerTargetApp( 'gallery', form );

	// Init Uploader
	form.find( '.cmt-gallery-item-uploader' ).cmtFileUploader();

	// Init Listeners
	form.find( '.cmt-gallery-item-close' ).click( function() {

		form.fadeOut( 'fast' );
	});

	// Show View
	form.fadeIn( 'slow' );
}

cmg.services.gallery.ItemService.prototype.initUpdateForm = function( container, item, data ) {
	
	var self = this;

	var source 		= document.getElementById( this.updateTemplate ).innerHTML;
	var template	= Handlebars.compile( source );
	var output 		= template( data );

	var form = container.find( '.cmt-gallery-item-form' );

	// Hide View
	form.hide();

	// Append View
	form.html( output );

	// Init Request
	cmt.api.utils.request.registerTargetApp( 'gallery', form );

	// Copy image data
	form.find( '.file-data' ).html( item.find( '.cmt-gallery-item-data' ).html() );

	// Init Uploader
	form.find( '.cmt-gallery-item-uploader' ).cmtFileUploader();

	// Init Listeners
	form.find( '.cmt-gallery-item-close' ).click( function() {

		if( self.hiddenForm ) {

			form.fadeOut( 'fast' );
		}
		else {

			self.initAddForm( container );
		}
	});

	// Show View
	form.fadeIn( 'slow' );
}

cmg.services.gallery.ItemService.prototype.add = function( container, data ) {

	var source 		= document.getElementById( this.viewTemplate ).innerHTML;
	var template 	= Handlebars.compile( source );
	var output 		= template( data );
	var collection	= container.find( '.cmt-gallery-item-collection' );
	var item		= null;
	var layout		= cmt.utils.data.hasAttribute( container, 'data-layout' ) ? container.attr( 'data-layout' ) : null;

	// Add at first
	switch( layout ) {

		case 'cmt-layout-slider': {

			collection.cmtSlider( 'addSlide', output );
			
			item = collection.find( '.cmt-gallery-item[data-idx=0]' );

			break;
		}
		default: {

			collection.prepend( output );

			item = collection.find( '.cmt-gallery-item' ).first();
		}
	}

	// Init Request
	cmt.api.utils.request.registerTargetApp( 'gallery', item );

	// Init Actions
	cmt.utils.ui.initActionsElement( item.find( '.cmt-actions' ) );

	if( this.hiddenForm ) {

		container.find( '.cmt-gallery-item-form' ).fadeOut( 'fast' );
	}
	else {

		this.initAddForm( container );
	}
}

cmg.services.gallery.ItemService.prototype.refresh = function( container, item, data ) {

	var source 		= document.getElementById( this.refreshTemplate ).innerHTML;
	var template 	= Handlebars.compile( source );
	var output 		= template( data );

	item.find( '.cmt-gallery-item-header .title' ).html( data.title );
	item.find( '.cmt-gallery-item-data' ).replaceWith( output );

	if( this.hiddenForm ) {

		container.find( '.cmt-gallery-item-form' ).fadeOut( 'fast' );
	}
	else {

		this.initAddForm( container );
	}
}

cmg.services.gallery.ItemService.prototype.remove = function( container, item ) {

	var actions		= item.find( '.cmt-actions' );
	var collection	= container.find( '.cmt-gallery-item-collection' );
	var layout		= cmt.utils.data.hasAttribute( container, 'data-layout' ) ? container.attr( 'data-layout' ) : null;

	// Remove Actions
	if( actions.length > 0 ) {

		var index = actions.attr( 'data-idx' );

		// Remove Actions List
		jQuery( '#actions-list-data-' + index ).remove();
	}

	// Remove Item
	switch( layout ) {

		case 'cmt-layout-slider': {

			collection.cmtSlider( 'removeSlide', parseInt( item.attr( 'data-idx' ) ) );

			break;
		}
		default: {

			item.remove();
		}
	}
}

cmg.services.gallery.ItemService.prototype.findContainer = function( requestElement ) {

	var container = requestElement.closest( '.cmt-gallery-item-crud' );

	// Find in Actions
	if( container.length == 0 ) {

		var listData = requestElement.closest( '.actions-list-data' );

		if( listData.length == 1 ) {

			var identifier = listData.attr( 'data-idx' );

			var list = jQuery( '#actions-list-' + identifier );

			container = list.closest( '.cmt-gallery-item-crud' );
		}
	}

	return container;
}

// == Direct Calls ========================

// == Additional Methods ==================
