//URL for database
const db_url = 'https://6hbn8ssbg9.execute-api.us-east-1.amazonaws.com/default/RecallWizardDBLambda3';
let vendors;

 //called when you click on the 'dashboard' button in the nav bar
 function dashboardPage(){
     console.log('here');
	const cookie = decodeURIComponent(document.cookie);
         const userLevel = cookie.substring(cookie.indexOf('role=') + 5, cookie.indexOf('; recall'));
         console.log(userLevel);
		if (userLevel == "CPSC Investigator"){
			window.location.href = "CPSCInvestigatorPage.html";
		} else if (userLevel == "Seller"){
			window.location.href = "SellerPage.html";
		} else if (userLevel == "CPSC Manager"){
			window.location.href = "CPSCManagerPage.html";
		} else if (userLevel == "Vendor"){
			window.location.href = "VendorPage.html";
		}
 }
/*
    Called for each user dashboard. Shows user first and last name for each dashboard
    For CPSC investigators, creates a table that shows each recall assigned to them
*/
function showUserData(id) {
    if (id == null) {
        const para = document.createElement("p");
        const node = document.createTextNode("Something isnt working");
        para.appendChild(node);
        document.getElementsByClassName('profile')[0].appendChild(para);
        return;
    }
    //console.log(document.cookie);
    //console.log('user data. id: ' + id);
    const request = new XMLHttpRequest();
    const query = "select User_Email, User_First_Name, User_Last_Name, User_Phone, User_Level, User_Username from user where User_ID = '" + id + "'";
    //console.log(query);
    const newURL = updateQueryStringParameter(db_url, 'id', query);
    request.open('GET', newURL, true);
    request.onload = function() {
        user = JSON.parse(request.response)[0];
        //console.log(user);
        const para = document.createElement("p");
        let userText = ("Welcome " + user[1] + " " + user[2] + "!");
        //console.log("user role: " + user[4]);
        if (user[4] == "CPSC Investigator") {
            
            const request1 = new XMLHttpRequest();
            const query1 = "select Company_ID, Recall_Product_Name, Recall_Hazard, Recall_Priority, Recall_ID from recalls where Recall_User_ID = '" + id + "'";
            const newURL = updateQueryStringParameter(db_url, 'id', query1);
            request1.open('GET', newURL, true);
            request1.onload = function() {
                const recordCount = JSON.parse(request1.response);
                //console.log(recordCount);
                userText += " You have " + recordCount.length + " recalls assigned to you.";
                const node = document.createTextNode(userText);
                para.appendChild(node);
                document.getElementsByClassName('profile')[0].appendChild(para);
                createInvestigatorTable(recordCount);
            }
            request1.send();
        } else {
            const node = document.createTextNode(userText);
            para.appendChild(node);
            document.getElementsByClassName('profile')[0].appendChild(para);
        }
        
        
    }
    request.send();
}

/*
    Creates a table showing each recall assigned to a particular investigator
    Displays on the investigator dashboard
*/
function createInvestigatorTable(recalls) {
    console.log(recalls);
    const table = document.getElementById('investigatorRecallsBody');
    table.innerHTML = "";
    for (let i = 0; i < recalls.length; i++) {
        let row = table.insertRow(i);
        let company_id = row.insertCell(0);
        let name = row.insertCell(1);
        let hazard = row.insertCell(2);
        let search = row.insertCell(3);
        company_id.innerHTML = recalls[i][0];
        name.innerHTML = recalls[i][1];
        hazard.innerHTML = recalls[i][2];
        if (recalls[i][3] == "High") {
            hazard.parentElement.style.backgroundColor = "red";
			hazard.parentElement.style.color = "white";
        }
        
        let searchText = "<button onclick=";
        searchText += "searchForListings(" + recalls[i][4] + ")";
        searchText += ">Search for recall</button>";    
        search.innerHTML = searchText;    

        console.log(recalls[i][1]);
        
    }
}

/**
 * Opens the listings table and searches for a given listing
 */
function searchForListings(recall) {
    console.log(recall);
    document.cookie = "recall=" + recall;
    console.log(document.cookie);
    document.location.href = 'listingsSearch.html';
}


/**
 * Gets the user id of the currently logged in user
 * @returns 
 */
function getCurrId() {
    const cookie = decodeURIComponent(document.cookie);
        let id = cookie.substring(cookie.indexOf(' id=') + 4, cookie.indexOf('role') - 2);
        //console.log('id: ' + id);
        return id;
}

/**
 * Shows user information on their profile page
 * @param {*} id the id of the logged in user
 * @returns 
 */
function showProfile(id) {
    if (id == null) {
        const para = document.createElement("p");
        const node = document.createTextNode("Something isnt working");
        para.appendChild(node);
        document.getElementsByClassName('profile')[0].appendChild(para);
        return;
    }
    //console.log('user data. id: ' + id);
    const request = new XMLHttpRequest();
    const query = "select User_Email, User_First_Name, User_Last_Name, User_Phone from user where User_ID = '" + id + "'";
    const newURL = updateQueryStringParameter(db_url, 'id', query);
    request.open('GET', newURL, true);
    request.onload = function() {
        user = JSON.parse(request.response)[0];
        //console.log(user);
        const para = document.createElement("p");
        const node = document.createTextNode("Welcome " + user[1] + " " + user[2] + "!");
        para.appendChild(node);
        document.getElementsByClassName('profile')[0].appendChild(para);
        const sec = document.createElement("section");
        let secText = "<label>Email: " + user[0] + "</label><br>";
        secText += "<label>First Name: " + user[1] + "</label><br>";
        secText += "<label>Last Name: " + user[2] + "</label><br>";
        secText += "<label>Phone Number: " + user[3] + "</label><br>";
        sec.innerHTML = secText;
        document.getElementsByClassName('profile')[0].appendChild(sec);
    }
    request.send();
}


/**
 * Removes the current cookie
 * Called on login
 */
function clearCookie() {
    var cookies = decodeURIComponent(document.cookie).split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var equal = cookie.indexOf("=");
        var name = equal > -1 ? cookie.substring(0, equal) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    //console.log('Cookie cleared: ' + document.cookie);
}

/**
 * Changes the display so that users can change their password
 * @param {*} id the current user
 */
function startChangePassword(id) {
    const span = document.getElementsByClassName('passwordDiv')[0];
    span.innerHTML = "";
    let text = "<label>Enter your current password</label>";
    text += "<input type='password' class='oldPass'><br>";
    text += "<label>Enter your new password</label>";
    text += "<input type='password' class='newPass1'><br>";
    text += "<label>Re-enter your new password</label>";
    text += "<input type='password' class='newPass2'><br>";
    text += "<button name = 'submit' onclick='saveNewPassword(" + id + ")'>Save New Password</button>";
    span.innerHTML = text;
}

/**
 * Saves the user's new password
 * @param {*} id the user to be changed
 * @returns 
 */
function saveNewPassword(id) {
    if (document.getElementsByClassName('oldPass')[0].value == "") {
        alert('Please enter your old password');
        return;
    }
    if (document.getElementsByClassName('newPass1')[0].value == "" ||
    document.getElementsByClassName('newPass2')[0].value == "") {
        alert('Please enter your new password twice');
        return;
    }
    if (document.getElementsByClassName('newPass1')[0].value != document.getElementsByClassName('newPass2')[0].value) {
        alert('The passwords do not match');
        return;
    }

    //console.log(id);
    const userRequest = new XMLHttpRequest();
    const userQuery = "select * from user where User_ID = '" + id + "'";
    const userURL = updateQueryStringParameter(db_url, 'id', userQuery);
    userRequest.open('GET', userURL, true);
    userRequest.onload = function() {
        //console.log(JSON.parse(userRequest.response));
        //console.log(JSON.parse(userRequest.response)[0][3]);
        const user = JSON.parse(userRequest.response)[0];
        if (user[3] != document.getElementsByClassName('oldPass')[0].value) {
            alert('Incorrect password');
            return;
        }
        const newPass = document.getElementsByClassName('newPass1')[0].value;
        const request = new XMLHttpRequest();
        const query = "UPDATE user SET User_Password = '" + newPass + "' WHERE User_ID = '" + id + "';";
        const newURL = updateQueryStringParameter(db_url, 'id', query);
        request.open('GET', newURL, true);
        request.onload = function() {
            //console.log(JSON.parse(request.response));
            alert('Password successfully updated');
            document.getElementsByClassName('passwordDiv')[0].innerHTML = "";
        }
        request.send();
    }
    userRequest.send();
}

/**
 * Changes the login page to the registration page
 */
function startRegister() {
    getVendors();
    const span = document.getElementsByClassName('login')[0];
    const oldText = span.innerHTML;
    document.getElementsByClassName('light')[0].innerHTML = 'Create new account';
    span.innerHTML = "";
    let text = "<label>Name</label>";
    text += "<input type='text' class='name'><br>";
    text += "<label>Username</label>";
    text += "<input type='text' class='username'><br>";
    text += "<label>Email</label>";
    text += "<input type='email' class='email'><br>";
    text += "<label>Phone Number</label>";
    text += "<input type='tel' class='phone'><br>";
    text += "<label>Password</label>";
    text += "<input type='password' class='newPass1'><br>";
    text += "<label>Re-enter password</label>";
    text += "<input type='password' class='newPass2'><br>";
    /*<form>
  <input type='radio' id='CPSC_Investigator' name='role' value='CPSC Investigator'>
  <label for='CPSC_Investigator'>CPSC Investigator</label><br>
  <input type='radio' id='CPSC_Manager' name='role' value='CPSC Manager'>
  <label for='CPSC_Manager'>CPSC Manager</label><br>
  <input type='radio' id='Seller' name='role' value='Seller'>
  <label for='Seller'>Seller</label><br>
  <input type='radio' id='Vendor' name='role' value='Vendor'>
  <label for='Vendor'>Vendor</label><br></br>
</form>*/
    /*text += "<form><input type='radio' id='CPSC_Investigator' checked = 'checked' name='role' value='CPSC Investigator'><label for='CPSC_Investigator'>CPSC Investigator</label><br><input type='radio' id='CPSC_Manager' name='role' value='CPSC Manager'>";
    text += "<label for='CPSC_Manager'>CPSC Manager</label><br><input type='radio' id='Seller' name='role' value='Seller'><label for='Seller'>Seller</label><br>";
    text += "<input type='radio' id='Vendor' name='role' value='Vendor'><label for='Vendor'>Vendor</label><br></br></form>";*/


    text +="<select name='roles' id='roles' onchange='changedSelect()'>";
    text +=" <option value='CPSC Investigator'>CPSC Investigator</option>";
    text +=" <option value='CPSC Manager'>CPSC Manager</option>";
    text +=" <option value='Vendor'>Vendor</option>";
    text +=" </select>";
    text += "<button name = 'submit' onclick='endRegister()'>Register</button>";
    text += "<button name = 'cancel' onclick='cancelRegistration()'>Cancel</button>";
    span.innerHTML = text;
}

function changedSelect() {
    const select = document.getElementById('roles');
    let role = select.options[select.selectedIndex].text;
    const div = document.getElementById('vendorSelectDiv');
    if (role == 'CPSC Manager') {
        div.innerHTML = vendors;
    } else {
        div.innerHTML = "";
    }
}

function getVendors() {
    const request = new XMLHttpRequest();
    const query = "select * from vendor;";
    const newURL = updateQueryStringParameter(db_url, 'id', query);
    request.open('GET', newURL, true);
    request.onload = function() {
        vendorData = JSON.parse(request.response);
        vendors += "<label>Choose vendor</label>";
        vendors += "<select name='vendors' id='vendorSelectDrop' onchange='changedSelect()'>";
        for (let i = 0; i < vendorData.length; i++) {
            //selectText += "<option value='" + jsonUserData[i][0] + "'>" + jsonUserData[i][2] + "</option>";
            vendors += "<option value='" + i + "'>" + vendorData[i][2] + "</option>";
        }
        vendors +=" </select>";
        }

    request.send();
}

/**
 * Called when registration is clicked, registers the user information
 * @returns 
 */
function endRegister() {
    if (document.getElementsByClassName('name')[0].value == "") {
        alert('Please enter your name');
        return;
    }
    if (document.getElementsByClassName('username')[0].value == "") {
        alert('Please enter a username');
        return;
    }
    if (document.getElementsByClassName('newPass1')[0].value == "" ||
    document.getElementsByClassName('newPass2')[0].value == "")
    {
        alert('Please enter a password');
        return;
    }
    if (document.getElementsByClassName('newPass1')[0].value !=
    document.getElementsByClassName('newPass2')[0].value)
    {
        alert('Passwords do not match');
        return;
    }
    if (document.getElementsByClassName('email')[0].value == "") {
        alert('Please enter your email');
        return;
    }
    const name = document.getElementsByClassName('name')[0].value;
    const username = document.getElementsByClassName('username')[0].value;
    const password = document.getElementsByClassName('newPass1')[0].value;
    const email = document.getElementsByClassName('email')[0].value;;

    if (name.indexOf(' ') < 0) {
        alert('Please enter your first and last name');
        return;
    }

    let phone;
    if (document.getElementsByClassName('phone')[0].value != "") {
        phone = document.getElementsByClassName('phone')[0].value;
    } else {
        phone = null;
    }

    /*let role;
    const buttons = document.getElementsByName('role');
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].checked) {
            role = buttons[i].value;
        }
    }*/

    const select = document.getElementById('roles');
    let role = select.options[select.selectedIndex].text;
    let vendor;
    
    const firstName = name.substring(0, name.indexOf(' '));
    const lastName = name.substring(name.indexOf(' ') + 1, name.length);    
    const request = new XMLHttpRequest();
    let query;
    if (role == 'CPSC Manager') {
        vendor = document.getElementById('vendorSelectDrop').value;
        query = "insert into user (User_Email,User_Username,User_Password,User_First_Name,User_Last_Name,User_Phone,User_Level, Vendor_ID) values" + 
    "('" + email + "', '" + username + "', '" + password + "', '" + firstName + "', '" + lastName + "', '" + phone + "', '" + role + "', " + vendor + ");";
    } else {
        query = "insert into user (User_Email,User_Username,User_Password,User_First_Name,User_Last_Name,User_Phone,User_Level) values" + 
    "('" + email + "', '" + username + "', '" + password + "', '" + firstName + "', '" + lastName + "', '" + phone + "', '" + role + "');";
    }
    
    const newURL = updateQueryStringParameter(db_url, 'id', query);
    request.open('GET', newURL, true);
    request.onload = function() {
        const jsonData = JSON.parse(request.response)
        alert('Successfully registered');
        cancelRegistration();
    }
    request.send();
}

/**
 * Appends queries to the URL
 * @param {*} uri the database url
 * @param {*} key id
 * @param {*} value the query to be attached
 * @returns 
 */
function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}

function cancelRegistration() {
    document.getElementsByClassName('light')[0].innerHTML = 'Enter your login info';
    const span = document.getElementsByClassName('login')[0];
    let text = "<label for ='User_Username' class='loginbox'>Username</label><br><input type='text' name='User_Username'><br><label for ='User_Password'>Password</label><br>";
    text += "<input type='password' name='User_Password'><br><button onclick='login()' name='submit'>Login</button><button";
    text += "onclick='startRegister()' name='register'>Register New Account</button>";
    span.innerHTML = "";
    span.innerHTML = text;
}