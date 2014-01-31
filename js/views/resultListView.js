define(['backbone', 'nearMeDataModel', 'helperFunctions', 'text!resultsTemplate', 'text!viewTypeTemplate', 'baseView', 'backboneEvents'], 
		function(Backbone, nearMeDataModel, helper, resultsTemplate, viewTypeTemplate, BaseView, backboneEvents) {
	
	var privateViewObj = {
		init : function(viewType, category) {
			//extend views from BaseView with over-ridden functions
			//and NOT from Backbone.View
			var ResultsListView = BaseView.extend({
				el : "#appContainer",

				model : nearMeDataModel.getModel(),

				initialize : function() {
					this.$el.html("<div id='mapContainer'></div><div id='resultsContainer'></div>");
					
					//this.model.on("change:location", this.locationChanged, this);
					this.model.on("change:places", this.renderResults, this);
					// var eventObj = backboneEvents.getEventPipeline();
					// eventObj.on("searchResponseUpdated", this.renderResults, this);
					this.model.on("change:viewType", this.viewTypeChanged, this);

					nearMeDataModel.setViewType(this.constructor.arguments[0].viewType);
					nearMeDataModel.setSearchType(this.constructor.arguments[0].category);

					this.renderResults();
				},

				events : {
					"click #view-type-container" : "changeView"
				},

				changeView : function(e) {
					var viewType = $(e.target).closest("#changeView").attr("data-viewType");
					this.model.set("viewType", viewType);
				},

				renderResults : function() {
					console.log("here map");
					this.$el.find("#resultsContainer").html(_.template($(resultsTemplate).html(), {
																									places: this.model.get("places"),
																									viewType : this.model.get("viewType"),
																									placesStatus : this.model.get("placesStatus"),
																									locationStatus : this.model.attributes.location.statusCode
																									}
					));
					this.$el.prepend(_.template($(viewTypeTemplate).html(), { viewType : this.model.get('viewType') }));
				
					nearMeDataModel.destroyMap();					
				},

				viewTypeChanged : function() {
					var that = this,
						url = "results/"+ that.model.get("viewType") +"/" + that.model.get("category");

					require(['backboneRouter'], function(router){
						router.navigate(url, true, true);
					});	
					
				}
			});

			return new ResultsListView({viewType : viewType, category : category});
		}
	};

	//the object exposed outside
	var viewObj = {
		render : function(viewType, category) {
			var view = privateViewObj.init(viewType, category);
			//view.render();

			return view;
		}
	};

	return viewObj;

});