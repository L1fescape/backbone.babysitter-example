'use strict';
var Backbone = require('backbone');
Backbone.$ = require('jquery');
var Marionette = require('backbone.marionette');
var BabySitter = require('backbone.babysitter');
var _ = require('underscore');

var Container = Marionette.ItemView.extend({
  el: '#container',
  template: _.template('<h2>Fruits:</h2><ul class="children"></ul>'),
  childContainer: '.children',

  constructor: function(){
    this.children = new Backbone.ChildViewContainer();

    this.on('render', this._renderChildren);

    Marionette.View.apply(this, arguments);
  },

  initialize: function(options){
    options.views = options.views || [];

    // add child views passed in through options
    _.each(options.views, this.addChildView, this);
  },

  addChildView: function(view){
    this.children.add(view);

    // `this._isShown` gets set when the `show` event is triggered on the view.
    // This is setup via marionette.domRefresh[1], which gets called inside the
    // constructor of marionette.view[2].
    // 1. https://github.com/marionettejs/backbone.marionette/blob/0c6447179e7bd1243061a6cbe7f59b791c7f2028/src/marionette.domRefresh.js#L12 
    // 2. https://github.com/marionettejs/backbone.marionette/blob/0c6447179e7bd1243061a6cbe7f59b791c7f2028/src/marionette.view.js#L21
    if( this._isShown ){
      this._renderChildView(view, this.$(this.childContainer));
    }
  },

  removeChildView: function(view){
    this.children.remove(view);
    this.render();
  },

  _renderChildren : function(){
    // check if there's a container element. if there is, use it. if not use the parent
    var $el = this.$el;
    if( this.childContainer ){
      $el = this.$(this.childContainer);
    }
    // clear everything out
    $el.empty();

    // iterate over each child and render it
    this.children.each(function(child){
      this._renderChildView(child, $el);
    }, this);
  },

  _renderChildView : function(view, $el){
    $el = $el || this.$el;
    $el.append(view.render().$el);
  }
});


var View = Marionette.ItemView.extend({
  template: _.template('<li><%= name %></li>'),

  initialize: function(options){
    this.name = options.name;
  },

  serializeData: function(){
    return {
      name: this.name
    };
  }
});

// initialize child views
var view1 = new View({name: 'Apple'});
var view2 = new View({name: 'Banana'});
var view3 = new View({name: 'Cherry'});

// initialize container with two child views
var container = new Container({ views: [view1, view2]});

// render and show container
container.render();
container.trigger('show');

// example of adding a child view
// since `.trigger('show')` was called, view3 should be rendered immediately
container.addChildView(view3);

// Example of removing a child view
container.removeChildView(view2);
