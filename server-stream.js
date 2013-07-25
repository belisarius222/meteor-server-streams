
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
  HerpDerps = new Meteor.Collection('herpderps');

  Meteor.subscribe('all-widgets');
  Meteor.subscribe('all-herpderps');
}

if (Meteor.isServer) {

  // named collection with null 'connection' doesn't store in mongo,
  // but since the collection is named,
  // a publish function will push the name down to the client
  // so the client will automatically store that in a collection of the same name.
  Widgets = new Meteor.Collection('widgets', {connection: null});

  // unnamed collection, requires that the publish function
  // declare a name for the collection so the client knows where to stick it
  HerpDerps = new Meteor.Collection(null);

  Meteor.publish('all-widgets', function() {
    return Widgets.find();
  });

  Meteor.publish('all-herpderps', function() {
    var self = this;

    // this is what the client will see.
    var collectionName = 'herpderps';

    var handle = HerpDerps.find().observeChanges({
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

  var herpderp = {
    herp: 'derp'
  };

  Meteor.startup(function() {
    Widgets.remove({});

    for (var i = 0; i < 10; i++) {
      Widgets.insert(widget);
    }

    HerpDerps.remove({});

    for (var j = 0; j < 10; j++) {
      HerpDerps.insert(herpderp);
    }
  });

  Meteor.methods({
    manufacture: function() {
      Widgets.insert(widget);
    },
    herpderp: function() {
      HerpDerps.insert(herpderp);
    }
  });
}
