import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import cities from "../../data/profile/pincode_IN.json";
import axios from "axios";
import Swal from "sweetalert2"

function UserProfile(props) {
  const [fname, setFname] = useState(props.user.fname);
  const [lname, setLname] = useState(props.user.lname);
  const [email, setEmail] = useState(props.user.email);
  const [mobile, setMobileNumber] = useState(props.user.mobile || " ");
  const [address, setAdress] = useState(props.user.address);
  const [addrcity, setCity] = useState(props.user.city || " ");
  const [zipcode, setZipCode] = useState(props.user.zipcode || " ");
  const [addrstatename, setStateName] = useState("Gujarat");
  const [addrcountry, setCountry] = useState("India");
  const [password, setPass] = useState("");

  useEffect(() => {
   
    if (zipcode && zipcode.length == 6) {
      fetch("https://api.postalpincode.in/pincode/" + zipcode)
        .then((response) => response.json())
        .then((responseJson) => {
          setCity(responseJson[0].PostOffice[0].District);
        })
        .catch((error) => {
          
        });
    }
    
  }, [zipcode, addrcity]);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  function updateProfile() {
    var ele = document.getElementById("btn_submit_updat_profile");
    ele.disabled = true;
    ele.style.backgroundColor = "Gray";
    if (password != null && password != "") {
      console.log(zipcode.length != 6 || mobile.length!=1 || address.length>0 ) 
      if (zipcode.length != 6 || mobile.length!=10  ) {
       
      if(zipcode.length!=6){
          ele.disabled = false;
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "pincode must be 6 digits",
           
          });
        }
       else if(mobile.length!=10 ){
        ele.disabled = false;
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "mobile number must be 10 letter",
           
          });
        }
         }
      else {
        signInWithEmailAndPassword(auth, email, password)
          .then((res) => {
            var typeofaccount;
            if (props.user.typeofacc == "worker") {
              typeofaccount = "worker";
            } else {
              typeofaccount = "client";
            }
            axios
              .post(`http://localhost:5000/update-user-${typeofaccount}/`, {
                fname: fname,
                lname: lname,
                email: email,
                mobile: mobile,
                address: address,
                addrcity: addrcity,
                zipcode: zipcode,
                addrstatename: addrstatename,
                addrcountry: addrcountry,
                uid: auth.currentUser.uid,
              })
              .then((res) => {
                if (res.status == 200) {
                  Swal.fire({
                    title: "profile update",
                    text: "succeffuly update profile",
                    icon: "success"
                  });
                  
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong!"
                    
                  });
                }
                ele.disabled = false;
                ele.style.backgroundColor = "#5bb543";
              });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text:"please enter valid password"
             
            });
            ele.disabled = false;
            ele.style.backgroundColor = "#5bb543";
          });
      }
    } else {
      ele.disabled = false;
      ele.style.backgroundColor = "#5bb543";
      Swal.fire({
        title: "The password?",
        text: "please enter password",
        icon: "question"
      });
    }
  }

  return (
    <div className="user-form">
      <form>
        <div className="row">
          <div className="col-lg-6">
            <label>
              First Name *
              <input
                type="text"
                name="fname"
                id="fname"
                value={fname}
                style={{
                  boxShadow:
                    fname && !fname.match(/^[a-zA-Z][a-zA-Z0-9]*$/)
                      ? "0px 1px 10px 0px rgb(255 0 0 / 50%)"
                      
                      : "",
                }}
                onChange={(e) => {
                  setFname(e.target.value);
                }}
                placeholder="Your first name"
              />
            </label>
          </div>
          <div className="col-lg-6">
            <label>
              Last Name *
              <input
                type="text"
                name="lname"
                id="lname"
                value={lname}
                style={{
                  boxShadow:
                    lname && !lname.match(/^[a-zA-Z][a-zA-Z0-9]*$/)
                      ? "0px 1px 10px 0px rgb(255 0 0 / 50%)"
                      
                      : "",
                }}
                onChange={(e) => {
                  setLname(e.target.value);
                }}
                placeholder="Your last name"
              />
            </label>
          </div>
          <div className="col-lg-6">
            <label>
              Contact Number
              <input
                type="number"
                name="number"
                id="number"
                value={mobile}
                style={mobile && {boxShadow: mobile.length!=10 && "0px 1px 10px 0px rgb(255 0 0 / 50%)"}}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                }}
                placeholder={"Phone"}
              />
            </label>
          </div>
          <div className="col-lg-6">
            <label>
              Email
              <input
                type="email"
                name="email"
                id="email"
                disabled={true}

                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="Your Email"
              />
            </label>
          </div>
          <div className="col-12">
            <label>
              Address
              <input
                type="text"
                name="address"
                id="address"
                value={address}
                onChange={(e) => {
                  setAdress(e.target.value);
                }}
              />
            </label>
          </div>
          <div className="col-lg-6">
            <div className="select-level level-b">
              <label>
                City
                <select
                  value={addrcity}
                  className=".nice-select"
                  onChange={(e) => {
                    setCity(e.target.value);
                  }}
                ><option  value={""}>select</option>
                  {cities.map((city) => {
                    return (
                      <option key={city.id} value={city.city}>
                        {city.city}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="select-level level-b">
              <label>
                State
                <input
                disabled={true}
                type="text"
                  name="state"
                  id="state"
                  value="Gujarat"
                  onChange={(e) => {
                    setStateName(e.target.value);
                  }}
                />
              </label>
            </div>
          </div>
          <div className="col-lg-6">
            <label>
              Zip Code
              <input
                type="number"
                name="zipcode"
                id="zipcode"
                value={zipcode}
                style={zipcode && {boxShadow: zipcode.length!=6 && "0px 1px 10px 0px rgb(255 0 0 / 50%)"}}
                onChange={(e) => {
                  setZipCode(e.target.value);
                }}
              />
            </label>
          </div>
          <div className="col-lg-6">
            <div className="select-level level-b">
              <label>
                Country
                <input
                                 disabled={true}

                  type="text"
                  name="country"
                  id="counry"
                  value="India"
                  onChange={(e) => {
                    setCountry(e.target.value);
                  }}
                />
              </label>
            </div>
          </div>
          <div className="col-12">
            <div className="form-inner">
              <label>
                Password*
                <i
                  onClick={() => togglePasswordVisibility()}
                  className={
                    !passwordVisible
                      ? "bi bi-eye-slash"
                      : "bi bi-eye-slash  bi-eye"
                  }
                  id="togglePasswordTwo"
                />
                <input
                  type={!passwordVisible ? "password" : "text"}
                  name="email"
                  autoComplete="new-password"
                  id="passwordTwo"
                  value={password}
                  onChange={(e) => {
                    setPass(e.target.value);
                  }}
                />
              </label>
            </div>

            <button
              id="btn_submit_updat_profile"
              type="button"
              onClick={updateProfile}
            >
              Update Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default UserProfile;
