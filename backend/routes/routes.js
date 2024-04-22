const express = require("express");
const fs = require("fs");
const servicesModel = require("../models/services");
const userModel = require("../models/search");
const ChatData = require("../models/ChatingModel");
const userClientModel = require("../models/users/userdataclient");
const userWorkerModel = require("../models/users/userdataworker");
const OrderWorker = require("../models/orders/workers");
const BlogData = require("../models/blog-data");
const app = express();
const cookieParser = require("cookie-parser");
const admin = require("../firebase-config");
const { response } = require("express");
const { default: mongoose } = require("mongoose");
app.use(cookieParser());
app.use(express.json());
const { spawn } = require("child_process");
const { exec } = require("node:child_process");
const { stringify } = require("querystring");
const { default: axios } = require("axios");
const { kill, title, env } = require("process");
const {fetchtestimonialdata, testimonialcreate} = require("../Controller/testimonial")
const{getallwork,getallreview ,getallclientdata, getallworkerdata} = require("../Controller/whychooseuscontroller")
const {servicedata, description, getdescriptions} = require("../Controller/servicecontroller");
const {worlocation,worlocdelete,worlocget} =require("../Controller/workerlocationcontrollers")
const {setnews, getnews, blog} = require("../Controller/newscontroller");
const {location,clilocdelete,clilocget} = require("../Controller/clientlocationcontroller")
const {getlastdata,payment, updatecli,online,done,price,client,status} = require("../Controller/paymentcontroller");
const { getreview,setreview}= require("../Controller/reviewcontroller");
const {paymentonline}= require("../Controller/onlinepaymentcontroller");
const {createuserworker,updateprofilepicwor,updateuserworker} = require("../Controller/userworkermodelcontroller");
const {createuserclient,getuserdata,updateprofilepic,updateuserclient} = require("../Controller/userclientmodelcontroller")
const { getreviewfromservice,setreviewscore,setworkcount,checkworkeractive,setworkeractive,setworkeroffline,setavgreviewworker} = require("../Controller/servicemodelcontroller");
const { getworkcount,getordersworker,bookstatus,completeservice,cancleservice,setcurrentwork,setorderwork,getorderclient,checkfororderplaced} = require("../Controller/orderworkcontroller")
var nodemailer = require('nodemailer');
const { adduser } = require("../Controller/usermodelcontroller");
const { nodemail } = require("../Controller/nodemail");
const stripe = require('stripe')('sk_test_51OrCeZSAHocqgcx771KeS0No8ILD5H3ba0KUqGP4PhbcXzNQEoP4f6UauapIwqbHGQLx6ONv78965sXps3TURez700KACnyUcb');

var loggedin = false;

app.get("/get-review-score", async (req, res) => {
  exec(
    "python pymodel/sentiment.py " +
    req.query.text,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send(error);
        return;
      }
      if (stderr) {
        console.error(`Python Error: ${stderr}`);
        res.status(500).send(error);
        return;
      }
      const prediction = stdout;
      console.log(prediction);
      res.send(prediction);
    }
  );
});

app.get("/get-review-score-from-service", getreviewfromservice);


app.post("/set-review-score", setreviewscore)


app.get("/get-work-count", getworkcount)


app.post("/set-work-count", setworkcount);




async function middleware(request, response, next) {
  loggedin = request.body.idtoken;
  if (loggedin != "false" && loggedin != undefined) {
    try {
      const verified = await admin.auth().verifyIdToken(loggedin);
      if (verified) {
        next();
      } else {
        response.status(400).send({ message: "expired1" });
        console.log("1");
      }
    } catch (error) {
      response.status(400).send({ message: "expired2" });
      console.log(error);
    }
  } else {
    response.status(400).send({ message: "expired3" });
    console.log("3");
  }
}

app.post("/create-user-client",createuserclient);



app.post("/checkworkeractive", checkworkeractive);


app.post("/setworkeractive",setworkeractive)


app.post("/setworkeroffline", setworkeroffline)
// (req, res) => {
//   servicesModel
//     .findOneAndUpdate(
//       { uid: req.body.uid },
//       {
//         $set: {
//           enabled: false,
//         },
//       }
//     )
//     .then(() => {
//       res.send("success");
//     })
//     .catch((error) => {
//       console.log(error);
//       res.send(error);
//     });
// });
                                                                                                  // service page routes
app.get("/data", servicedata)


app.post("/create-user-worker", createuserworker);
// async (request, response) => {
//   const signup = new userWorkerModel(request.body);
//   try {
//     await signup.save();
//     response.send(signup);
//   } catch (error) {
//     response.status(500).send(error);
//   }
// });

app.post(`/get-user-data/`,
 middleware, async (req, res) => {
  const worker = new userWorkerModel(req.body);
  const client = new userClientModel(req.body);
  const userid = req.body.uid;
  worker.collection.findOne({ uid: userid }, function (error, data) {
    if (error) {
      client.collection.findOne({ uid: userid }, function (error, data) {
        if (error) {
          res.status(404).send({ message: "user not found" });
        } else {
          res.send(data);
        }
      });
    } else {
      if (data == null) {
        client.collection.findOne({ uid: userid }, function (error, data) {
          if (error) {
            res.status(404).send({ message: "user not found" });
          } else {
            if (data != null) {
              res.send(data);
            } else {
              res.status(404).send({ message: "user not found" });
            }
          }
        });
      } else {
        res.send(data);
      }
    }
  });
});

                                                                                          // whychoose us page routes
app.get("/getallworkerdata", getallworkerdata)

app.get("/getallclientdata", getallclientdata)

app.get("/getallwork", getallwork)

app.get("/getallreview", getallreview)


app.get('/get-last-data', getlastdata)
// , function (req, res) {
//   const { userid, workerid } = req.query; // Use req.query to access query parameters
//    console.log(userid,workerid)
//   const data = paymentmodel.find({ clientId: userid, workId: workerid, status: "done" })
//     .sort({ _id: -1 })
//     .limit(1)
//     .then((data) => {
//       res.json(data);
//       console.log(data)
//     })
//     .catch((error) => {
//       res.status(500).json({ error: 'Internal server error' });
//     });
// });

app.post("/update-profile-pic-worker", updateprofilepicwor);
// async (req, res) => {
//   const worker = new userWorkerModel(req.body);
//   try {
//     const updatePP = await worker.collection.findOneAndUpdate(
//       { uid: req.body.uid },
//       {
//         $set: {
//           imageUrl: req.body.imageUrl,
//         },
//       }
//     );
//     res.send("success");
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

app.post("/update-profile-pic-client", updateprofilepic);
// async (req, res) => {
//   const client = new userClientModel(req.body);
//   try {
//     const updatePP = await client.collection.findOneAndUpdate(
//       { uid: req.body.uid },
//       {
//         $set: {
//           imageUrl: req.body.imageUrl,
//         },
//       }
//     );
//     res.send("success");
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

app.post(`/update-user-worker/`, updateuserworker);
// async (req, res) => {
//   const user = new userWorkerModel(req.body);
//   try {
//     const newdoc = await user.collection.findOneAndUpdate(
//       { uid: req.body.uid },
//       {
//         $set: {
//           uid: req.body.uid,
//           fname: req.body.fname,
//           lname: req.body.lname,
//           email: req.body.email,
//           mobile: req.body.mobile,
//           address: req.body.address,
//           city: req.body.addrcity,
//           zipcode: req.body.zipcode,
//           statename: req.body.addrstatename,
//           country: req.body.addrcountry,
//           typeofacc: "worker",
//         },
//       }
//     );
//     response.send(newdoc);
//   } catch (error) {
//     res.send(error);
//   }
// });

app.post(`/update-user-client`, updateuserclient);
// async (req, res) => {
//   const user = new userClientModel(req.body);
//   try {
//     const newdoc = await user.collection.findOneAndUpdate(
//       { uid: req.body.uid },
//       {
//         $set: {
//           uid: req.body.uid,
//           fname: req.body.fname,
//           lname: req.body.lname,
//           email: req.body.email,
//           mobile: req.body.mobile,
//           address: req.body.address,
//           address2: req.body.address2,
//           city: req.body.addrcity,
//           zipcode: req.body.zipcode,
//           statename: req.body.addrstatename,
//           country: req.body.addrcountry,
//           typeofacc: "client",
//         },
//       }
//     );
//     response.send(newdoc);
//   } catch (error) {
//     res.send(error);
//   }
// });

app.post("/add_user",adduser);
//  async (request, response) => {
//   const user = new userModel(request.body);

//   try {
//     await user.save();
//     response.send(user);
//   } catch (error) {
//     response.status(500).send(error);
//   }
// });

app.post(`/get-orders-worker/`,getordersworker);
// , async (req, res) => {
//   const { orderToUid, name, price, category } = req.body;
//   const filter = {};
//   filter.orderToUid = orderToUid;
//   // Apply filtering based on user-selected values
  

//   if (name) {
//     filter.orderByName = name;
//   } 

//   // Apply additional filtering based on price and category if provided
//   if (price) {
//     filter.amount = { $lt: parseInt(price) };
//   }

//   if (category) {
//     filter.service = category;
//   }

//   console.log(filter);
//   OrderWorker.find(filter).sort({ createdAt: -1 })
//     .then((workers) => {
//       res.json(workers);
      
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });


// async function checkOrderplaced(req, res, next) {
//   await OrderWorker.find({
//     orderByUid: req.body.orderByUid,
//     orderToUid: req.body.orderToUid,
//   })
//     .then((workers) => {
//       console.log(workers);
//       if (workers != null) {
//         var go = false;
//         for (var i = 0; i < workers.length; i++) {
//           if (workers[i].status != "completed" && workers[i].status != "cancelled") {
//             go = true;
//             break;
//           }
//         }
//         if (!go) {
//           next();
//         } else {
//           res.send("placed");
//         }
//       } else {
//         next();
//       }
//     })
//     .catch((error) => {
//       console.log(error);
//       res.send(error);
//     });
// }

app.post("/check-for-order-placed",checkfororderplaced)
// , checkOrderplaced, (req, res) => {
 
// });

app.post("/set-order-work", setorderwork)
// , checkOrderplaced, async (req, res) => {
  
//   const ordernow = new OrderWorker(req.body);
//   try {
//     await ordernow.save();
//     res.send("success");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error);
//   }
// });

app.post(`/get-orders-client/`,getorderclient);
// ,, async (req, res) => {
//   const { orderByUid, name, price, category } = req.body;
  
//   const filter = {};
//   filter.orderByUid = orderByUid;


//   if (name) {
//     filter.orderToName = name;
//   }

//   if (price) {
//     filter.amount = { $lt: parseInt(price) };
//   }

//   if (category) {
//     filter.service = category;
//   }

//   console.log(filter);
//   OrderWorker.find(filter)
//   .sort({ createdAt: -1 }) 
//   .then((workers) => {
//     res.json(workers);
//   })
//     .catch((error) => {
//       res.send(error);
//     });
// });



app.post("/set-avg-review-worker",setavgreviewworker);
//  async (req, res) => {
//   const rate = Number.parseInt(req.body.rate);
//   const userid = req.body.uid;
//   servicesModel
//     .findOneAndUpdate({ uid: userid }, { $set: { rating: rate } })
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

app.post(`/get-review-worker`, getreview)
// , async (req, res) => {
//   const userid = req.body.uid;

//   Review.find({ uid: userid })
//     .then((reviews) => {
//       res.json(reviews);
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });

// async function updatePrice(req, res, next) {
//   OrderWorker.findOneAndUpdate(
//     { _id: req.body.workId },
//     {
//       $set: {
//         amount: req.body.price,
//       },
//     }
//   )
//     .then((res) => {
//       next();
//     })
//     .catch((error) => {
//       res.status(500).send(error);
//     });
// }

app.post(`/set-review-worker`, setreview);
// , updatePrice, async (req, res) => {
//   const reviewModel = new Review(req.body);
//   try {
//     reviewModel.save();
//     res.send(reviewModel);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

app.post("/set-current-work",setcurrentwork);
//  async (request, response) => {
//   OrderWorker.findOneAndUpdate(
//     { _id: request.body._id },
//     {
//       $set: {
//         status: "working",
//       },
//     }
//   )
//     .then((res) => {
//       response.send("success");
//     })
//     .catch((error) => {
//       console.log(error);
//       response.status(400).send(error);
//     });
// });

app.post("/cancel-service", cancleservice);
// async (req, res) => {
//   OrderWorker.findOneAndUpdate(
//     { _id: req.body._id },
//     {
//       $set: {
//         status: "cancelled",
//       },
//     }
//   )
//     .then(() => {
//       res.send("success");
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });

app.post("/complete-service",completeservice);
//  async (req, res) => {
//   OrderWorker.findOneAndUpdate(
//     { _id: req.body._id },
//     {
//       $set: {
//         status: "completed",
//       },
//     }
//   )
//     .then(() => {
//       res.send("success");
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });

//blog data
app.get("/blog",blog);
//  async (req, res) => {
//   await BlogData.find()
//     .then((data) => {
//       console.log(data);
//       res.json(data);
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });


app.post("/payment", payment)
// , async (req, res) => {
//   const { ptype, status, workId, clientId, price, description } = req.body;

//   try {
//     // Create an instance of the Payment model
//     const payment = new paymentmodel({
//       ptype: ptype,
//       status: status,
//       workId: workId,
//       clientId: clientId,
//       price:price,
//       description:description // Corrected the variable name to match the destructure
//     });

//     // Save the payment to the database
//     const savedPayment = await payment.save();

//     res.send(savedPayment);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

app.post("/update", updatecli);
// , async (req, res) => {
//   const { workId, clientId, ptype } = req.body;
//   console.log(workId)
//   console.log(clientId)
//   console.log(ptype)

//   paymentmodel.findOneAndUpdate(
//     { workId: workId, clientId: clientId , ptype:"pending.."}, // Using both workId and clientId as conditions
//     {
//       $set: {
        
//         ptype: "offline",
//         status: "done"
//       },
//     }
//   )
//     .then(() => {
//       res.send("success");
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });
app.post("/online", online);
// , async (req, res) => {
//   const { workId, clientId, status } = req.body;
 
 
//   paymentmodel.findOneAndUpdate(
//     { workId: workId, clientId: clientId , ptype:"pending.." }, // Using both workId and clientId as conditions
//     {
//       $set: {
        
//         ptype: "online",
//         status: status
//       },
//     }
//   )
//     .then(() => {
//       res.send("success");
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });

app.post("/done", done);
// , async (req, res) => {
//   const { workId, clientId, status } = req.body;
//    console.log(workId)
//    console.log(clientId)
//    console.log(status)
   
//   const a = paymentmodel.findOneAndUpdate(
//     { workId: workId, clientId: clientId , ptype:"online", status:"online" }, 
//     {
//       $set: {
        
       
//         status: status
//       },
//     }
//   )
//     .then(() => {
//       res.send(a);
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });
app.post("/price", price);
// , async (req, res) => {
//   const { workId, clientId, description, price } = req.body;
 

//   paymentmodel.findOneAndUpdate(
//     { workId: workId, clientId: clientId , ptype:"online",price:"0"}, // Using both workId and clientId as conditions
//     {
//       $set: {
        
//         description: description,
//         price: price
//       },
//     }
//   )
//     .then(() => {
//       res.send("success");
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });

app.get("/client", client);
// , async (req, res) => {
//   try {
    
//     const data = await paymentmodel.find({
      
//       clientId: req.query.clientId,
//       workId: req.query.workId,
//       status: "online",
//       ptype:"online",
      
//     });
   
//     if (data) {
//       res.send(data);
//     } else {
//       res.send("0");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });
app.get("/status", status);
// , async (req, res) => {
//   try {
   
//     const data = await paymentmodel.find({
      
//       workId: req.query.workId,
      
//       clientId: req.query.clientId,
//       status: "done",
//       ptype:"online"
//     });
   
//     if (data) {
//       res.send(data);
//     } else {
//       res.send("0");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/bookstatus", bookstatus);
// async (req, res) => {
//   try {
//     const order = await OrderWorker.findOne({
//       // _id: req.body.id,
//       orderByUid: req.query.orderByUid
//       // Add other conditions if needed
//     });
    
//     if (!order) {
//       return res.status(404).send("Order not found");
//     }

//     res.send(order);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

                                                                                                  // location tracking endpoints

app.post("/location", location);

app.get("/get-location", clilocget);


app.delete("/delete", clilocdelete);

                                                                                                  //worker location routes
app.post("/worlocation", worlocation);

app.get("/wor-get-location",worlocget);


app.delete("/wordelete", worlocdelete);


















// payment methods

app.post('/create-checkout-session',paymentonline)
// , async (req, res) => {
//   try {
//      const { price } = req.body; 

//     const paymentIntent = await stripe.paymentIntents.create({
//        description: 'Software development services',
// shipping: {
//   name: 'Jenny Rosen',
//   address: {
//     line1: '510 Townsend St',
//     postal_code: '98140',
//     city: 'San Francisco',
//     state: 'CA',
//     country: 'US',
//   },
// },

// amount: price,
// currency: 'usd',
//     });
//     res.json({ client_secret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error('Error creating PaymentIntent:', error);
//     res.status(500).json({ error: 'Could not create PaymentIntent' });
//   }
// });

app.post("/description", description)
app.get("/getdescriptions", getdescriptions)

                                                                                                // testimonial routes
app.post("/testinomial", testimonialcreate)
app.get("/test", fetchtestimonialdata);
  

                                                                                                    // news page routes
app.post("/news", setnews);

app.get("/market", getnews);






















//chat endpoint

// app.get('/allusers', async (req, res) => {
//   const searchQuery = req.query.search;
 
  
//   const keyword = searchQuery
//     ? {
//         $or: [
//           { name: { $regex: searchQuery, $options: "i" } },
//           { email: { $regex: searchQuery, $options: "i" } }
//         ]
//       }
//     : {};

//   const users = await Promise.all([
//     userClientModel.find(keyword),
//     userWorkerModel.find(keyword)
//   ]);

//   // Merge the results from both collections
//   let mergedUsers = [].concat(...users);

//   // If the current user's ID is available, include it in the results
//   if (req.user_id) {
//     const currentUser = await userClientModel.findById(req.user_id);
//     if (currentUser) mergedUsers.push(currentUser);
//   }

//   res.send(mergedUsers);
// });

// app.post("/chat", async (req, res) => {
//   try {
//     const { senderid, receiverid, message } = req.body;

//     // Create a new chat instance
//     const chat = new ChatData({
//       participants: [senderid, receiverid],
//       messages: [{
//         sender: senderid,
//         recipient: receiverid,
//         message: message
//       }]
//     });

//     // Save the chat to the database
//     await chat.save();

//     res.status(201).json({ message: message });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to save chat" });
//   }
// });

app.post("/mail", nodemail);
// async (req, res) => {
//  const {name , email , subject, message} = req.body;
//  console.log(name, email, subject, message);
//  console.log(env.UserName, env.password);
//  const transporter = nodemailer.createTransport({
//  service:"gmail",
//  host: 'smtp.example.com',
  
//   port: 587,
//   secure: false,
//   auth: {
//       user:"janavipatel2002@gmail.com",
//       pass: "jknx wtyw crcl ppsq"
//   },
  
// });
  
//   var mailOptions = {
//     from: req.body.email, 
//     to: "janavipatel2002@gmail.com",
    
//     replyTo: req.body.name,
//     subject: req.body.subject,
//     text: req.body.message
//   };
  
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       res.send(info);
//       console.log('Email sent: ' + info.response);
//     }
//   });
// })


module.exports = app;
