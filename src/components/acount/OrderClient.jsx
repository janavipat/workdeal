"use client"
import React, { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import { auth } from "../../firebase/firebase";
import { Dialog, DialogTitle, ToggleButton } from "@mui/material";
import Review from "../review/review";
// import Review from "../../pages/review";
import DialogLayout from "../common/DialogLayout";

import "react-toastify/dist/ReactToastify.css";
import Payment from "./Payment";
import { useRouter } from "next/router";
import Swal from "sweetalert";
import TextField from "@mui/material/TextField";
import services from "../../data/service/creative_services.json";
import Location from "../location/Location";

function OrderClient() {
  const router = useRouter();
  const { query } = router;
  let [records, setRecods] = useState([]);

  const [status, setStatus] = useState();
  let [orders, setOrdersData] = useState([]);
  const [itemToComplete, setItemToComplete] = useState({});
  const [payment, setPayment] = useState(false);
  const [Submit, setSubmit] = useState(false);
  const [names, setNames] = useState("");
  const [category, setCategory] = useState("");
  
  const [prices, setPrice] = useState("");
const[locationshow , setLocationshow] = useState(false);
const [currentpage, setCurrentpage] = useState(0);
  const [npages, setNpages] = useState(1);
  const [recordsperpage, setRecordsPerpage] = useState(10);
  const [uid, setUid] = useState();
  const [clientUid, setClientUid] = useState();
  const [name, setName] = useState();
  const [workId, setWorkId] = useState();
  const [review_score, setReviewScore] = useState();
  const [worlatitude , setWorlatitude] = useState(null);
  const[worlongitude , setWorlongitude] = useState(null);
  const [data, setData] = useState([]);
  const [workname, setWorkname] = useState();

  async function getOrders() {
    if (auth.currentUser) {
      const userid = auth.currentUser?.uid;
      axios
        .post(`http://localhost:5000/get-orders-client/`, {
          orderByUid: userid,
          category:category,
          name:names,
          price:prices
        })
        .then((res) => {
         setOrdersData(res.data);

          setNpages(Math.ceil(res.data.length / recordsperpage));

          setRecods(
            res.data.slice(
              (currentpage + 1) * recordsperpage - recordsperpage,
              (currentpage + 1) * recordsperpage
            )
          );
        })
        .catch((error) => {
          console.log("get order")
        });
      axios
        .get("http://localhost:5000/get-review-score-from-service", {
          params: { uid: auth.currentUser.uid },
        })
        .then((res) => {
          setReviewScore(res.data.review_score);
        });
    }
    
  }
  useEffect(() => {
    setNpages(Math.ceil(orders.length / recordsperpage));

    getOrders();
  }, [currentpage]);
  useEffect(() => {
    setNpages(Math.ceil(orders.length / recordsperpage));
    getOrders();
  }, []);
  useEffect(()=>{
    getOrders()
  },[names,category,prices])
  function getCurrentComplete(id) {
    for (let i = 0; i < orders.length; i++) {
      if (orders[i]._id == id) {
        setUid(orders[i].orderToUid);
        setClientUid(orders[i].orderByUid);
        setName(orders[i].orderByName);
        setWorkId(orders[i]._id);
      }
    }
    setOpenReview(true);
  }

  useEffect(() => {
    if (query.latitude && query.longitude) {
      axios
        .post("http://localhost:5000/location", {
          longitude: query.longitude,
          latitude: query.latitude,
          clientid: auth.currentUser.uid,
          // workerid:,
        })
        .then((res) => {
        })
        .catch((err) => {
          
        });
    }
  }, [query.longitude, query.latitude]);
  async function cancelTheService(id) {
    setStatus("cancelled");
    await axios
      .post("http://localhost:5000/cancel-service", {
        _id: id,
      })
      .then((res) => {
        if (res.status == 200) {
          getOrders();
          setShowCancel(true);
        }
      });
  }
 
  function isCompleted(id, uid, workid, name) {
    setItemToComplete({ id: id, uid: uid });
    setWorkname(name);
    setShowCompleted(true);
    setPayment(true);
    window.href = "/account";

     

    if (query && Object.keys(query).length > 0 && query.status) {
      // Query parameters are present

      axios
        .post("http://localhost:5000/done/", {
        
            workId: workid,
            clientId: uid,
            status: "done",
          
        })
        .then(() => {
          // Handle success if needed
        })
        .catch((error) => {
          
        });
    } else {
      // Query parameters are not present
      
      axios
        .get("http://localhost:5000/client", {
          params: {
            workId: workid,
            clientId: uid,
          },
        })
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          
        });
    }
  }
  const ans = data.map((data) => {
    return data.status;
  });
  const type = data.map((data) => {
    return data.ptype;
  });
  const price = data.map((data) => {
    return data.price;
  });
  const description = data.map((data) => {
    return data.description;
  });

  async function completeTheservice() {
    await axios
      .post("http://localhost:5000/complete-service", {
        _id: itemToComplete.id,
      })
      .then((res) => {
        getOrders();
        getCurrentComplete(itemToComplete.id);
        setShowCompleted(false);
        setWorkCount(itemToComplete.uid);
      })
      .catch((error) => {
       
      });

      const response =  axios.delete("http://localhost:5000/wordelete/", {
        params: {
          workid: auth.currentUser.uid,
        },
      });
  }

  async function setWorkCount(orderToUid) {
    const uid = orderToUid;
    axios
      .get("http://localhost:5000/get-work-count", {
        uid: uid,
      })
      .then((res) => {
        axios
          .post("http://localhost:5000/set-work-count", {
            uid: uid,
            count: res,
          })
          .then((res) => {})
          .catch((err) => {
           
          });
      })
      .catch((err) => {
        
      });
  }

  useEffect(() => {
    getOrders();
   
  }, []);

  const [openReview, setOpenReview] = useState(false);
  const closeReview = () => {
    setOpenReview(false);
  };

  const [showCancel, setShowCancel] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const handleSubmit = () => {
    // Submit logic here, for example, you can make an API call to save the form data
    // Show toast notification
    Swal({
      title: "Payment Confirmation",
      text: `Your payment request from ${workname} with price ${price} for ${description} has been submitted. Do you want to proceed with the payment?`,
      icon: "warning",
      showCancelButton: true,
      showconfirmButton: true,
      confirmButtonText: "Yes, proceed with payment",
      cancelButtonText: "No, cancel",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
    }).then((result) => {
      if (!result.isConfirmed) {
        // Proceed with payment
        setSubmit(true);
      } else {
        // Handle cancellation
        swal("cancle online request!", "please done your payment process....", {
          icon: "error",
          buttons: {
            confirm: {
              className: "btn btn-danger",
            },
          },
        }).then(() => {
          window.location.href = "/account?status=cancle";
        });
      }
    });
  };
  const closeno = () => {
    swal(
      "!Feedback fosters growth, empowers improvement, builds trust, enhances communication, and ensures mutual understanding between workers and customers",
      {
        buttons: false,
        timer: 3000,
      }
    );
  };
  const handleSelectChangecg = (event) => {
    setCategory(event.target.value);
  };
  const handleSelectChangeprice = (event) => {
    setPrice(event.target.value);
  };

  
  const locationclick= ()=>{
   
    
    axios
    .get("http://localhost:5000/wor-get-location", {
        params: {
            workid: auth.currentUser.uid
        }
    })
    .then((response) => {
      
        setData(response.data);
    
        setWorlatitude(response.data[0].latitude);
        setWorlongitude(response.data[0].longitude); 
        if(worlatitude!==null && worlongitude!==null){setLocationshow(true);}
      
    })
    .catch((error) => {
       
    });
      
  }
  useEffect(()=>{
    locationclick();
  },[])
  const closeshowlocation = () => {
    setLocationshow(false);
  };
  
  function changepage(id) {
    setCurrentpage(id);
  }
  function prepage() {
    if (currentpage !== 0) {
      setCurrentpage(currentpage - 1);
    }
  }
  function nextpage() {
    if (currentpage !== ((currentpage + 1) * recordsperpage
    )) {
      setCurrentpage(currentpage + 1);
    }
  }
  return (
    <div
      className="tab-pane fade"
      id="v-pills-order"
      role="tabpanel"
      aria-labelledby="v-pills-order-tab"
    >
      <Dialog open={openReview} onClose={closeReview}>
        <DialogTitle>Please rate the service</DialogTitle>

        <Review
          uid={uid}
          clientUid={clientUid}
          name={name}
          review_score={review_score}
          workId={workId}
          closeDialog={setOpenReview}
        />
      </Dialog>

      {(locationshow && worlatitude!==null && worlongitude!==null ) &&(
       
        <Dialog open={locationshow} onClose={closeshowlocation} PaperProps={{ style: { width: '1400px', maxWidth: '100%' } }}>
         
          <DialogTitle >Direction to get more info above worker</DialogTitle>
          
          <Location latitude={worlatitude} longitude={worlongitude} />
        </Dialog>)
}
      {showCancel && (
        <DialogLayout
          title={"service cancelled"}
          content={"Thank you for trying our platform\nhope you like it"}
          buttonText={"DONE"}
        />
      )}
      {showCompleted && (
        <Dialog open={showCompleted} close={close}>
          <center>
            <DialogTitle>Completed?</DialogTitle>
            <p
              style={{
                marginLeft: "30px",
                marginRight: "30px",
                marginBottom: "20px",
              }}
            >
              "is service provided by worker? please click 'YES' if work is
              done"
            </p>
          </center>
          <div className="row">
            <div className="col-6">
              <ToggleButton
                onClick={completeTheservice}
                style={{
                  width: "60%",
                  borderColor: "green",
                  marginLeft: "40%",
                  marginBottom: "10%",
                }}
              >
                YES
              </ToggleButton>
            </div>
            <div className="col-6">
              <ToggleButton
                onClick={closeno}
                style={{
                  width: "60%",
                  borderColor: "green",
                  marginTop: "0%",
                  marginLeft: "0%",
                }}
              >
                NO
              </ToggleButton>
            </div>
          </div>
        </Dialog>
      )}
      {type == "online" && ans == "online" && (
        <Dialog open={payment} close={close}>
          "please complete payment process"
          <ToggleButton onClick={handleSubmit}>PAYMENT</ToggleButton>
        </Dialog>
      )}
      {Submit && (
        <Dialog open={payment} close={close} style={{ width: "100%" }}>
          <Payment price={price} description={description} />
        </Dialog>
      )}

      <div className="all-order">
        <div className="order-head">
          <h3>All Order</h3>
        </div>
        <div className="col-lg-20">
          <div className="service-multi-slection">
            <TextField
              id="outlined-basic"
              label="NAME"
              variant="outlined"
              style={{ border: "1px solid #ddd", width: "800px" }}
              onChange={(event) => setNames(event.target.value)}
            />
            <select
              className="srv-select"
              style={{ padding: "10px 20px", border: "1px solid #ddd" }}
              onChange={(event) => handleSelectChangecg(event)}
              value={category}
            >
              <option value="">{auth.currentUser.category}</option>
              {services.map((service) => {
                return (
                  <option
                    key={service.service_name}
                    value={service.service_name}
                  >
                    {service.service_name}
                  </option>
                );
              })}
            </select>
            <select
              className="srv-select"
              style={{ padding: "10px 20px", border: "1px solid #ddd" }}
              onChange={(event) => handleSelectChangeprice(event)}
              value={prices}
            >
              <option value={500}>&lt;500</option>
              <option value={1000}>&lt;1000</option>
              <option value={2000}>&lt;2000</option>
              <option value={5000}>&lt;5000</option>
            </select>

            <button type="button" className="btn btn-success">
              Filter
            </button>
          </div>
        </div>

        {records  ? (
          <>
        <div className="order-table" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr className="head">
                <th>Service Title</th>
                <th>Order ID</th>
                <th>Order To</th>
                <th>Order Ammount</th>
                <th>Address</th>
                <th>Status</th>
                <th>Action</th>
                <th>location</th>
              </tr>
            </thead>
            {/* every single data*/}
            {records && (
              <tbody>
                {records.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Service Title">
                      <span>{item.service}</span>
                    </td>
                    <td data-label="Order ID">{item._id}</td>
                    <td data-label="Service Provider">{item.orderToName}</td>
                    <td data-label="Order Ammount">
                      {item.amount == 0 ? "Not Specified" : item.amount}
                    </td>
                    <td data-label="Address">{item.address}</td>
                    <td data-label="Status">{item.status}</td>
                    <td data-label="Action">
                      <div className="action">
                        {item.status == "pending" ? (
                          <button
                            className="btn-current-task"
                            type="button"
                            onClick={() => cancelTheService(item._id)}
                          >
                            cancel
                          </button>
                        ) : item.status == "working" ? (
                          <div>
                            <button
                              className="btn-current-task-cancel"
                              type="button"
                              onClick={() =>
                                isCompleted(
                                  item._id,
                                  item.orderToUid,
                                  item.orderByUid,
                                  item.orderToName
                                )
                              }
                            >
                              <a > completed?</a>
                            </button>
                          </div>
                        ) : item.status == "completed" ? (
                          <button className="btn-current-task" type="button">
                            completed
                          </button>
                        ) : item.status == "cancelled" ? (
                          <button
                            className="btn-current-task-cancel"
                            type="button"
                          >
                            cancelled
                          </button>
                        ) : (
                          "error"
                        )}
                      </div>
                    </td>
                    <td>
                      {item.status == "completed" || item.status == "cancelled"? <button
                        type="button"
                        className="btn btn-warning shadow-lg rounded-pill"
                        style={{ width: "120px", opacity: 0.8 }}
                       disabled
                      >
                        <i className="bi bi-geo-fill"></i> Location
                      </button>: <button
                        type="button"
                        className="btn btn-warning shadow-lg rounded-pill"
                        style={{ width: "120px", opacity: 0.8 }}
                        onClick={locationclick}
                      >
                        <i className="bi bi-geo-fill"></i> Location
                      </button>}
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="paginatation wow animate fadeInUp"
          data-wow-delay="400ms"
          data-wow-duration="1500ms"
          
          >
            <div className="entrie"  >
             
              <ul className="paginate">
                <li>
                  <a href="#" className="page-link" onClick={() => prepage()}>
                    Prev
                  </a>
                </li>

                {[...Array(npages).keys()].map((n) => (
                  <li
                    className={`${currentpage === n ? "active" : ""}`}
                    key={n + 1}
                  >
                    <a
                      href="#"
                      className="page-item"
                      onClick={() => changepage(n)}
                    >
                      {n+1}
                    </a>
                  </li>
                ))}

                <li className="page-item">
                  <a href="#" className="page-link" onClick={() => nextpage()}>
                    Next
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
        ) : (
          <center>
            <h3 style={{marginTop:"70px"}}>No Orders Found</h3>
          </center>
        )}
      </div>
      
    </div>
  );
}

export default OrderClient;
