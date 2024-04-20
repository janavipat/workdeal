import React, { useEffect } from 'react';
import Swal from 'sweetalert';



const Success = () => {

  useEffect(() => {
    Swal({
      title: 'Payment Done!',
      text: "Thank you for completing your secure online payment\n\t\tHave a great day!",
      icon: 'success',
      customClass: {
        confirmButton: 'btn btn-success'
      }
    }).then(() => {
      // Redirect to the account page upon confirmation
      window.location.href = '/account?status=success';
    });
  }, [])
  return (
    <>
    
    </>

  );
};

export default Success;
