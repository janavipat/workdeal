import axios from "axios";
import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import styles from "../review/review.module.css";
function Review(props) {
  const [rating, setrating] = useState(0);
  const [review, setReview] = useState("");
  const [price, setPrice] = useState();
  const [disabled, setDisabled] = useState(false);

  
  const handleRatingChange = (value) => {
    setrating(value);
    
  }
  const fetchData = async () => {
    console.log(props.clientUid,props.workId)
    try {
       await axios .get("http://localhost:5000/get-last-data",{
        params:{
        workerid :auth.currentUser.uid,
         userid:props.uid
        }
      }).then((res)=>{
        if(res.data[0].ptype==="online"){
          setPrice(res.data[0].price)
       
          setDisabled(true);
        }
       else{
        setDisabled(false)
       }
      })
     } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); 
  const handleSubmit = () => {
    if (rating != 0 && review != "" && price != null) {
      axios.get("http://localhost:5000/get-review-score",{params:{
        text:review
      }}).then((data)=>{
        var s = data.data;
        if(!s){
          s=0;
        }
        var score = s;
        if(props.review_score && props.review_score!=0){
          score = (props.review_score+s)/2
        }
        if(!score || !Number.isInteger(score)){
          score=0;
        }
        axios
        .post("http://localhost:5000/set-review-worker", {
          uid: props.uid,
          clientUid: props.clientUid,
          workId: props.workId,
          name: props.name,
          review: review,
          rating: rating,
          price: price,
        })
        .then((res) => {
            axios.post('http://localhost:5000/set-review-score',{
              uid:props.uid,
              score:score,
            }).then((res)=>{
             
              props.closeDialog(false)              
            }).catch((err)=>{
              
            })
        })
        .catch((error) => {
         
        });
      })
    
    }else{
        window.alert("please enter valid fields")
    }
  }
 
  
  return (
    <div className="container d-flex justify-content-center ">
      <div className="row">
        <center>
          <div className="col-lg-12">
            <div className="stars">
           

    <div className={styles.rating}>
    {[...Array(5)].map((_, index=0) => {
        const ratingValue = index+1 ;
        
        return (
          <React.Fragment key={ratingValue}>
            <input
              type="radio"
              id={`rating-${ratingValue}`}
              name="rating"
              value={ratingValue}
              checked={rating === ratingValue}
              onChange={() => handleRatingChange(ratingValue)}
            />
            <label htmlFor={`rating-${ratingValue}`}>
              {ratingValue < rating ? '★' : '☆'}
            </label>
          </React.Fragment>
        );
      })}
    </div>
    {rating > 0 && (
    //   <div className={styles['emoji-wrapper']}>
        <div className={styles.emoji}>
          {rating === 5 && '😞'}
          {rating === 4 && '😐'}
          {rating === 3 && '😊'}
          {rating === 2 && '😃'}
          {rating === 1 && '😍'}
        </div>
    //   </div>
    )}

            </div>
          </div>
          <p>This helps us to provide better service</p>
        </center>

        <div className="col-lg-12">
          <div className="review-form">
            <label>
              Feedback
              <input
                type="text"
                value={review}
                onChange={(e) => {
                  setReview(e.target.value);
                }}
                placeholder="Your experience"
              />
            </label>

            <label>
              Amount taken by service provider
            
            {disabled ? <input
              type="number"
              value={price}
              
              placeholder={"Amount in rupees"}
            /> : <input onChange={(e) => {
             
              setPrice(e.target.value);
            }}
            type="number"
            value={price}
            />}
            </label>

            <button id="btn_submit_updat_profile" type="button" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Review;
