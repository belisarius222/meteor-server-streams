
if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to server-stream.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });

  Widgets = new Meteor.Collection('widgets');
  Thangs = new Meteor.Collection('thangs');

  Meteor.subscribe('all-widgets');
  Meteor.subscribe('all-thangs');
}

if (Meteor.isServer) {

  // Actually, this stores things in mongo still ...
  // I guess the whole point of having collection: null is for the client
  // to be able to name its local collections. Oh well.
  Widgets = new Meteor.Collection('widgets', {connection: null});

  // unnamed collection, requires that the publish function
  // declare a name for the collection so the client knows where to stick it
  Thangs = new Meteor.Collection(null);

  Meteor.publish('all-widgets', function() {
    return Widgets.find();
  });

  Meteor.publish('all-thangs', function() {
    var self = this;

    // this is what the client will see.
    var collectionName = 'thangs';

    var handle = Thangs.find().observeChanges({
      added: function(id, doc) {
        self.added(collectionName, id, doc);
      },
      changed: function(id, fields) {
        self.changed(collectionName, id, fields);
      },
      removed: function(id) {
        self.removed(collectionName, id);
      }
    });

    self.onStop(function() {
      handle.stop();
    });
  });

  var widget = {
    meaning: 'none'
  };

  var thang = {
    herp: 'derp'
  };

  Meteor.startup(function() {
    Widgets.remove({});

    for (var i = 0; i < 10; i++) {
      Widgets.insert(widget);
    }

    Thangs.remove({});

    for (var j = 0; j < 10; j++) {
      Thangs.insert(thang);
    }
  });

  Meteor.methods({
    manufacture: function() {
      Widgets.insert(widget);
    },
    Thang: function() {
      Thangs.insert(thang);
    }
  });
}
