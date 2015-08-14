var db = require('monk')('localhost/tripusers');
var users = db.get('users');
var bcrypt = require('bcrypt');
var trips = db.get('trips');
var comments = db.get('comments');


module.exports = {

  signup: function (bodyinfo) {
    var hash = bcrypt.hashSync(bodyinfo.password, 8);
    return users.insert({email:bodyinfo.email, password:hash});
  },

  edituser: function (info) {
    return users.findOne({_id:info});
  },

  userdashboard:function (info) {
    var dashboard = {};
    return users.findOne({_id:info})
    .then(function (user) {
      return trips.find({userId:info})
      .then(function (places) {
        dashboard.places=places;
        return comments.find({userId:info})
        .then(function (comments) {
          console.log(comments);
          dashboard.comments=comments;
          console.log(dashboard);
          return trips.find({invited:{$in:[user._id]}})
          .then(function (invites) {
            dashboard.invites = invites;
            return dashboard;
          });
        });
      });
    });
  },

  newtrip: function (info, userinfo) {
    return trips.insert({name:info.name,
      userId:userinfo,
      invited:[],
      startDate:info.sdate,
      endDate:info.edate
    });
  },

  tripshow: function (info) {
    var show = {};
    return trips.findOne({_id:info})
    .then(function (trip) {
      show.trip = trip;
      return comments.find({tripId:info})
      .then(function (comments) {
        show.comments = comments;
        console.log(trip.invited);
        return users.find({_id:{$in:trip.invited}})
        .then(function (people) {
          show.people = people;
          console.log(show);
          return show;
        });
      });
    });
  },

  newcomment: function (info, userinfo, bodyinfo) {
    return comments.insert({tripId:info,
      userId:userinfo,
      message:bodyinfo,
      date: new Date()});
    },

    newinvite: function (bodyinfo, idinfo) {
      return users.findOne({email:bodyinfo})
      .then(function (user) {
        return trips.update({_id: idinfo}, {$push: {invited: user._id}})
        .then(function (trip) {
        });
      });
    },

    gettripedit: function (idinfo) {
      return trips.findOne({_id:idinfo});
    },

    getpostedit: function (idinfo, userinfo, bodyinfo) {
      return trips.update({_id:idinfo},{$set:
        {name:bodyinfo.name,
          userId:userinfo,
          startDate:bodyinfo.sdate,
          endDate:bodyinfo.edate}});
        },

        deletetrip: function (idinfo) {
          return trips.remove({_id:idinfo});
        },

        deletecomment: function (idinfo) {
          return comments.remove({_id:idinfo});
        },

        userlogin: function (bodyinfo) {
          return users.findOne({email:bodyinfo.email});

        },

      };
