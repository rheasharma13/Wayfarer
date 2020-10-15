
//Including necessary packages and models
var express = require("express"),
  app = express(),
  bodyparser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  passportLocal = require("passport-local"),
  passportMongoose = require("passport-local-mongoose"),
  User = require("./models/auth-demo.js"),
  methodOverride = require("method-override"),
  flash = require("connect-flash");


mongoose.set('useNewUrlParser', true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb+srv://rhea:rhea130201@cluster0-qlhq7.mongodb.net/tour_spot?retryWrites=true&w=majority");
app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.use(flash());
app.locals.moment = require("moment");
app.use(methodOverride("_method"));
//Setting up passport
app.use(require("express-session")(
  {
    secret: "Rhea is upset",
    resave: false,
    saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.user = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
//Comments Model
var commentSchema = new mongoose.Schema(
  {
    text: String,
    author:
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);
var Comment = mongoose.model("comment", commentSchema);

//Review Model
var reviewSchema = new mongoose.Schema({
  rating: {
    // Setting the field type
    type: Number,
    // Making the star rating required
    required: "Please provide a rating (1-5 stars).",
    // Defining min and max values
    min: 1,
    max: 5,
    // Adding validation to see if the entry is an integer
    validate: {
      // validator accepts a function definition which it uses for validation
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value."
    }
  },
  // review text
  text: {
    type: String
  },
  // author id and username fields
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  // spot associated with the review
  spot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TourSpots"
  }

  // if timestamps are set to true, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.

});

var Review = mongoose.model("review", reviewSchema);

//TourSpot Model
var tourspotSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    image: String,
    description: String,
    author:
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String
    },
    comments: [commentSchema],
    likes: [User.schema],
    createdAt: {
      type: Date,
      default: Date.now
    },
    reviews: [Review.schema],
    rating: {
      type: Number,
      default: 0
    }

  });


var TourSpots = mongoose.model("tourspot", tourspotSchema);

// Configuring Multer and Cloudinary for image upload feature
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: "dbjepboix",
  // api_key: api_key,
  // api_secret: api_secret
});






//Root Route
app.get("/", function (req, res) {
  res.render("landingpage.ejs");

});
app.get("/about",function(req,res)
{
  res.render("about.ejs");
});

//display tourspots
app.get("/tourspots", function (req, res) {

  TourSpots.find({}, function (err, spotsdb) {
    if (err) console.log("error encountered");
    else res.render("tourspots.ejs", { spots: spotsdb, user: req.user });
  });

});

//Post Route for entering a new TourSpot
app.post("/", isLoggedIn, upload.single("image"), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (result) {
    // add cloudinary url for the image to the  object under image property
    req.body.spot.image = result.secure_url;
    // add author to campground
    req.body.spot.author = {
      id: req.user.id,
      username: req.user.username
    }
    TourSpots.create(req.body.spot, function (err, returnedspot) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect("/tourspots/" + returnedspot.id);
    });
  });

});

//Displays the form for a new tourspot
app.get("/createspot", isLoggedIn, function (req, res) {

  res.render("form.ejs", { user: req.user });

});

//Displaying information for a single TourSpot
app.get("/tourspots/:id", function (req, res) {
  TourSpots.findById(req.params.id, function (err, foundspot) {
    if (err) console.log(err)
    else {

      res.render("show.ejs", { foundspot: foundspot, user: req.user });
    }
  });

});

//POST Route for adding comments
app.post("/tourspots/:id", isLoggedIn, function (req, res) {
  var id = req.user._id;
  var username = req.user.username;
  var author = {
    id: id,
    username: username

  };
  var text = req.body.text;
  var id = req.params.id;
  TourSpots.findById(id, function (err, returnedspot) {
    if (err) console.log(err);
    else {
      var comm1 = new Comment(
        {

          text: text,
          author: author
        }
      );
      comm1.save();
      returnedspot.comments.push(comm1);
      returnedspot.save();
      var url = "/tourspots/" + id;
      res.redirect(url);
    }
  });
});

//Route for editing tourspots
app.get("/tourspots/:id/edit", function (req, res) {
  if (req.isAuthenticated()) {
    TourSpots.findById(req.params.id, function (err, foundspot) {
      if (err) res.render("/tourspots/:id");
      else {
        if (foundspot.author.id.equals(req.user.id))
          res.render("editspot.ejs", { foundspot: foundspot, user: req.user });
        else res.redirect("back");
      }


    });
  }
  else {

    req.flash("error", "Please login first!");
    res.redirect("/login");
  }

});

app.put("/tourspots/:id", function (req, res) {
  TourSpots.findByIdAndUpdate(req.params.id, req.body.spot, function (err, updatedspot) {

    if (err) res.redirect("/tourspots");
    else res.redirect("/tourspots/" + req.params.id);
  });
});

//Route for deleting tourspots
app.delete('/tourspots/:id', function (req, res) {

  if (req.isAuthenticated()) {

    TourSpots.findByIdAndRemove(req.params.id, function (err, deletedspot) {
      console.log(deletedspot);
      if (err) res.redirect("/tourspots/" + req.params.id);
      else {
        if (deletedspot.author.id.equals(req.user.id)) {
          res.redirect("/tourspots");
        }
        else res.redirect("back");
      }
    });
  }
  else {
    req.flash("error", "You must be logged in to do that!");
    res.redirect("/login");
  }
});

//Route for liking tourspots
app.post("/tourspots/:id/like", isLoggedIn, function (req, res) {
  TourSpots.findById(req.params.id, function (err, foundCampground) {
    if (err) {
      console.log(err);
      return res.redirect("/tourspots");
    }

    // check if req.user._id exists in foundCampground.likes
    var foundUserLike = foundCampground.likes.some(function (like) {
      return like.equals(req.user.id);
    });

    if (foundUserLike) {
      // user already liked, removing like
      foundCampground.likes.pull(req.user.id);
    } else {
      // adding the new user like
      foundCampground.likes.push(req.user);
    }

    foundCampground.save(function (err) {
      if (err) {
        console.log(err);
        return res.redirect("/tourspots");
      }
      return res.redirect("/tourspots/" + foundCampground.id);
    });
  });
});

app.get("/tourspots/:id/like", function (req, res) {
  res.redirect("/tourspots/" + req.params.id);
});
app.get("/tourspots/:id/reviews", function (req, res) {
  console.log(req.params.id);

  res.redirect("/tourspots/" + req.params.id);

});

function calculateAverage(reviews) {
  if (reviews.length === 0) {
    return 0;
  }
  var sum = 0;
  reviews.forEach(function (element) {
    sum += element.rating;
  });
  return sum / reviews.length;
}

app.post("/tourspots/:id/reviews", isLoggedIn, function (req, res) {
  //lookup campground using ID
  TourSpots.findById(req.params.id).populate("reviews").exec(function (err, campground) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    Review.create(req.body.review, function (err, review) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      //add author username/id and associated campground to the review
      review.author.id = req.user._id;
      review.author.username = req.user.username;
      review.spot = campground;
      //save review
      review.save();
      campground.reviews.push(review);
      // calculate the new average review for the campground
      campground.rating = calculateAverage(campground.reviews);
      //save campground
      campground.save();
      req.flash("success", "Your review has been successfully added.");
      res.redirect('/tourspots/' + campground.id);
    });
  });
});



//Routes for Register,Login And Logout
app.get("/register", function (req, res) {
  res.render("register.ejs", { user: req.user });
});

app.post("/register", function (req, res) {
  var username = req.body.username;

  User.register(new User({ username: username }), req.body.password, function (err, user1) {
    if (err) {
      req.flash("error", err.message);
      return res.render("register.ejs");
    }
    else {
      passport.authenticate("local")(req, res, function () {
        req.flash("success", "Registered successfully. Welcome to TourSpots " + user1.username);
        res.redirect("/tourspots");
      });
    }
  });
});



app.get("/login", function (req, res) {
  res.render("login.ejs", { user: req.user });
});

app.post("/login", passport.authenticate("local",
  {

    failureRedirect: "/login",

  }), function (req, res) {
  res.redirect(req.session.returnTo || '/');
  delete req.session.returnTo;
});

app.get("/logout", function (req, res) {
  req.logOut();
  req.flash("success", "Logged out successfully!")
  res.redirect("/tourspots");

});

//Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {

    return next();
  }
  req.session.returnTo = req.originalUrl;

  req.flash("error", "Please Log In first!");
  res.redirect("/login");

}

app.listen(process.env.PORT || 3000, function () {

  console.log("Server started");

});