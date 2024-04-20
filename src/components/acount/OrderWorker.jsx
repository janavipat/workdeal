import React, { useEffect,  useState } from "react";
import axios from "axios";
import { auth } from "../../firebase/firebase";
import DialogLayout from "../common/DialogLayout";
import { Dialog, DialogTitle, ToggleButton } from "@mui/material";
import Reqform from "./Reqform";
import TextField from "@mui/material/TextField";
import services from "../../data/service/creative_services.json";

function OrderWorker(props) {
  let [orders, setOrdersData] = useState([]);
  let [records, setRecods] = useState([]);
  const [orderPending, setOrderPending] = useState(0);
  const [orderComplete, setOrderComplete] = useState(0);
  const [paymentclick, setPaymentclick] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");
  const [currentTask, setCurrentTask] = useState();
  const [paymentType, setPaymentType] = useState("payment");
  const [req, setReq] = useState(false);
  const [description, setDescription] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [currentpage, setCurrentpage] = useState(0);
  const [npages, setNpages] = useState(1);
  const [recordsperpage, setRecordsPerpage] = useState(10);
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [location, setlocation] = useState([]);
  const [showmap, setShowmap] = useState(false);
  const [reload, setReload] = useState(false);

  function setOrderDataToDashboard() {
    let price = 0,
      count = 0;

    for (let i = 0; i < orders.length; i++) {
      if (orders[i].status === "completed") {
        price += orders[i].amount;
        count += 1;

        setOrderComplete(count);
      }
      setOrderPending(orders.length - count);
    }
    if (price != 0) {
      price /= count;
      props.setAvgPrice(price);
    }
  }

  async function startTheService(id, uid) {
    setReload(true);
    setDescription(true);

    if (!currentTask) {
      await axios
        .post("http://localhost:5000/set-current-work", {
          _id: id,
          uid: auth.currentUser.uid,
        })
        .then((res) => {
          if (res.status === 200) {
            getOrders();
            setShowAccept(true);
          }
        });

      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
      }

      // Success and error handlers for geolocation
      async function successHandler(position) {
        setShowAccept(true);

        // After getting the location, send it to the server
        await axios
          .post("http://localhost:5000/worlocation", {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            workid: uid,
          })
          .then((res) => {
            // Handle response if needed
            getOrders();
          })
          .catch((err) => {});
      }

      const errorHandler = (error) => {
        setError(error.message);
      };

      // Get the user's current position
      navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    } else {
      window.alert("please cancel current task");
    }
  }

  async function deleteTheService(id, uid) {
    setReload(true);
    await axios
      .post("http://localhost:5000/cancel-service", {
        _id: id,
      })
      .then((res) => {
        if (res.status == 200) {
          getOrders();
          setShowReject(true);
        }
      });
    try {
      const response = await axios.delete("http://localhost:5000/delete/", {
        params: {
          clientid: uid,
        },
      });
      if (response) {
        setdone(true);
      }
    } catch (error) {
      
    }
  }

  useEffect(() => {
    setOrderDataToDashboard();
  }, [orders]);

  useEffect(() => {
    props.pending(orderPending);
    props.complete(orderComplete);
  }, [orderPending, orderComplete]);

  async function getOrders() {
    if (auth.currentUser ) {
      const userid = await auth.currentUser?.uid;
      axios
        .post(`http://localhost:5000/get-orders-worker/`, {
          orderToUid: userid,
          category: category,
          name: name,
          price: price,
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
        .catch((error) => {});
    }
  }
  useEffect(() => {
    setNpages(Math.ceil(orders.length / recordsperpage));

    getOrders();
  }, [currentpage]);
  useEffect(() => {
    setNpages(Math.ceil(orders.length / recordsperpage));
    getOrders();
  }, [reload]);

  useEffect(() => {
    getOrders();
  }, [name, category, price]);

  useEffect(() => {
    getOrders();
    axios
      .get("http://localhost:5000/getdescriptions")
      .then((response) => {
        setDescription(response.data);
      })
      .catch((error) => {
        
      });
  }, []);

  const handlePayment = async (item) => {
    setPaymentMode("payment");
    setPaymentclick(true);

    await axios
      .post("http://localhost:5000/payment/", {
        ptype: "pending..",
        status: "pending..",
        workId: item.orderByUid,
        clientId: item.orderToUid,
        price: "0",
        description: "pending",
      })
      .then(() => {})
      .catch((error) => {
        
      });
    await axios
      .get("http://localhost:5000/status", {
        params: {
          workId: item.orderByUid,
          clientId: item.orderToUid,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        
      });
  };

  const ans = data.map((data) => {
    return data.status;
  });
  const handlePaymentDone = async (item) => {
    setPaymentType("offline");

    await axios
      .post("http://localhost:5000/update/", {
        ptype: "offline",
        workId: item.orderByUid,
        clientId: item.orderToUid,
      })
      .then(() => {
        setPaymentType("done");
      })
      .catch((error) => {
        
      });
  };

  const handleonline = async (item) => {
    await axios
      .post("http://localhost:5000/online/", {
        workId: item.orderByUid,
        clientId: item.orderToUid,
        status: "online",
      })
      .then(() => {
        setPaymentType("done");
      })
      .catch((error) => {
       
      });

    setReq(true);
    setPaymentType("online");
  };

  const closerequest = () => {
    setReq(false);
  };

  const getlocation = async (clientid) => {
    setShowmap(true);
    await axios
      .get("http://localhost:5000/get-location", {
        params: {
          clientid: clientid,
        },
      })
      .then((response) => {
        setlocation(response.data);
      })
      .catch((error) => {
       
      });
  };
  const latitude = location.map((data) => {
    return data.latitude;
  });
  const longitude = location.map((data) => {
    return data.longitude;
  });

  const closemap = () => {
    setShowmap(false);
  };
  const [doneloc, setdone] = useState(false);
  const done = async (uid) => {
    try {
      const response = await axios.delete("http://localhost:5000/delete/", {
        params: {
          clientid: uid,
        },
      });
      if (response) {
        setdone(true);
      }
    } catch (error) {
      
    }
  };

  const handleClick = () => {
    const destinationLat = latitude;
    const destinationLng = longitude;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}`;

    window.open(url, "_blank");
  };

  const handleSelectChangecg = (event) => {
    setCategory(event.target.value);
  };
  const handleSelectChangeprice = (event) => {
    setPrice(event.target.value);
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
    if (currentpage !== (currentpage + 1) * recordsperpage) {
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
      {showAccept && (
        <DialogLayout
          title={"Let's get to work"}
          content={
            "Please be in time and don't forget terms. Customers are our first priority. \nAll the best for your order"
          }
          buttonText={"DONE"}
        />
      )}
      {showReject && (
        <DialogLayout
          title={"Order Rejected"}
          content={
            "Please keep in mind that more rejections of work will lose your rating.\nThank you for work with WorkDeal"
          }
          buttonText={"DONE"}
        />
      )}

      <div
        className="service-selection wow animate fadeInUp"
        data-wow-delay="1800ms"
        data-wow-duration="1500ms"
      >
        <form action="#" method="post">
          <div className="row">
            <div className="col-lg-20">
              <div className="service-multi-slection">
                <TextField
                  id="outlined-basic"
                  label="NAME"
                  variant="outlined"
                  style={{ border: "1px solid #ddd", width: "800px" }}
                  onChange={(event) => setName(event.target.value)}
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
                  value={price}
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
          </div>
        </form>
      </div>
      {records && records.length > 0 ? (
        <>
        <div className="order-table" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr className="head">
                <th>Service Title</th>
                <th>Order ID</th>
                <th style={{ width: "10px" }}>Order By</th>
                <th>Order Ammount</th>
                <th>clientAddress</th>
                <th>Status</th>
                <th>Action</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {records.map((item) => (
                <tr key={item._id}>
                  <td data-label="Service Title">
                    <span>{item.service}</span>
                  </td>
                  <td data-label="Order ID">{item._id}</td>
                  <td data-label="Order By">{item.orderByName}</td>
                  <td data-label="Order Ammount">{item.amount}</td>
                  <td data-label="Address">{item.address}</td>
                  <td data-label="Status">{item.status}</td>
                  <td data-label="Action">
                    <div className="action">
                      {item.status == "pending" ? (
                        <div>
                          {!currentTask && (
                            <button
                              className="btn-current-task"
                              type="button"
                              onClick={() =>
                                startTheService(item._id, item.orderByUid)
                              }
                            >
                              accept
                            </button>
                          )}

                          <button
                            className="btn-current-task-delete"
                            type="button"
                            onClick={() =>
                              deleteTheService(item._id, item.orderByUid)
                            }
                          >
                            reject
                          </button>
                          {doneloc ? (
                            <button
                              type="button"
                              className="btn btn-info"
                              onClick={() => getlocation(item.orderByUid)}
                              disabled
                            >
                              LOCATION
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-info"
                              onClick={() => getlocation(item.orderByUid)}
                            >
                              LOCATION
                            </button>
                          )}
                          {showmap && !doneloc && (
                            <Dialog open={showmap} onClose={closemap}>
                              <DialogTitle>USER LOCATION ROUTE </DialogTitle>

                              <div>
                                <ToggleButton
                                  onClick={handleClick}
                                  style={{
                                    width: "40%",
                                    borderColor: "green",
                                    marginLeft: "7%",
                                    marginBottom: "10%",
                                  }}
                                >
                                  DIRECTION
                                </ToggleButton>

                                <ToggleButton
                                  onClick={() => done(item.orderByUid)}
                                  style={{
                                    width: "40%",
                                    borderColor: "green",
                                    marginTop: "-10%",
                                    marginLeft: "3%",
                                  }}
                                >
                                  {" "}
                                  done{" "}
                                </ToggleButton>
                              </div>
                            </Dialog>
                          )}
                        </div>
                      ) : item.status == "working" ? (
                        <div>
                          <button
                            className="btn-current-task-cancel"
                            type="button"
                          >
                            in progress
                          </button>
                          {paymentType != "payment" ? (
                            <button
                              className="btn-current-task"
                              type="button"
                              onClick={() => handlePayment(item)}
                              disabled
                            >
                              {paymentType}
                            </button>
                          ) : (
                            <button
                              className="btn-current-task"
                              type="button"
                              onClick={() => handlePayment(item)}
                            >
                              {paymentType}
                            </button>
                          )}

                          {paymentType == "payment" && (
                            <Dialog
                              open={paymentclick}
                              close={closerequest}
                              style={{ width: "100%", height: "100%" }}
                            >
                              <center>
                                <DialogTitle>
                                  select payment mode...
                                </DialogTitle>

                                <ToggleButton
                                  onClick={() => handlePaymentDone(item)}
                                  style={{
                                    width: "40%",
                                    borderColor: "green",
                                    marginLeft: "5%",
                                    marginBottom: "10%",
                                  }}
                                >
                                  {" "}
                                  offline{" "}
                                </ToggleButton>
                                <ToggleButton
                                  onClick={() => handleonline(item)}
                                  style={{
                                    width: "40%",
                                    borderColor: "green",
                                    marginTop: "-10%",
                                    marginLeft: "4%",
                                  }}
                                >
                                  {" "}
                                  online{" "}
                                </ToggleButton>
                              </center>
                            </Dialog>
                          )}
                          {paymentType == "online" && req && (
                            <Dialog open={req} onClose={closerequest}>
                              <DialogTitle>
                                Please fill details for online payment req ...{" "}
                              </DialogTitle>
                              <Reqform
                                workId={item.orderByUid}
                                clientId={item.orderToUid}
                                price={item.amount}
                                workername={item.orderToName}
                                closeDialog={setReq}
                              />
                            </Dialog>
                          )}
                          {doneloc && paymentType == "payment" ? (
                            <button
                              type="button"
                              className="btn btn-info"
                              onClick={() => getlocation(item.orderByUid)}
                              disabled
                            >
                              LOCATION
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-info"
                              onClick={() => getlocation(item.orderByUid)}
                            >
                              LOCATION
                            </button>
                          )}
                          {showmap && !doneloc && (
                            <Dialog open={showmap} onClose={closemap}>
                              <DialogTitle>USER LOCATION ROUTE </DialogTitle>

                              <div>
                                <ToggleButton
                                  onClick={handleClick}
                                  style={{
                                    width: "40%",
                                    borderColor: "green",
                                    marginLeft: "7%",
                                    marginBottom: "10%",
                                  }}
                                >
                                  DIRECTION
                                </ToggleButton>

                                <ToggleButton
                                  onClick={() => done(item.orderByUid)}
                                  style={{
                                    width: "40%",
                                    borderColor: "green",
                                    marginTop: "-10%",
                                    marginLeft: "3%",
                                  }}
                                >
                                  {" "}
                                  done{" "}
                                </ToggleButton>
                              </div>
                            </Dialog>
                          )}
                        </div>
                      ) : item.status == "completed" && ans ? (
                        <button className="btn-current-task" type="button">
                          completed
                        </button>
                      ) : item.status == "cancelled" ? (
                        <button
                          className="btn-current-task-cancel"
                          type="cancelled"
                        >
                          cancelled
                        </button>
                      ) : (
                        "Error"
                      )}
                    </div>
                  </td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
         
        </div>
        <div   className="paginatation wow animate fadeInUp"
          data-wow-delay="400ms"
          data-wow-duration="1500ms">
            <div className="entrie">
              
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
                      {n + 1}
                    </a>
                  </li>
                ))}

                <li className="page-item" style={{paddingRight:"10px"}}>
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
          <h3>No Orders Found</h3>
        </center>
      )}
    </div>
  );
}

export default OrderWorker;
