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

app.post("/update-profile-pic-worker", updateprofilepicwor);


app.post("/update-profile-pic-client", updateprofilepic);


app.post(`/update-user-worker/`, updateuserworker);


app.post(`/update-user-client`, updateuserclient);


app.post("/add_user",adduser);


app.post(`/get-orders-worker/`,getordersworker);


app.post("/check-for-order-placed",checkfororderplaced)


app.post("/set-order-work", setorderwork)

app.post(`/get-orders-client/`,getorderclient);




app.post("/set-avg-review-worker",setavgreviewworker);


app.post(`/get-review-worker`, getreview)


app.post(`/set-review-worker`, setreview);


app.post("/set-current-work",setcurrentwork);


app.post("/cancel-service", cancleservice);


app.post("/complete-service",completeservice);


//blog data
app.get("/blog",blog);



app.post("/payment", payment)


app.post("/update", updatecli);

app.post("/online", online);


app.post("/done", done);

app.post("/price", price);

 



app.get("/client", client);

app.get("/status", status);


app.get("/bookstatus", bookstatus);


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


app.post("/description", description)
app.get("/getdescriptions", getdescriptions)

                                                                                                // testimonial routes
app.post("/testinomial", testimonialcreate)
app.get("/test", fetchtestimonialdata);
  

                                                                                                    // news page routes
app.post("/news", setnews);

app.get("/market", getnews);
























app.post("/mail", nodemail);



module.exports = app;
