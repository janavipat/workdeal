import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  useEffect,
  useReducer,
  useRef,
  useContext,
  useState,
} from "react";
import { auth } from "../../firebase/firebase";
import { MyContext } from "../context";
import axios from "axios";
// inital state data
const initialState = {
  activeMenu: "",
  menuOpen: false,
  scrollY: 0,
};

// usnig reducer to change logic
function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE":
      if (state.activeMenu === action.payload) {
        return { ...state, activeMenu: "", menuOpen: !state.menuOpen };
      } else {
        return {
          ...state,
          activeMenu: action.payload,
          menuOpen: !state.menuOpen,
        };
      }
    case "HOME_ONE":
      return { ...state, activeMenu: "home-one", menuOpen: !state.menuOpen };

    case "SERVICE":
      return { ...state, activeMenu: "service", menuOpen: !state.menuOpen };
    case "BLOG":
      return { ...state, activeMenu: "blog", menuOpen: !state.menuOpen };
    case "PAGES":
      return { ...state, activeMenu: "pages", menuOpen: !state.menuOpen };
    case "setScrollY":
      return { ...state, scrollY: action.payload };
    default:
      return { ...state };
  }
}
function Header1() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const currentRoute = useRouter().pathname;
  const headerRef = useRef(null);
  const [mobileHeader, setMobileheader] = useState(false);
  const [authentication, setAuthentication] = useState(null);
  const [image, setImage] = useState();
  const [typeoff, setTypeoff] = useState();
  const [fname, setFname] = useState();
  const { serviceType, updateVariable } = useContext(MyContext);

  const handleInitialServices = () => {
    updateVariable({ location: "", category: "", pricerange: "", rating: "" });
  };
  // menu fuction for toggle
  function handleMenu(menuName) {
    dispatch({ type: "TOGGLE", payload: menuName });
  }

  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        setAuthentication(user);
      } else {
      }
    });
    const getData = async () => {
      if (auth.currentUser) {
        const useruid = auth.currentUser.uid;
        const idtoken = await auth.currentUser.getIdToken();
        axios
          .post(`http://localhost:5000/get-user-data/`, {
            uid: useruid,
            idtoken: idtoken,
          })
          .then((data) => {
            if (data.status == 200) {
              
              setImage(data.data.imageUrl);
              setTypeoff(data.data.typeofacc);
              setFname(data.data.fname);
            } else {
              window.alert("something went wrong");
            }
          })
          .catch((error) => {
            if (error && error.response && error.response.status == 404) {
              window.location = "/login-google-required";
            } else {
              window.alert(error.message);
            }
          });
      }
    };

    getData();
  }, [authentication]);

  useEffect(() => {
    const burger = document.querySelector(".mobile-menu");
    const nav = document.querySelector(".main-nav");
    const menuClose = document.querySelector(".remove");
    burger.addEventListener("click", () => {
      nav.classList.add("slidenav");
    });
    menuClose.addEventListener("click", () => {
      nav.classList.remove("slidenav");
    });
  });


  useEffect(() => {
    const header = headerRef.current;

    function handleScroll() {
      if (window.pageYOffset > 0) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header ref={headerRef} className={"header-1 sticky_top"}>
      <div className="header-logo">
        <Link legacyBehavior href="/">
          <a>
            <img
              intrinsicsize="109x28"
              src={"assets/images/wlogo.png"}
              alt=""
            />
          </a>
        </Link>
      </div>
      <div className="main-menu">
        <nav className="main-nav">
          <div className="mobile-menu-logo">
            <Link legacyBehavior href="/">
              <a>
                <img src={"assets/images/wlogo.png"} alt="" />
              </a>
            </Link>
            <div className="remove">
              <i className="bi bi-plus-lg" />
            </div>
          </div>
          <ul>
            <li className="has-child active" style={{textDecoration:"none"}}>
              <Link legacyBehavior href="/">
                <a className={currentRoute === "/" ? "active" : ""}>Home</a>
              </Link>
            </li>
            <li>
              <Link legacyBehavior href="/about"  style={{textDecoration:"none"}}>
                <a className={currentRoute === "/about" ? "active" : ""}>
                  About Us
                </a>
              </Link>
            </li>
            <li>
              <Link legacyBehavior href="/service"  style={{textDecoration:"none"}}>
                <a
                  onClick={handleInitialServices}
                  className={currentRoute === "/service" ? "active" : ""}
                >
                  Services
                </a>
              </Link>
            </li>
            <li>
              <Link legacyBehavior href="/blog"  style={{textDecoration:"none"}}>
                <a className={currentRoute === "/blog" ? "active" : ""}>
                  News Feed
                </a>
              </Link>
            </li>
          </ul>
          <div className="my-account">
            <Link legacyBehavior href="/account" style={{textDecoration:"none"}}>
              <a>My Account</a>
            </Link>
          </div>
        </nav>
      </div>
      <div className="header-right mr-2">
        <div className="phone">
          <div className="icon">
            <img src="assets/images/icons/phone.svg" alt="" />
          </div>
          <div className="phn-info">
            <span>Call Us Now</span>
            <a href="tel:01701111000">+91 7844932404</a>
          </div>
        </div>

        <div className="account-btn" >
          <Link legacyBehavior href="/account">
            <a style={{ marginLeft: "-80px" }}>My Account</a>
          </Link>
        </div>
        <div className="thumb" onClick={() => (window.location = "/account")}>
          <center>
            {image ? (
              <img
                src={image}
                alt=""
                style={{
                  height: "50px",
                  width: "50px",
                  marginTop: "2px",
                  marginLeft: "19px",
                  marginRight: "40px",
                  boxShadow: "0 4px 8px rgba(228, 6, 6, 0.1)",
                  borderRadius: "50%", 
                }}
              />
            ) : (
              <i
                className="bi bi-person-circle"
                style={{
                  height: "50px",
                  width: "50px",
                  marginTop: "2px",
                  paddingTop: "14px",
                  marginLeft: "19px",
                  marginRight: "40px",
                  display: "inline-block",
                  boxShadow: "0 4px 8px rgba(228, 6, 6, 0.1)",
                  borderRadius: "50%",
                }}
              ></i>
            )}
          </center>
        </div>
        {fname && typeoff ? (
          <div className="phn-info" style={{ marginLeft: "-20px" }}>
            <h2>{typeoff}</h2>
            <p style={{ marginTop: "-26px" }}>{fname}</p>
          </div>
        ) : (
          ""
        )}
        <div
          className="mobile-menu"
          onClick={() => {
            setMobileheader(true);
          }}
        >
          <a
            className="cross-btn"
            onClick={() => {
              setMobileheader(false);
            }}
          >
            <span className="cross-top" />
            <span className="cross-middle" />
            <span className="cross-bottom" />
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header1;
