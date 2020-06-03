### Notes

## API dcoumentation:
https://documenter.getpostman.com/view/10855582/SzmiXGW9?version=latest#95ceb690-95ce-469e-9af8-3e6a73b2c1df


Rakesh's Learnings manual:
Always use a relative route in Pug templates or (even in HTML)
This is because without a relative route the entire path doesnt get resolved completely.
ex: if src='img/tours.jpg' in a route like http://localhost:3001/tour the path of this becomes http://localhost:3001/tour/img/tours.jpg which is something that's not expected.
What is expected is http://localhost:3001/img/tours.jpg which is possible if src='/img/tours.jpg'


While using form to submit events, dodnot use hyphen(-) in the name property of an imput element.
e.target.<name> will fail when there is an hyphen
Ex (dont):<input name="password-confirm"> 

MULTER:
    req.body -> doesnt contain the file.
    req.file -> contains the information about the file

FORMDATA:
    new FormData().append(e.target.photo.files[0].name) deoesnt work !!
    new FormData().append(document.getElementById('photo').files[0]) Works 
Dodnot use the e.target to retreive the file when using multipart form data

AXIOS:

URL from REQUEST
    ${req.protocol}://${req.get('host')} gets http://<hostname:port>

ERROR RESPONSE FROM AXIOS
catch(error){
    error.response = 
        config: {url: "http://localhost:3001/api/v1/auth/login", method: "post", data: "{"email":"sophie@example.com","password":"test1234"}", headers: {…}, transformRequest: Array(1), …}
        data:
        error: {statusCode: 401, status: "fail", isOperational: true}
        message: "User with the email or password doesnt exist!!"
        stack: "Error: User with the email or password doesnt exist!!↵    at C:\Programming\nodejs\node-express-mongo-example\controllers\authController.js:64:11↵    at processTicksAndRejections (internal/process/task_queues.js:97:5)"
        status: "fail"
        __proto__: Object
        headers: {connection: "keep-alive", content-length: "375", content-type: "application/json; charset=utf-8", date: "Sat, 16 May 2020 10:29:23 GMT", etag: "W/"177-ZJYxl+Ucnw8sUD7FiXMPWqB4wbY"", …}
        request: XMLHttpRequest {readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, onreadystatechange: ƒ, …}
        status: 401
        statusText: "Unauthorized"
        __proto__: Object
}



https://mailtrap.io/
https://app.sendgrid.com/
https://mailsac.com/

TODO: testing sendgrid mail sendinfg is pendging due to sendgrid sender identity verifications process.