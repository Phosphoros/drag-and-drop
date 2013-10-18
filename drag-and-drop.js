Notes = new Meteor.Collection("notes");

/// CLIENT CODE
if (Meteor.isClient) {

  Router.configure({
    layout: "layout"
  });

  Router.map(function() {
    this.route('main', {
      path: '/'
    });
  });

  TransientNotes = new Meteor.Collection("transientNotes");
  Meteor.subscribe("transientNotes");

  Template.allNotes.notes = function() {
    return Notes.find();
  };

  Template.draggableNote.helpers({
    top: function() {
      var transientNote = TransientNotes.findOne(this._id);
      if (transientNote)
        return transientNote.top;
      else
        return this.top;
    },
    left: function() {
      var transientNote = TransientNotes.findOne(this._id);
      if (transientNote)
        return transientNote.left;
      else
        return this.left;
    },
    width: function() {
      var transientNote = TransientNotes.findOne(this._id);
      if (transientNote)
        return transientNote.width;
      else
        return this.width;
    },
    height: function() {
      var transientNote = TransientNotes.findOne(this._id);
      if (transientNote)
        return transientNote.height;
      else
        return this.height;
    }
  });

  Template.layout.events({
    'click .add': function(evt, tmpl) {
      Notes.insert({
        top: 50,
        left: 50,
        width: 300,
        height: 200
      });
    }
  })

  Template.draggableNote.events({
    'click .remove': function(evt, tmpl) {
      Notes.remove({
        _id: this._id
      });
    },
    'mousedown .note .move': function(evt, tmpl) {
      Session.set("activeNoteMove", this._id);
      Session.set("offsetX", evt.pageX - parseInt(tmpl.find('.note').style.left, 10));
      Session.set("offsetY", evt.pageY - parseInt(tmpl.find('.note').style.top, 10));
      Session.set("width", parseInt(tmpl.find('.note').style.width, 10));
      Session.set("height", parseInt(tmpl.find('.note').style.height, 10));
    },
    'mouseup .note .move': function() {
      var id = Session.get("activeNoteMove");
      Notes.update(id, TransientNotes.findOne(id));
      Session.set("activeNoteMove", undefined);
    },
    'mousedown .note .scale': function(evt, tmpl) {
      Session.set("activeNoteScale", this._id);
      Session.set("offsetX", parseInt(tmpl.find('.note').style.left, 10));
      Session.set("offsetY", parseInt(tmpl.find('.note').style.top, 10));

      Session.set("width", parseInt(tmpl.find('.note').style.left, 10) - 10);
      Session.set("height", parseInt(tmpl.find('.note').style.top, 10) - 10);
    },
    'mouseup .note .scale': function() {
      var id = Session.get("activeNoteScale");
      Notes.update(id, TransientNotes.findOne(id));
      Session.set("activeNoteScale", undefined);
    }
  });

  Template.allNotes.events({
    'mousemove': function(evt) {
      if (Session.get("activeNoteMove")) {
        Meteor.call(
          "updateNote",
          Session.get("activeNoteMove"),
          evt.pageX - Session.get("offsetX"),
          evt.pageY - Session.get("offsetY"),
          Session.get("width"),
          Session.get("height"));
      }
      if (Session.get("activeNoteScale")) {
        Meteor.call(
          "updateNote",
          Session.get("activeNoteScale"),
          Session.get("offsetX"),
          Session.get("offsetY"),
          evt.pageX - Session.get("width"),
          evt.pageY - Session.get("height"));
      }
    }
  });
}

/// SERVER CODE
if (Meteor.isServer) {

  Meteor.methods({
    updateNote: function(id, left, top, width, height) {
      if (TransientNotes.findOne(id)) {
        TransientNotes.update(id, {
          $set: {
            top: Math.round(top / 10) * 10,
            left: Math.round(left / 10) * 10,
            width: Math.round(width / 10) * 10,
            height: Math.round(height / 10) * 10
          }
        });
      } else {
        TransientNotes.insert({
          _id: id,
          top: Math.round(top / 10) * 10,
          left: Math.round(left / 10) * 10,
          width: Math.round(width / 10) * 10,
          height: Math.round(height / 10) * 10
        });
      }
    }
  });


  TransientNotes = new Meteor.Collection("transientNotes", {
    connection: null
  });

  Meteor.publish("transientNotes", function() {
    return TransientNotes.find();
  });

  Meteor.startup(function() {
    // if (Notes.find().count() === 0) {
    Notes.remove({});
    Notes.insert({
      top: 100,
      left: 50,
      width: 300,
      height: 200
    });
    Notes.insert({
      top: 200,
      left: 300,
      width: 300,
      height: 200
    });
    // }
  });
}