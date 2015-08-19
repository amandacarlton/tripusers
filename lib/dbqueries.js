var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var bcrypt = require('bcrypt');
var trips = db.get('trips');
var comments = db.get('comments');


module.exports = {

  dayParse: function (input) {
  input = input.split("-");
  return (input[1]+"/"+input[2]+"/"+input[0]);
  },

  signup: function (bodyinfo) {
    var hash = bcrypt.hashSync(bodyinfo.password, 8);
    return users.insert({email:bodyinfo.email, password:hash});
  },

  edituser: function (info) {
    return users.findOne({_id:info});
  },

  updateUser: function (idinfo, bodyinfo) {
    var hash = bcrypt.hashSync(bodyinfo.password, 8);
    return users.update({_id:idinfo},{$set:
      {email:bodyinfo.email,
          password: hash
        }});

  },
  foo: function (userId) {
    return this.userdashboard(userId).then(function (dashboard) {
      return this.getTrips(dashboard);
    }.bind(this));
  },
  // TODO: unnest these promises
  // And also, not use dashboard outside of the promises...
  // OPTIONAL TODO: decompose this function (make smaller functions)
  // use Promise.all

  userdashboard: function (info) {
    return Promise.all([
      trips.find({userId:info}),
      comments.find({userId:info}),
      trips.find({invited:{$in:[info]}})
    ]).then(function (results) {
      return module.exports.getDashboardInfo(results);
    });
  },

   getDashboardInfo: function (results) {
    var dashboard ={};
    dashboard.places = results[0];
    dashboard.comments = results[1];
    dashboard.invites = results[2];
    return dashboard;
  },

  getTrips: function(dashboard) {
    if(dashboard.comments.length){
      var promiseTrips = dashboard.comments.map(function (comment, i) {
        return trips.findOne({_id:comment.tripId}).then(function (trip) {
           comment.destination = trip.name;
        });
      });
      return Promise.all(promiseTrips).then(function () {
        return dashboard;
      });
    } else {
      return dashboard;
    }
  },

  getEmails: function (tripInfo) {
    if(tripInfo.comments.length){
      var promiseUser = tripInfo.comments.map(function (comment, i) {
        return users.findOne({_id:comment.userId}).then(function (person) {
          comment.userEmail = person.email;
        });
      });
      return Promise.all(promiseUser);
    } else {
      return new Promise(function (success) {
        success(tripInfo);
      });
    }
  },

  newtrip: function (info, userinfo) {
    var startDate = info.sdate.split("-");
    startDate = (startDate[1]+"/"+startDate[2]+"/"+startDate[0]);
    var endDate = info.edate.split("-");
    endDate = (endDate[1]+"/"+endDate[2]+"/"+endDate[0]);
    return trips.insert({name:info.name,
      userId:userinfo,
      invited:[],
      startDate:startDate,
      endDate:endDate
    });
  },

  getTripInfo: function (results) {
   var tripInfo ={};
   tripInfo.places = results[0];
   tripInfo.comments = results[1];
   return tripInfo;
 },

  tripshow: function (info) {
    return Promise.all([
      trips.findOne({_id:info}),
      comments.find({tripId:info}),
    ]).then(function (results) {
      return module.exports.getTripInfo(results);
    }).then(function (tripInfo) {
      return users.find({_id:{$in:tripInfo.places.invited}}).then(function (invites) {
        tripInfo.invites = invites;
        return tripInfo;
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

  dateParse: function (date) {
    date = date.toString().split(" ").slice(1,5);
    var time = date[3].split(":");
    var meridiem = " a.m.";
    if(time[0]>12){
      meridiem = " p.m.";
      time[0]-=12;
    }
    time[2]+=meridiem;
    time = time.join(":");
    date[3]= time;
    date = date.join(", ");
    return date;

  },

  findUserById: function (comment) {
  return users.findOne({_id:comment.userId});
},

  findTripByID: function (comment) {
  return trips.findOne({_id:comment.tripId});
},



};
