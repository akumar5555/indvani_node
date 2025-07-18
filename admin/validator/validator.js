exports.userSignupValidations = {
    
    "body": {
       'name': {
           notEmpty: true,
           errorMessage: 'Name is Required'
       },
       'mobile': {
           notEmpty: true,
           matches: {
               options : [/^[0-9]{10}$/],
               errorMessage: 'Please enter valid Mobile number' // Error message for the parameter
           },
           errorMessage: 'Password is Required'
       },
       'email': {
           notEmpty: true,
           matches: {
               options : [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/],
               errorMessage: 'Please enter valid Email' // Error message for the parameter
           },
           errorMessage: 'Password is Required'
       }
    }
};